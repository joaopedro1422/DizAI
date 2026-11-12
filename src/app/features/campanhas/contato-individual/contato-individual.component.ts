import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';

import { ContatoSugerido } from '../../../core/models/campanha.model';
import { CampanhaService } from '../../../core/services/campanha.service';
import { ToastService } from '../../../core/services/toast.service';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * Uma cliente para chamar uma a uma: o motivo, a mensagem que o DizAI escreveu (dá para mudar) e "Chamar no WhatsApp",
 * que abre a conversa no WhatsApp do lojista com o texto pronto. Sai pelo número da loja, sem custo e sem modelo da
 * Meta; quando a cliente responder, o assistente continua. `escuro`: no card azul do painel.
 */
@Component({
  selector: 'app-contato-individual',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contato-individual.component.html',
  styleUrl: './contato-individual.component.css',
  host: { '[class.escuro]': 'escuro()' },
})
export class ContatoIndividualComponent implements OnInit {
  private readonly campanhaService = inject(CampanhaService);
  private readonly toast = inject(ToastService);

  readonly contato = input.required<ContatoSugerido>();
  readonly escuro = input(false);
  readonly chamado = output<ContatoSugerido>();
  readonly dispensado = output<ContatoSugerido>();

  protected readonly texto = signal('');
  protected readonly editando = signal(false);

  ngOnInit(): void {
    this.texto.set(this.contato().mensagem);
  }

  protected editar(evento: Event): void {
    this.texto.set((evento.target as HTMLTextAreaElement).value);
  }

  /** Abre o WhatsApp na hora (depois de um await o navegador bloquearia) e registra o convite em seguida. */
  protected chamar(): void {
    const contato = this.contato();
    const texto = this.texto().trim() || contato.mensagem;
    if (this.campanhaService.demonstracao()) {
      this.toast.mostrar('Demonstração: aqui a conversa abriria no seu WhatsApp com a mensagem pronta.');
      this.chamado.emit(contato);
      return;
    }
    window.open(`${gerarLinkWhatsapp(contato.numero)}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    void this.campanhaService.chamar(contato, texto).catch(() => undefined);
    this.chamado.emit(contato);
  }

  protected dispensar(): void {
    void this.campanhaService.dispensar(this.contato().sugestao).catch(() => undefined);
    this.dispensado.emit(this.contato());
  }
}
