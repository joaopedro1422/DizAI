import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { ContatoIgnorado, NovoContatoIgnorado } from '../models/contato.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';
import { chaveTelefone } from '../utils/telefone.utils';

type ContatoIgnoradoApi = Omit<ContatoIgnorado, 'adicionadoEm' | 'nome'> & { nome: string | null; adicionadoEm: string };

interface ContatosAdicionadosApi {
  adicionados: number;
  contatos: ContatoIgnoradoApi[];
}

/**
 * Números que o assistente nunca responde: /api/perfis/{perfilId}/contatos-ignorados
 * O backend consulta esta lista a cada mensagem recebida, antes de deixar a IA responder.
 */
@Injectable({ providedIn: 'root' })
export class ContatoIgnoradoService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly lista = signal<ContatoIgnorado[]>([]);
  private readonly carregamento = new CarregamentoUnico();

  readonly contatos = this.lista.asReadonly();
  readonly carregando = this.carregamento.carregando;

  /** Chaves (só dígitos) dos números ignorados, para checar duplicados rapidamente. */
  readonly numerosIgnorados = computed(() => new Set(this.lista().map((contato) => chaveTelefone(contato.whatsapp))));

  carregar(): Promise<void> {
    return this.carregamento.executar(async () => {
      const contatos = await firstValueFrom(this.http.get<ContatoIgnoradoApi[]>(this.url()));
      this.lista.set(contatos.map(paraContato));
    });
  }

  estaIgnorado(whatsapp: string): boolean {
    return this.numerosIgnorados().has(chaveTelefone(whatsapp));
  }

  /** Adiciona os contatos; o backend pula os que já estão na lista. Devolve quantos entraram de fato. */
  async adicionar(novos: NovoContatoIgnorado[]): Promise<number> {
    const resposta = await firstValueFrom(
      this.http.post<ContatosAdicionadosApi>(this.url(), {
        contatos: novos.map((novo) => ({ ...novo, nome: novo.nome.trim() })),
      }),
    );
    const adicionados = resposta.contatos.map(paraContato);
    this.lista.update((lista) => [...adicionados, ...lista]);
    return resposta.adicionados;
  }

  async remover(contatoId: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url(`/${contatoId}`)));
    this.lista.update((lista) => lista.filter((contato) => contato.id !== contatoId));
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.lista.set([]);
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/contatos-ignorados${caminho}`);
  }
}

function paraContato(contato: ContatoIgnoradoApi): ContatoIgnorado {
  return { ...contato, nome: contato.nome ?? '', adicionadoEm: new Date(contato.adicionadoEm) };
}
