import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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
      'Você decide o que ele faz quando o cliente quer fechar: te chamar na hora, ou coletar os dados do pedido que você definir e te entregar o resumo (ele não confirma o pedido, quem confirma é você). Para negócios de serviço, há também o agendamento automático, em que ele marca o horário sozinho na sua agenda.',
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

/** "Perguntas" da landing: respostas expansíveis, todas começam fechadas. */
@Component({
  selector: 'app-secao-perguntas',
  imports: [IconeComponent, PergunteDizaiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-perguntas.component.html',
  styleUrls: ['../secao-landing.css', './secao-perguntas.component.css'],
})
export class SecaoPerguntasComponent {
  protected readonly perguntas = PERGUNTAS;
  /** Índices das respostas abertas. */
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
