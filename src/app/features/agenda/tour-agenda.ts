import { ExemplosServicos } from '../../core/constants/segmentos/tipos-segmento';
import { PassoTour } from '../painel/onboarding/previas-onboarding';
import { SecaoAgenda } from './secoes-agenda';

/** O que o tour faz na tela da agenda entre um passo e outro. */
export interface AcoesTourAgenda {
  abrirMenu: () => void;
  fecharMenu: () => void;
  irPara: (secao: SecaoAgenda) => void;
}

/** A gaveta do menu leva 260 ms para abrir; a troca de página, um pouco menos. */
const ESPERA_MENU_MS = 320;
const ESPERA_PAGINA_MS = 250;

/**
 * Tour da agenda (primeira visita e "Como usar a agenda" no menu): o menu e cada página, com o que o assistente faz
 * sozinho pelo WhatsApp. O menu abre e as páginas mudam sozinhos; passos com o alvo escondido nesta largura são
 * pulados (o botão do menu só existe no celular; no computador o menu já está à vista).
 */
export function passosDoTourDaAgenda(
  acoes: AcoesTourAgenda,
  agenda: NonNullable<ExemplosServicos['agenda']>,
): PassoTour[] {
  const [pedido, oferta] = agenda.agendar;
  const [lembrete, resposta] = agenda.lembrete;
  return [
    {
      alvo: 'agenda-menu',
      titulo: 'Tudo da agenda fica neste menu',
      texto: 'Toque aqui para abrir as páginas da agenda. Vamos abrir para você.',
      previa: [],
      antes: () => {
        acoes.fecharMenu();
        acoes.irPara('agendamentos');
      },
      esperaMs: ESPERA_PAGINA_MS,
    },
    {
      alvo: 'agenda-secoes',
      titulo: 'Agendamentos e Números',
      texto:
        'Em Agendamentos ficam os horários marcados de cada dia. Em Números, o faturamento, os atendimentos, os serviços mais feitos e os melhores clientes.',
      previa: [],
      antes: acoes.abrirMenu,
      esperaMs: ESPERA_MENU_MS,
    },
    {
      alvo: 'agenda-configuracoes',
      titulo: 'Configurações',
      texto:
        'Cada assunto na sua página: os dias e horários de atendimento, a equipe, os lembretes e mensagens automáticas e a lista de espera.',
      previa: [],
      antes: acoes.abrirMenu,
    },
    {
      alvo: 'agenda-online',
      titulo: 'Sua agenda online',
      texto:
        'Uma página com os seus horários livres: o cliente escolhe e manda a mensagem pronta pelo WhatsApp. Copie o link e coloque na bio do Instagram.',
      previa: [],
      antes: acoes.abrirMenu,
    },
    {
      alvo: 'agenda-dias',
      titulo: 'Escolha o dia',
      texto: 'Toque em um dia para ver os horários dele. Os dias em que você não atende aparecem como fechados.',
      previa: [],
      antes: () => acoes.irPara('agendamentos'),
      esperaMs: ESPERA_MENU_MS,
    },
    {
      alvo: 'agenda-dia',
      titulo: 'O assistente marca sozinho',
      texto:
        'O que o assistente marca pelo WhatsApp aparece aqui na hora, com um sinal sonoro. Toque no número do cliente para abrir a conversa.',
      previa: [
        { de: 'cliente', texto: pedido },
        { de: 'assistente', texto: oferta },
      ],
    },
    {
      alvo: 'agenda-agendar',
      titulo: 'Marcou por telefone ou no balcão?',
      texto:
        'Use "Agendar horário" para colocar na agenda. Não vai atender em um dia? Marque a folga e o assistente não oferece horários nele.',
      previa: [],
    },
    {
      alvo: 'agenda-agendar-pc',
      titulo: 'Marcou por telefone ou no balcão?',
      texto:
        'Use "Agendar horário" para colocar na agenda. Não vai atender em um dia? Marque a folga e o assistente não oferece horários nele.',
      previa: [],
    },
    {
      alvo: 'agenda-semana',
      titulo: 'Seus dias e horários',
      texto:
        'O assistente só oferece horários dentro do que estiver aqui. Use mais de um período no dia para a pausa do almoço.',
      previa: [],
      antes: () => acoes.irPara('horarios'),
      esperaMs: ESPERA_PAGINA_MS,
    },
    {
      alvo: 'agenda-mensagens',
      titulo: 'Lembretes e mensagens automáticas',
      texto:
        'A confirmação, o lembrete antes do horário e o agradecimento saem sozinhos. Quem responde ao lembrete fica com a presença confirmada.',
      previa: [
        { de: 'assistente', texto: lembrete },
        { de: 'cliente', texto: resposta },
      ],
      antes: () => acoes.irPara('mensagens'),
      esperaMs: ESPERA_PAGINA_MS,
    },
  ];
}
