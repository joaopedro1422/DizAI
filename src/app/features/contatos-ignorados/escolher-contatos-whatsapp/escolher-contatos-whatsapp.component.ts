import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { ContatoWhatsapp, NovoContatoIgnorado } from '../../../core/models/contato.model';
import { ContatoIgnoradoService } from '../../../core/services/contato-ignorado.service';
import { ContatosWhatsappService } from '../../../core/services/contatos-whatsapp.service';
import { ToastService } from '../../../core/services/toast.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { chaveTelefone } from '../../../core/utils/telefone.utils';
import { normalizarTexto } from '../../../core/utils/texto.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

interface OpcaoContato extends ContatoWhatsapp {
  chave: string;
  jaIgnorado: boolean;
}

/** Modal "Escolher do WhatsApp": lista a agenda sincronizada para marcar quem é pessoal. */
@Component({
  selector: 'app-escolher-contatos-whatsapp',
  imports: [AvatarComponent, IconeComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escolher-contatos-whatsapp.component.html',
  styleUrl: './escolher-contatos-whatsapp.component.css',
})
export class EscolherContatosWhatsappComponent implements OnInit {
  readonly salvando = input(false);
  readonly confirmar = output<NovoContatoIgnorado[]>();

  private readonly contatosWhatsappService = inject(ContatosWhatsappService);
  private readonly contatoIgnoradoService = inject(ContatoIgnoradoService);
  private readonly toastService = inject(ToastService);

  protected readonly carregando = this.contatosWhatsappService.carregando;
  protected readonly busca = signal('');
  private readonly selecionados = signal<ReadonlySet<string>>(new Set());

  /** Agenda em ordem alfabética, marcando quem já está na lista de ignorados. */
  private readonly opcoes = computed<OpcaoContato[]>(() => {
    const ignorados = this.contatoIgnoradoService.numerosIgnorados();
    return this.contatosWhatsappService
      .contatos()
      .map((contato) => {
        const chave = chaveTelefone(contato.whatsapp);
        return { ...contato, chave, jaIgnorado: ignorados.has(chave) };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  });

  protected readonly opcoesFiltradas = computed(() => {
    const termo = normalizarTexto(this.busca());
    const termoDigitos = this.busca().replace(/\D/g, '');
    if (!termo) {
      return this.opcoes();
    }
    return this.opcoes().filter(
      (opcao) =>
        normalizarTexto(opcao.nome).includes(termo) || (termoDigitos.length > 0 && opcao.chave.includes(termoDigitos)),
    );
  });

  protected readonly quantidadeSelecionada = computed(() => this.selecionados().size);

  protected readonly textoBotao = computed(() => {
    const total = this.quantidadeSelecionada();
    return total === 0 ? 'Selecione os contatos' : `Ignorar ${pluralizar(total, 'contato', 'contatos')}`;
  });

  ngOnInit(): void {
    this.contatosWhatsappService
      .carregar()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)));
  }

  protected atualizarBusca(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected estaSelecionado(opcao: OpcaoContato): boolean {
    return opcao.jaIgnorado || this.selecionados().has(opcao.chave);
  }

  protected alternar(opcao: OpcaoContato): void {
    if (opcao.jaIgnorado) {
      return;
    }
    this.selecionados.update((atuais) => {
      const proximos = new Set(atuais);
      if (proximos.has(opcao.chave)) {
        proximos.delete(opcao.chave);
      } else {
        proximos.add(opcao.chave);
      }
      return proximos;
    });
  }

  protected salvar(): void {
    if (this.salvando() || this.quantidadeSelecionada() === 0) {
      return;
    }
    const escolhidos = this.opcoes()
      .filter((opcao) => this.selecionados().has(opcao.chave))
      .map((opcao) => ({ nome: opcao.nome, whatsapp: opcao.whatsapp, origem: 'WHATSAPP' as const }));
    this.confirmar.emit(escolhidos);
  }
}
