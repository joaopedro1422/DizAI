import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { DicaSobrepostaComponent, ItemDica } from '../../../shared/components/dica-sobreposta/dica-sobreposta.component';

/** Quanto tempo a tela fica à vista (o pedido no Chats, o horário na Agenda) antes do fechamento. */
export const ESPERA_FECHAMENTO_MS = 3000;

const ITENS: Record<'produtos' | 'servicos', ItemDica[]> = {
  produtos: [
    { icone: 'caixa', titulo: 'Cadastre todos os seus produtos', texto: 'Com preços, opções e adicionais.' },
    { icone: 'pergunta', titulo: 'Responda as perguntas frequentes', texto: 'Pagamento, entrega, prazos: o que os clientes mais perguntam.' },
    { icone: 'ajustes', titulo: 'Configure o seu assistente', texto: 'Saudação, instruções e o jeito de atender do seu negócio.' },
  ],
  servicos: [
    { icone: 'caixa', titulo: 'Cadastre todos os seus serviços', texto: 'Com preço e duração.' },
    { icone: 'pergunta', titulo: 'Responda as perguntas frequentes', texto: 'Endereço, pagamento, o que os clientes mais perguntam.' },
    { icone: 'calendario', titulo: 'Configure o assistente e a agenda', texto: 'Horários, equipe, lembretes e lista de espera.' },
    { icone: 'brilho', titulo: 'Personalize as mensagens e a vitrine', texto: 'Confirmação, lembrete, agradecimento e o visual da sua página.' },
  ],
};

@Component({
  selector: 'app-fechamento-onboarding',
  imports: [DicaSobrepostaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dica-sobreposta
      icone="check"
      sobretitulo="Tour concluído"
      titulo="Agora é com você"
      descricao="O seu assistente já sabe atender. Agora, deixe ele com a cara do seu negócio:"
      [itens]="itens()"
      rotuloBotao="Começar a configurar"
      rotuloSecundario="Ficar aqui"
      (confirmar)="irParaOPainel()"
      (secundario)="fechar.emit()"
    />
  `,
})
export class FechamentoOnboardingComponent {
  readonly tipo = input.required<'produtos' | 'servicos'>();
  readonly fechar = output<void>();

  protected readonly itens = computed(() => ITENS[this.tipo()]);
  private readonly router = inject(Router);
  private readonly rotas = inject(SessaoService).rotasDoPainel;

  protected irParaOPainel(): void {
    this.fechar.emit();
    void this.router.navigateByUrl(this.rotas().inicio);
  }
}
