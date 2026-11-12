import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import {
  ContatoSugerido,
  DiaLivre,
  Individuais,
  Oportunidade,
  PreviaCampanha,
  RascunhoCampanha,
  ResultadoCampanha,
  ResumoCampanha,
  SituacaoCampanhas,
} from '../models/campanha.model';
import { ramoDeServico } from '../models/perfil.model';
import {
  diasLivresDemo,
  historicoDemo,
  individuaisDemo,
  oportunidadesDemo,
  previaDemo,
  resultadoDemo,
  situacaoDemo,
} from './campanhas-demonstracao';
import { PerfilService } from './perfil.service';

const CHAVE_DEMONSTRACAO = 'dizai:campanhas:demonstracao';
const CHAVE_RESULTADO_DEMO_VISTO = 'dizai:campanhas:demonstracao:resultado';

/**
 * Campanhas de WhatsApp: /api/perfis/{perfilId}/campanhas (CampanhaController).
 * Com o modo demonstração ligado (?demonstracao=1, fica na aba até ?demonstracao=0), tudo vem de dados de exemplo
 * (`campanhas-demonstracao.ts`) e nada é enviado.
 */
@Injectable({ providedIn: 'root' })
export class CampanhaService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);
  private readonly perfil = inject(PerfilService).perfil;

  readonly demonstracao = signal(lerSessao(CHAVE_DEMONSTRACAO) === '1');

  /** Liga ou desliga pela URL (?demonstracao=1 / ?demonstracao=0). */
  lerDemonstracao(valor: string | null): void {
    if (valor !== '1' && valor !== '0') return;
    this.demonstracao.set(valor === '1');
    gravarSessao(CHAVE_DEMONSTRACAO, valor === '1' ? '1' : null);
    if (valor === '1') gravarSessao(CHAVE_RESULTADO_DEMO_VISTO, null);
  }

  sairDaDemonstracao(): void {
    this.lerDemonstracao('0');
  }

  private servico(): boolean {
    return ramoDeServico(this.perfil().ramo);
  }

  situacao(): Promise<SituacaoCampanhas> {
    if (this.demonstracao()) return Promise.resolve(situacaoDemo(this.servico()));
    return firstValueFrom(this.http.get<SituacaoCampanhas>(this.url('/situacao')));
  }

  diasLivres(): Promise<DiaLivre[]> {
    if (this.demonstracao()) return Promise.resolve(diasLivresDemo());
    return firstValueFrom(this.http.get<DiaLivre[]>(this.url('/dias-livres')));
  }

  previa(rascunho: RascunhoCampanha): Promise<PreviaCampanha> {
    if (this.demonstracao()) return Promise.resolve(previaDemo(this.servico(), rascunho));
    return firstValueFrom(this.http.post<PreviaCampanha>(this.url('/previa'), rascunho));
  }

  criar(rascunho: RascunhoCampanha): Promise<ResumoCampanha> {
    if (this.demonstracao()) {
      const enviadas = rascunho.clientes?.length ?? 0;
      return Promise.resolve({ ...historicoDemo(this.servico())[0], enviadas, responderam: 0, converteram: 0, faturamento: 0 });
    }
    return firstValueFrom(this.http.post<ResumoCampanha>(this.url(), rascunho));
  }

  historico(): Promise<ResumoCampanha[]> {
    if (this.demonstracao()) return Promise.resolve(historicoDemo(this.servico()));
    return firstValueFrom(this.http.get<ResumoCampanha[]>(this.url()));
  }

  detalhe(id: string): Promise<ResultadoCampanha> {
    if (this.demonstracao()) return Promise.resolve(resultadoDemo(this.servico(), id));
    return firstValueFrom(this.http.get<ResultadoCampanha>(this.url(`/${id}`)));
  }

  /** O resumo que abre no painel alguns dias depois do envio; null quando não há nenhum. */
  async resultadoPendente(): Promise<ResultadoCampanha | null> {
    if (this.demonstracao()) {
      if (lerSessao(CHAVE_RESULTADO_DEMO_VISTO)) return null;
      return resultadoDemo(this.servico(), 'demo-1');
    }
    const resposta = await firstValueFrom(
      this.http.get<ResultadoCampanha>(this.url('/resultado-pendente'), { observe: 'response' }),
    );
    return resposta.status === 200 ? resposta.body : null;
  }

  marcarResultadoVisto(id: string): Promise<void> {
    if (this.demonstracao()) {
      gravarSessao(CHAVE_RESULTADO_DEMO_VISTO, '1');
      return Promise.resolve();
    }
    return firstValueFrom(this.http.patch<void>(this.url(`/${id}/resultado-visto`), {}));
  }

  oportunidades(): Promise<Oportunidade[]> {
    if (this.demonstracao()) return Promise.resolve(oportunidadesDemo(this.servico()));
    return firstValueFrom(this.http.get<Oportunidade[]>(this.url('/oportunidades')));
  }

  dispensar(chave: string): Promise<void> {
    if (this.demonstracao()) return Promise.resolve();
    return firstValueFrom(this.http.post<void>(this.url('/oportunidades/dispensar'), { chave }));
  }

  pagamentoResolvido(): Promise<void> {
    if (this.demonstracao()) return Promise.resolve();
    return firstValueFrom(this.http.post<void>(this.url('/pagamento-resolvido'), {}));
  }

  individuais(): Promise<Individuais> {
    if (this.demonstracao()) return Promise.resolve(individuaisDemo(this.servico()));
    return firstValueFrom(this.http.get<Individuais>(this.url('/individuais')));
  }

  /** "Chamar no WhatsApp": registra o convite (a mensagem que o lojista mandar em seguida fica com o assistente). */
  chamar(contato: ContatoSugerido, texto: string): Promise<void> {
    if (this.demonstracao()) return Promise.resolve();
    return firstValueFrom(
      this.http.post<void>(this.url('/individuais'), { cliente: contato.id, motivo: contato.motivo, texto }),
    );
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), `/campanhas${caminho}`);
  }
}

function lerSessao(chave: string): string | null {
  try {
    return sessionStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarSessao(chave: string, valor: string | null): void {
  try {
    if (valor === null) sessionStorage.removeItem(chave);
    else sessionStorage.setItem(chave, valor);
  } catch {
    // sem armazenamento: a demonstração vale só até recarregar
  }
}
