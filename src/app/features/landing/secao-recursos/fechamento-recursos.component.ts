import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';
import type { TipoNegocio } from './secao-recursos.component';

/** O resto do que cada tipo de negócio ganha (cards pequenos embaixo dos grandes). */
interface RecursoDoTipo {
  icone: NomeIcone;
  titulo: string;
  texto: string;
}

const DO_TIPO: Record<TipoNegocio, RecursoDoTipo[]> = {
  produtos: [
    {
      icone: 'listaRepetida',
      titulo: 'Coleta o que o seu produto precisa',
      texto: 'Sabores, massas, quantidades etc. O assistente confere uma por uma.',
    },
    {
      icone: 'caixa',
      titulo: 'Tamanhos com preço próprio',
      texto: 'P, M, G ou 25, 50 e 100 unidades: o cliente escolhe e o preço certo já entra no total.',
    },
    {
      icone: 'prancheta',
      titulo: 'Dados de fechamento do seu jeito',
      texto: 'Defina o que deve ser coletado pelo assistente antes de passar para você.',
    },
    {
      icone: 'calendario',
      titulo: 'Prazo de preparo calculado',
      texto: 'Pelo seu horário e pelo tempo de cada produto, diz quando fica pronto, sem prometer o impossível.',
    },
    {
      icone: 'checkDuplo',
      titulo: 'Fila de pedidos com status',
      texto: 'Em preparo, pronto e entregue em uma única tela, que se atualiza sozinha e toca um sinal quando chega pedido.',
    },
    {
      icone: 'conversa',
      titulo: 'Mensagens prontas por etapa',
      texto: '"Seu pedido ficou pronto!" com o nome e o valor preenchidos, enviado pelo WhatsApp com um toque.',
    },
  ],
  servicos: [
    {
      icone: 'pessoas',
      titulo: 'Lista de espera',
      texto:
        'Dia lotado e clientes esperando? O DizAI fornece uma fila de espera automática: vagou horário, a mensagem de aviso é enviada aos clientes na ordem da fila.',
    },
    {
      icone: 'listaRepetida',
      titulo: 'Remarca e cancela pelo WhatsApp',
      texto: 'O cliente resolve tudo pela conversa. Você recebe o aviso.',
    },
    {
      icone: 'emoji',
      titulo: 'Agradecimento automático',
      texto: 'Ao terminar o atendimento, o assistente envia sozinho uma mensagem de agradecimento personalizada.',
    },
    {
      icone: 'sino',
      titulo: 'Lembrete com confirmação',
      texto: 'De 1 hora a 1 dia antes. Quando o cliente responde que vem, o card ganha "Presença confirmada".',
    },
    {
      icone: 'sacola',
      titulo: 'Produtos à venda',
      texto: 'Esmalte, shampoo, minoxidil: o cliente reserva junto do horário e você registra cada venda.',
    },
    {
      icone: 'retorno',
      titulo: 'Lembrete de retorno',
      texto: 'Marque quando o cliente deve voltar. Na véspera, ele recebe o lembrete automaticamente.',
    },
  ],
};

/** Largura em que as telas do painel (public/landing/tela-*.html) foram desenhadas. */
const LARGURA_TELA = 1440;

/**
 * Fim da seção Recursos: o resto do que cada tipo de negócio ganha e a chamada para testar com o próprio negócio.
 * Fica num componente próprio para o CSS de cada um caber no limite do build.
 */
@Component({
  selector: 'app-fechamento-recursos',
  imports: [IconeComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fechamento-recursos.component.html',
  styleUrl: './fechamento-recursos.component.css',
})
export class FechamentoRecursosComponent {
  readonly tipo = input.required<TipoNegocio>();

  protected readonly doTipo = computed(() => DO_TIPO[this.tipo()]);
  /** Altura da tela em HTML (desenhada com 1440 px de largura). */
  protected readonly alturaTela = computed(() => (this.tipo() === 'produtos' ? 1146 : 1125));
  /** Quanto a tela de 1440 px encolhe para caber na moldura. */
  protected readonly escala = signal(0.4);

  private readonly tela = viewChild.required<ElementRef<HTMLElement>>('tela');

  constructor() {
    let observador: ResizeObserver | undefined;
    afterNextRender(() => {
      const moldura = this.tela().nativeElement;
      const medir = () => this.escala.set(moldura.clientWidth / LARGURA_TELA || 0.4);
      medir();
      observador = new ResizeObserver(medir);
      observador.observe(moldura);
    });
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
  }
}
