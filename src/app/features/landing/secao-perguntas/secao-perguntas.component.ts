import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import type { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { PergunteDizaiComponent } from './pergunte-dizai/pergunte-dizai.component';

interface Pergunta {
  pergunta: string;
  resposta: string;
}

/** O que os lojistas mais perguntam antes de começar (quebra objeções antes da chamada final). */
const PERGUNTAS: Pergunta[] = [
  {
    pergunta: 'Preciso trocar de número?',
    resposta: 'Não. O DizAI funciona no seu WhatsApp Business de sempre e você continua usando o app normalmente.',
  },
  {
    pergunta: 'E se o assistente não souber responder?',
    resposta:
      'Ele não inventa: responde “vou confirmar, 1 minuto”, te avisa no celular e você responde. Depois, com um toque, a resposta vira pergunta frequente e ele passa a saber.',
  },
  {
    pergunta: 'Uso o mesmo número para a vida pessoal. E agora?',
    resposta: 'Sem problema. Você escolhe os contatos pessoais, como família e amigos, e o assistente não responde essas conversas.',
  },
  {
    pergunta: 'Ele fecha vendas sozinho?',
    resposta:
      'Para produtos, você escolhe: ele te chama na hora ou anota os dados do pedido e te entrega o resumo para você confirmar. Para serviços, há o agendamento automático: ele marca o horário sozinho na sua agenda.',
  },
  {
    pergunta: 'Posso responder eu mesmo uma conversa?',
    resposta: 'Pode. Assim que você manda uma mensagem pelo celular, o assistente sai daquela conversa.',
  },
  {
    pergunta: 'Para ter uma vitrine do meu negócio preciso usar o assistente?',
    resposta:
      'Não. Você pode montar a sua página gratuitamente, só para ter o link e usar nas suas redes sociais, sem ligar o assistente.',
  },
];

const NUMERO = PERGUNTAS[0];
const NAO_SABE = PERGUNTAS[1];
const PESSOAL = PERGUNTAS[2];
const RESPONDER = PERGUNTAS[4];
const VITRINE = PERGUNTAS[5];

/** Produtos: o maior receio é perder o controle dos pedidos e do pagamento, então ele vem primeiro. */
const PERGUNTAS_PRODUTOS: Pergunta[] = [
  {
    pergunta: 'Vou perder o controle dos meus pedidos?',
    resposta:
      'Não. O assistente faz a triagem: tira dúvidas, faz o orçamento e anota o pedido. Quem confirma, combina o pagamento e decide é sempre você.',
  },
  {
    pergunta: 'Ele recebe pagamento ou fecha a venda sozinho?',
    resposta:
      'Não. Ele anota o pedido e te entrega o resumo com o total. Você confirma e recebe do seu jeito: Pix, cartão ou na entrega.',
  },
  NUMERO,
  {
    pergunta: 'Ele respeita o meu prazo de preparo e o pedido mínimo?',
    resposta:
      'Sim. Ele confere a antecedência de cada produto, os dias e horários em que você trabalha e as regras que você escrever, sem recitar nada para o cliente.',
  },
  NAO_SABE,
  PESSOAL,
  RESPONDER,
  VITRINE,
];

/** Serviços: a agenda é o que importa, então as dúvidas sobre ela vêm primeiro. */
const PERGUNTAS_SERVICOS: Pergunta[] = [
  {
    pergunta: 'Ele marca horário sozinho?',
    resposta:
      'Sim. Ele só oferece os horários livres da sua agenda, conta a duração de cada serviço e marca na hora. Se preferir, ele te chama em vez de marcar.',
  },
  {
    pergunta: 'E se o cliente faltar ou quiser remarcar?',
    resposta:
      'Ele manda o lembrete antes do horário e pede a confirmação de presença. Para remarcar ou cancelar, o cliente fala com ele mesmo, e a vaga volta para a agenda.',
  },
  {
    pergunta: 'Tenho mais de um profissional. Funciona?',
    resposta:
      'Funciona. Cada profissional tem a sua agenda e o cliente escolhe com quem, ou "qualquer um" e o assistente acha quem está livre.',
  },
  NUMERO,
  NAO_SABE,
  PESSOAL,
  RESPONDER,
  VITRINE,
];

/** "Perguntas" da landing: respostas expansíveis, todas começam fechadas. */
@Component({
  selector: 'app-secao-perguntas',
  imports: [IconeComponent, PergunteDizaiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-perguntas.component.html',
  styleUrls: ['../secao-landing.css', './secao-perguntas.component.css'],
})
export class SecaoPerguntasComponent {
  /** Landing de um tipo: as perguntas daquele público, com a objeção principal na frente. */
  readonly tipo = input<TipoNegocio | null>(null);
  protected readonly perguntas = computed(() =>
    this.tipo() === 'produtos' ? PERGUNTAS_PRODUTOS : this.tipo() === 'servicos' ? PERGUNTAS_SERVICOS : PERGUNTAS,
  );
  protected readonly abertas = signal<ReadonlySet<number>>(new Set());

  protected alternar(indice: number): void {
    this.abertas.update((abertas) => {
      const novas = new Set(abertas);
      if (novas.has(indice)) {
        novas.delete(indice);
      } else {
        novas.add(indice);
      }
      return novas;
    });
  }
}
