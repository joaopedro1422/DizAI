import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
      titulo: 'Coleta tudo o que o produto pede',
      texto: 'Sabores, quantidades, recheios e adicionais: você diz quantas opções o cliente escolhe e o assistente confere uma por uma.',
    },
    {
      icone: 'caixa',
      titulo: 'Tamanhos com preço próprio',
      texto: 'P, M, G ou 25, 50 e 100 unidades: o cliente escolhe e o preço certo já entra no total.',
    },
    {
      icone: 'prancheta',
      titulo: 'Dados de fechamento do seu jeito',
      texto: 'Nome, retirada ou entrega, endereço, data e pagamento: apenas o que você pedir, antes de passar para você.',
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
      icone: 'listaRepetida',
      titulo: 'Remarca e cancela pelo WhatsApp',
      texto: 'O cliente resolve na conversa e altera apenas os próprios horários. Você recebe o aviso.',
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
      icone: 'editar',
      titulo: 'Mensagens personalizadas por você',
      texto: 'Confirmação, lembrete e agradecimento com o seu texto, e o nome, o serviço e o horário preenchidos.',
    },
    {
      icone: 'calendarioFolga',
      titulo: 'Seus horários e folgas',
      texto: 'Expediente de cada dia da semana e as suas folgas: a agenda segue a sua rotina.',
    },
    {
      icone: 'mais',
      titulo: 'Agende à mão quando quiser',
      texto: 'Cliente ligou? Marque em segundos, com serviço, profissional e valor, sem horário duplicado.',
    },
    {
      icone: 'sacola',
      titulo: 'Produtos à venda',
      texto: 'Esmalte, shampoo, minoxidil: o cliente reserva junto do horário e você registra cada venda.',
    },
    {
      icone: 'link',
      titulo: 'Já agenda em outro app?',
      texto:
        'Trinks, AppBarber ou Booksy: o assistente tira as dúvidas e manda o seu link para marcar. Indicado para usar fora do horário de funcionamento e não deixar os clientes sem resposta.',
    },
  ],
};

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
}
