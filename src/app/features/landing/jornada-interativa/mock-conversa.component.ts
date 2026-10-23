import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type TipoConversa = 'produto' | 'fechamento' | 'galeria' | 'domingo' | 'servico' | 'horarios' | 'agendamento';

/** Uma mensagem das conversas de serviço: quem manda, o texto (com quebras de linha) e quando aparece. */
interface MensagemFluxo {
  cliente: boolean;
  texto: string;
  /** Link no fim da mensagem, em azul como o WhatsApp mostra. */
  link?: string;
  atrasoS: number;
}

/** O endereço da página de agendamento da Sálvia (o {AGENDA} do prompt vira este link). */
const LINK_AGENDA = 'dizai.com/l/camila-rocha/agenda';

/**
 * As conversas de serviço (manicure) seguem o que o DizAI manda de verdade: a saudação automática antes da
 * primeira resposta, os horários livres em bullet points (seção AGENDAMENTO do prompt), a mensagem pronta da
 * página de agendamento e a confirmação padrão do AgendaService.
 */
const CONVERSAS_SERVICO: Partial<Record<TipoConversa, MensagemFluxo[]>> = {
  servico: [
    { cliente: true, texto: 'Oi! Quanto fica a esmaltação em gel?', atrasoS: 0 },
    { cliente: false, texto: 'Olá! Aqui é o assistente virtual de Sálvia Nail Studio 👋', atrasoS: 1.6 },
    {
      cliente: false,
      texto:
        'Oi! A esmaltação em gel fica R$ 70,00 e o atendimento leva cerca de 1h 💅\n' +
        'O brilho dura até 21 dias e já inclui a cutilagem.\n\nQuer agendar um horário?',
      atrasoS: 3.2,
    },
  ],
  horarios: [
    { cliente: true, texto: 'Quero sim! Tem horário amanhã?', atrasoS: 0 },
    {
      cliente: false,
      texto:
        'Tem sim! Amanhã (sexta, 23/10) você pode começar:\n- das 08:00 até as 11:00\n- das 13:00 até as 17:00\n\n' +
        'Qual horário fica melhor para você?\nSe preferir, você também pode ver os horários e agendar por aqui:',
      link: LINK_AGENDA,
      atrasoS: 1.8,
    },
  ],
  agendamento: [
    {
      cliente: true,
      texto:
        // a mensagem pronta da agenda online, como chega no WhatsApp (*texto* = negrito)
        'Olá! Quero agendar pela agenda online:\n\n*Serviço:* Esmaltação em gel\n*Data:* sexta, 23/10\n*Horário:* 14:00\n*Nome:* Mariana',
      atrasoS: 0,
    },
    {
      cliente: false,
      texto:
        'Agendado! ✅\n\nServiço: Esmaltação em gel\nData: sexta, 23/10\nHorário: 14:00 às 15:00\nNome: Mariana\n\n' +
        'Se precisar remarcar ou cancelar, é só me avisar por aqui.',
      atrasoS: 2.4,
    },
  ],
};

@Component({
  selector: 'app-mock-conversa-jornada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-conversa.component.html',
  styleUrl: './mock-conversa.component.css',
})
export class MockConversaJornadaComponent {
  @Input() tipo: TipoConversa = 'produto';

  /** Conversas de serviço: as mensagens ficam uma embaixo da outra, no centro do palco. */
  protected get fluxo(): MensagemFluxo[] | undefined {
    return CONVERSAS_SERVICO[this.tipo];
  }

  /** "*Serviço:* Esmaltação" -> trechos com e sem negrito, como o WhatsApp mostra. */
  protected trechos(texto: string): { texto: string; negrito: boolean }[] {
    return texto
      .split(/(\*[^*\n]+\*)/)
      .filter(Boolean)
      .map((parte) =>
        parte.length > 2 && parte.startsWith('*') && parte.endsWith('*')
          ? { texto: parte.slice(1, -1), negrito: true }
          : { texto: parte, negrito: false },
      );
  }
}
