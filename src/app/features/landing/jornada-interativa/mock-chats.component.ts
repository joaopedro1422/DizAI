import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { RoteiroDemo } from './roteiro-demo';
import { TelefoneDemoComponent } from './telefone-demo.component';

/** O resumo que a IA mandou ao passar o pedido (o mesmo da conversa da cena "Feche"). */
const RESUMO_PEDIDO = [
  { campo: 'Item', valor: 'Torta artesanal G: brigadeiro, massa mista' },
  { campo: 'Nome', valor: 'João' },
  { campo: 'Retirada', valor: 'segunda-feira' },
  { campo: 'Total', valor: 'R$ 85,00' },
];

type EtapaChats = 'aviso' | 'abrindo' | 'card' | 'confirmando';

/**
 * Fim do fluxo de produtos: chega o aviso "Pedido para fechar" no celular e a tela de Chats do painel mostra a
 * conversa com o resumo do pedido e os botões do pedido (o mesmo card do app, no tamanho real).
 */
@Component({
  selector: 'app-mock-chats-jornada',
  imports: [AvatarComponent, IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-chats.component.html',
  styleUrls: ['./tela-real.css', './mock-chats.component.css'],
})
export class MockChatsJornadaComponent implements OnInit {
  private readonly roteiro = new RoteiroDemo(inject(DestroyRef));

  protected readonly resumo = RESUMO_PEDIDO;
  protected readonly etapa = signal<EtapaChats>('aviso');

  ngOnInit(): void {
    if (this.roteiro.movimentoReduzido) {
      this.etapa.set('card');
      return;
    }
    this.roteiro.em(2600, () => this.etapa.set('abrindo'));
    this.roteiro.em(3000, () => this.etapa.set('card'));
    this.roteiro.em(7200, () => this.etapa.set('confirmando'));
  }
}
