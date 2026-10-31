import { NomeIcone } from '../../shared/components/icone/icones';

/**
 * Conversas de demonstração (hero da landing e página /demonstracao): uma por segmento de negócio.
 * O visitante só assiste. Os textos seguem o formato que o DizAI usa no WhatsApp (listas com "- ", *negrito*).
 * Como no atendimento de verdade, a primeira resposta sai em duas mensagens: a saudação da loja
 * (`SaudacaoBuilder`, com o cumprimento da hora) e depois a resposta da IA, que começa direto, sem se apresentar.
 */
export type TipoNegocio = 'servicos' | 'produtos';

export interface PassoConversa {
  /**
   * cliente / assistente / dono (o lojista respondendo pelo celular): mensagens com texto.
   * documento (PDF), imagem (cardápio em foto), link (portfólio com prévia): o que o assistente envia.
   * nota: o que o DizAI fez por trás; notificacao: o aviso no celular do dono; dia: separador de dia.
   * tela: o celular sai do WhatsApp e mostra a tela do painel (Pedidos ou Minha Agenda) por alguns segundos.
   */
  de: 'cliente' | 'assistente' | 'dono' | 'documento' | 'imagem' | 'link' | 'nota' | 'notificacao' | 'dia' | 'tela';
  texto?: string;
  titulo?: string;
  nome?: string;
  detalhe?: string;
  url?: string;
  /** O que acende quando o passo chega (a legenda do hero e os checks da página de demonstração). */
  destaque?: string;
  /** Hora da mensagem quando não segue a conversa (lembrete, agradecimento). As seguintes continuam dela. */
  hora?: string;
  /** de: 'tela': a tela de Pedidos com este pedido (o lojista toca em "Entregue")... */
  pedido?: PedidoDemo;
  /** ...ou a Minha Agenda no dia do horário que o assistente acabou de marcar. */
  agenda?: AgendaDemo;
}

/** O pedido como aparece no card da tela Pedidos (os campos do resumo que o assistente montou). */
export interface PedidoDemo {
  nome: string;
  whatsapp: string;
  /** "2 min" em "confirmado há 2 min". */
  confirmadoHa: string;
  resumo: { campo: string; valor: string }[];
  valor: number;
}

/** Um card da lista resumida da Minha Agenda. */
export interface HorarioDemo {
  inicio: string;
  fim: string;
  nome: string;
  servicos: string;
  /** "1h15", "45 min" (o formatarDuracao da tela real). */
  duracao: string;
  whatsapp: string;
  valor: number;
  /** Marcado pelo assistente (a estrelinha). */
  assistente?: boolean;
  /** O horário que acabou de entrar: aparece com animação. */
  novo?: boolean;
}

/** A Minha Agenda no dia escolhido: a faixa de dias (datas reais de 2024, como nas conversas) e os horários. */
export interface AgendaDemo {
  /** O link da agenda online no topo, sem o protocolo. */
  link: string;
  dias: { data: string; detalhe?: string; marcado?: boolean }[];
  selecionado: string;
  /** "Quinta, 24/10" */
  titulo: string;
  horarios: HorarioDemo[];
}

export interface SegmentoDemonstracao {
  id: string;
  rotulo: string;
  loja: string;
  inicial: string;
  cor: string;
  dono: string;
  /** "no celular da Bia" / "no celular do Léo" */
  artigo: 'da' | 'do';
  /** Hora da primeira mensagem (HH:mm). */
  inicio: string;
  passos: PassoConversa[];
}

export interface TipoDemonstracao {
  rotulo: string;
  exemplos: string;
  icone: NomeIcone;
  segmentos: SegmentoDemonstracao[];
}

const AGENDA_CONSULTADA = '✨ O DizAI consultou a sua agenda';

export const DEMONSTRACOES: Record<TipoNegocio, TipoDemonstracao> = {
  servicos: {
    rotulo: 'Serviços',
    exemplos: 'Manicure, barbearia, estética, salão…',
    icone: 'calendario',
    segmentos: [
      {
        id: 'manicure', rotulo: 'Manicure', loja: 'Studio Bella Unhas', inicial: 'B', cor: '#B8457A', dono: 'Bia', artigo: 'da', inicio: '10:12',
        passos: [
          { de: 'cliente', texto: 'Oi! Quanto custa a esmaltação em gel?' },
          { de: 'assistente', texto: 'Bom dia! Seja bem-vinda ao Studio Bella Unhas 💅 Sou a assistente virtual e vou te ajudar por aqui.' },
          { de: 'assistente', texto: 'A esmaltação em gel é *R$ 60* e leva cerca de 1h15.', destaque: 'Responde preço e duração na hora' },
          { de: 'cliente', texto: 'Tem foto de alguns trabalhos?' },
          { de: 'assistente', texto: 'Tem sim! Separei por tipo, dá uma olhada:' },
          { de: 'link', url: 'dizai.app/l/studio-bella', titulo: 'Studio Bella Unhas · Gel, fibra e nail art', destaque: 'Envia o portfólio com as fotos' },
          { de: 'cliente', texto: 'Amei! Tem horário quinta à tarde?' },
          { de: 'nota', texto: AGENDA_CONSULTADA, destaque: 'Oferece só os horários livres' },
          { de: 'assistente', texto: 'Tenho sim! Na quinta (24/10) à tarde estão livres:\n- Das 13:00 às 14:30\n- Das 16:00 às 18:00\n\nQual horário fica melhor?' },
          { de: 'cliente', texto: '16h! Sou a Fernanda' },
          { de: 'assistente', texto: 'Agendado! ✅\n*Serviço:* Esmaltação em gel\n*Data:* quinta, 24/10\n*Horário:* 16:00 às 17:15\n\nAté quinta, Fernanda! Se precisar remarcar, é só me chamar.' },
          { de: 'notificacao', titulo: 'Novo agendamento', texto: 'Fernanda · Esmaltação em gel · qui 24/10 às 16:00', destaque: 'Marca sozinho e te avisa no celular' },
          {
            de: 'tela', destaque: 'O horário já entra na sua agenda',
            agenda: {
              link: 'dizai.com/l/studio-bella/agenda',
              dias: [
                { data: '2024-10-22', detalhe: '2', marcado: true }, { data: '2024-10-23', detalhe: '3', marcado: true },
                { data: '2024-10-24', detalhe: '4', marcado: true }, { data: '2024-10-25', detalhe: '2', marcado: true },
                { data: '2024-10-26', detalhe: '5', marcado: true }, { data: '2024-10-27', detalhe: 'Fechado' },
                { data: '2024-10-28', detalhe: '1', marcado: true },
              ],
              selecionado: '2024-10-24',
              titulo: 'Quinta, 24/10',
              horarios: [
                { inicio: '09:00', fim: '10:15', nome: 'Aline Costa', servicos: 'Esmaltação em gel', duracao: '1h15', whatsapp: '(83) 99120-4471', valor: 60, assistente: true },
                { inicio: '10:30', fim: '11:15', nome: 'Júlia Martins', servicos: 'Manicure', duracao: '45 min', whatsapp: '(83) 98733-1052', valor: 30 },
                { inicio: '14:30', fim: '16:00', nome: 'Paula Ribeiro', servicos: 'Manicure + Pedicure', duracao: '1h30', whatsapp: '(83) 99651-2290', valor: 55, assistente: true },
                { inicio: '16:00', fim: '17:15', nome: 'Fernanda', servicos: 'Esmaltação em gel', duracao: '1h15', whatsapp: '(83) 98845-1203', valor: 60, assistente: true, novo: true },
              ],
            },
          },
          { de: 'dia', texto: 'Quinta-feira, 24/10' },
          { de: 'assistente', hora: '14:00', texto: 'Oi, Fernanda! 😊 Passando para lembrar do seu horário de hoje às 16:00 (Esmaltação em gel).\nVocê confirma a presença?' },
          { de: 'cliente', texto: 'Confirmadíssimo! 😍' },
          { de: 'assistente', texto: 'Presença confirmada! ✅\nTe esperamos quinta, 24/10 às 16:00 (Esmaltação em gel).', destaque: 'Lembra a cliente e confirma a presença' },
          { de: 'assistente', hora: '17:30', texto: 'Obrigado pela visita, Fernanda! 😊\n\nFoi um prazer te atender. Quando quiser marcar o próximo horário, é só me chamar por aqui.', destaque: 'Agradece sozinho depois do atendimento' },
        ],
      },
      {
        id: 'barbearia', rotulo: 'Barbearia', loja: 'Barbearia do Léo', inicial: 'L', cor: '#2B2B2B', dono: 'Léo', artigo: 'do', inicio: '14:02',
        passos: [
          { de: 'cliente', texto: 'Boa tarde! Vocês cortam cabelo infantil?' },
          { de: 'assistente', texto: 'Boa tarde! Aqui é o assistente virtual da Barbearia do Léo 💈' },
          { de: 'assistente', texto: 'Cortamos sim! O corte infantil (até 12 anos) é *R$ 35* e leva cerca de 30 minutos.', destaque: 'Responde preço e duração na hora' },
          { de: 'cliente', texto: 'E quais outros serviços vocês fazem?' },
          { de: 'assistente', texto: 'Fazemos:\n- Corte masculino\n- Corte infantil\n- Barba\n- Corte + barba\n- Sobrancelha\n\nQuer saber o valor de algum?' },
          { de: 'cliente', texto: 'Tem horário sábado de manhã pra mim (corte + barba) e pro meu filho?' },
          { de: 'nota', texto: AGENDA_CONSULTADA, destaque: 'Encaixa dois serviços seguidos' },
          { de: 'assistente', texto: 'Tenho sim! No sábado (26/10) de manhã estão livres:\n- Das 08:00 às 09:30\n- Das 10:30 às 12:00\n\nO corte + barba (1h) e o corte infantil (30 min) ficam seguidos. Qual prefere?' },
          { de: 'cliente', texto: '8h. Meu nome é Carlos' },
          { de: 'assistente', texto: 'Agendado! ✅\n*Serviços:* Corte + barba e Corte infantil\n*Data:* sábado, 26/10\n*Horário:* 08:00 às 09:30\n\nTe esperamos, Carlos!' },
          { de: 'notificacao', titulo: 'Novo agendamento', texto: 'Carlos · Corte + barba e Corte infantil · sáb 26/10 às 08:00', destaque: 'Marca sozinho e te avisa no celular' },
          {
            de: 'tela', destaque: 'O horário já entra na sua agenda',
            agenda: {
              link: 'dizai.com/l/barbearia-do-leo/agenda',
              dias: [
                { data: '2024-10-24', detalhe: '6', marcado: true }, { data: '2024-10-25', detalhe: '8', marcado: true },
                { data: '2024-10-26', detalhe: '3', marcado: true }, { data: '2024-10-27', detalhe: 'Fechado' },
                { data: '2024-10-28', detalhe: '2', marcado: true }, { data: '2024-10-29', detalhe: '4', marcado: true },
                { data: '2024-10-30', detalhe: '3', marcado: true },
              ],
              selecionado: '2024-10-26',
              titulo: 'Sábado, 26/10',
              horarios: [
                { inicio: '08:00', fim: '09:30', nome: 'Carlos', servicos: 'Corte + barba + Corte infantil', duracao: '1h30', whatsapp: '(83) 99803-6614', valor: 95, assistente: true, novo: true },
                { inicio: '09:30', fim: '10:30', nome: 'Rafael Souza', servicos: 'Corte + barba', duracao: '1h', whatsapp: '(83) 98712-3390', valor: 60, assistente: true },
                { inicio: '14:00', fim: '14:30', nome: 'André Lima', servicos: 'Corte masculino', duracao: '30 min', whatsapp: '(83) 99234-7781', valor: 40 },
              ],
            },
          },
          { de: 'dia', texto: 'Sábado, 26/10' },
          { de: 'cliente', texto: 'Léo, vou me atrasar. Dá pra passar pras 10:30?' },
          { de: 'assistente', texto: 'Remarcado! ✅\n*Serviços:* Corte + barba e Corte infantil\n*Horário:* 10:30 às 12:00\n\nTe esperamos, Carlos!', destaque: 'O cliente remarca pelo próprio WhatsApp' },
        ],
      },
      {
        id: 'estetica', rotulo: 'Estética', loja: 'Espaço Renova', inicial: 'R', cor: '#5F7F6E', dono: 'Carla', artigo: 'da', inicio: '22:41',
        passos: [
          { de: 'cliente', texto: 'Boa noite! Vocês fazem limpeza de pele? Minha pele é bem oleosa' },
          { de: 'assistente', texto: 'Boa noite! Bem-vinda ao Espaço Renova ✨ Sou a assistente virtual e te respondo a qualquer hora.' },
          { de: 'assistente', texto: 'Fazemos sim! A limpeza de pele profunda é indicada para pele oleosa: *R$ 150*, com 1h30 de duração. Inclui extração, máscara calmante e protetor solar.', destaque: 'Atende às 22h, com o espaço fechado' },
          { de: 'cliente', texto: 'De quanto em quanto tempo precisa fazer?' },
          { de: 'assistente', texto: 'A Carla recomenda uma limpeza a cada 30 a 45 dias. Para acne ou manchas, ela avalia na primeira sessão se vale combinar com peeling.', destaque: 'Explica com as suas informações' },
          { de: 'cliente', texto: 'Parcela no cartão?' },
          { de: 'assistente', texto: 'Aceitamos Pix, débito e crédito. O pacote com 3 limpezas sai por *R$ 390* e parcela em até 3x sem juros.' },
          { de: 'cliente', texto: 'Quero marcar a primeira! Sábado de manhã tem?' },
          { de: 'nota', texto: AGENDA_CONSULTADA },
          { de: 'assistente', texto: 'Tem sim! No sábado (26/10) está livre das 09:00 às 12:00. A limpeza leva 1h30: que horas prefere?' },
          { de: 'cliente', texto: '9h. Juliana Souza' },
          { de: 'assistente', texto: 'Agendado! ✅\n*Serviço:* Limpeza de pele profunda\n*Data:* sábado, 26/10\n*Horário:* 09:00 às 10:30\n\n*Importante:* venha sem maquiagem, tá? 😊', destaque: 'Segue as suas instruções obrigatórias' },
          { de: 'notificacao', titulo: 'Novo agendamento', texto: 'Juliana Souza · Limpeza de pele · sáb 26/10 às 09:00', destaque: 'Marca sozinho e te avisa no celular' },
          {
            de: 'tela', destaque: 'O horário já entra na sua agenda',
            agenda: {
              link: 'dizai.com/l/espaco-renova/agenda',
              dias: [
                { data: '2024-10-23', detalhe: '2', marcado: true }, { data: '2024-10-24', detalhe: '3', marcado: true },
                { data: '2024-10-25', detalhe: '4', marcado: true }, { data: '2024-10-26', detalhe: '3', marcado: true },
                { data: '2024-10-27', detalhe: 'Fechado' }, { data: '2024-10-28', detalhe: '1', marcado: true },
                { data: '2024-10-29', detalhe: '2', marcado: true },
              ],
              selecionado: '2024-10-26',
              titulo: 'Sábado, 26/10',
              horarios: [
                { inicio: '09:00', fim: '10:30', nome: 'Juliana Souza', servicos: 'Limpeza de pele profunda', duracao: '1h30', whatsapp: '(83) 98620-1145', valor: 150, assistente: true, novo: true },
                { inicio: '13:00', fim: '14:00', nome: 'Renata Alves', servicos: 'Drenagem linfática', duracao: '1h', whatsapp: '(83) 99417-8023', valor: 120, assistente: true },
                { inicio: '14:30', fim: '16:00', nome: 'Camila Rocha', servicos: 'Limpeza de pele profunda', duracao: '1h30', whatsapp: '(83) 98155-6630', valor: 150 },
              ],
            },
          },
          { de: 'dia', texto: 'Sábado, 26/10' },
          { de: 'assistente', hora: '07:00', texto: 'Oi, Juliana! 😊 Passando para lembrar do seu horário de hoje às 09:00 (Limpeza de pele profunda).\nVocê confirma a presença?' },
          { de: 'cliente', texto: 'Sim, estarei aí!' },
          { de: 'assistente', texto: 'Presença confirmada! ✅\nTe esperamos sábado, 26/10 às 09:00 (Limpeza de pele profunda).', destaque: 'Lembra a cliente e confirma a presença' },
          { de: 'assistente', hora: '10:45', texto: 'Obrigado pela visita, Juliana! 😊\n\nFoi um prazer te atender. Quando quiser marcar o próximo horário, é só me chamar por aqui.', destaque: 'Agradece sozinho depois do atendimento' },
        ],
      },
    ],
  },
  produtos: {
    rotulo: 'Produtos',
    exemplos: 'Doces, salgados, presentes…',
    icone: 'caixa',
    segmentos: [
      {
        id: 'doces', rotulo: 'Doces e bolos', loja: 'Doces da Ju', inicial: 'J', cor: '#C2185B', dono: 'Ju', artigo: 'da', inicio: '15:20',
        passos: [
          { de: 'cliente', texto: 'Oi! Vocês fazem bolo de aniversário?' },
          { de: 'assistente', texto: 'Boa tarde! Aqui é o assistente virtual da Doces da Ju 🎂' },
          { de: 'assistente', texto: 'Fazemos sim! Te mando o nosso cardápio com os sabores e tamanhos:' },
          { de: 'documento', nome: 'Cardápio Doces da Ju.pdf', detalhe: '2 páginas · PDF', destaque: 'Envia o seu catálogo em PDF' },
          { de: 'cliente', texto: 'Quanto fica um bolo de ninho com morango pra 30 pessoas? E 100 brigadeiros' },
          { de: 'assistente', texto: 'Fica assim:\n- Bolo Ninho com Morango (30 fatias): R$ 180,00\n- 100 brigadeiros gourmet (R$ 1,80 cada): R$ 180,00\n\n*Total: R$ 360,00*\n\nPara quando seria?', destaque: 'Faz o orçamento com os seus preços' },
          { de: 'cliente', texto: 'Pra sexta agora! Vocês entregam?' },
          { de: 'assistente', texto: 'Entregamos sim, com taxa de R$ 10 a R$ 20 conforme o bairro.\nSó que bolos de festa precisam de *3 dias de antecedência*: o primeiro dia livre é sábado (26/10). Pode ser?', destaque: 'Respeita prazo e regras de entrega' },
          { de: 'cliente', texto: 'Pode ser sábado. Quero encomendar!' },
          { de: 'assistente', texto: 'Ótimo! Para anotar o seu pedido, me passa:\n- Seu nome\n- Endereço de entrega\n- Horário que prefere receber\n- Forma de pagamento', destaque: 'Anota os dados que você escolheu' },
          { de: 'cliente', texto: 'Ana Paula, Rua das Flores 120, Centro. Umas 15h. Pix' },
          { de: 'assistente', texto: 'Anotei! Confere:\n- Bolo Ninho com Morango (30 fatias)\n- 100 brigadeiros gourmet\n- Entrega: sábado, 26/10, às 15h\n- Endereço: Rua das Flores, 120, Centro\n- Pagamento: Pix\n\nEstá tudo certo?' },
          { de: 'cliente', texto: 'Tudo certo!' },
          { de: 'assistente', texto: '1 Minuto!' },
          { de: 'notificacao', titulo: 'Pedido pronto para fechar', texto: 'Ana Paula · Bolo + 100 brigadeiros · sáb 26/10', destaque: 'Te entrega o pedido pronto para fechar' },
          { de: 'dono', texto: 'Oi, Ana! Aqui é a Ju 💕 Pedido confirmado! Já te mando a chave Pix.' },
          { de: 'dia', texto: 'Sábado, 26/10' },
          {
            de: 'tela', destaque: 'Você organiza o pedido na tela de Pedidos',
            pedido: {
              nome: 'Ana Paula', whatsapp: '(83) 98812-4410', confirmadoHa: '2 dias',
              resumo: [
                { campo: 'Itens', valor: 'Bolo Ninho com Morango (30 fatias), 100 brigadeiros gourmet' },
                { campo: 'Entrega', valor: 'Sábado, 26/10, às 15h' },
                { campo: 'Endereço', valor: 'Rua das Flores, 120, Centro' },
                { campo: 'Pagamento', valor: 'Pix' },
              ],
              valor: 360,
            },
          },
          { de: 'dono', hora: '15:40', texto: 'Obrigado pela preferência, Ana! Esperamos que goste 💛 Qualquer coisa, é só chamar por aqui.', destaque: 'Entregue: o agradecimento vai pelo WhatsApp' },
        ],
      },
      {
        id: 'salgados', rotulo: 'Salgados', loja: 'Salgados da Rosa', inicial: 'R', cor: '#D9822B', dono: 'Rosa', artigo: 'da', inicio: '08:05',
        passos: [
          { de: 'cliente', texto: 'Bom dia! Quanto fica o cento de salgado frito?' },
          { de: 'assistente', texto: 'Bom dia! Aqui é o assistente virtual dos Salgados da Rosa 🥟' },
          { de: 'assistente', texto: 'O cento de salgados fritos é *R$ 90*. O pedido mínimo é de 50 unidades. Os sabores estão no cardápio:' },
          { de: 'imagem', titulo: 'Cardápio de salgados', detalhe: 'Coxinha · Risole · Kibe · Bolinha de queijo · Enroladinho', destaque: 'Envia o cardápio em imagem' },
          { de: 'cliente', texto: 'Quero 300 pra sábado, metade coxinha e o resto sortido' },
          { de: 'assistente', texto: 'Fica assim:\n- 150 coxinhas: R$ 135,00\n- 150 sortidos (risole, kibe e bolinha de queijo): R$ 135,00\n\n*Total: R$ 270,00*\n\nVai retirar ou quer receber em casa?', destaque: 'Faz o orçamento com os seus preços' },
          { de: 'cliente', texto: 'Retirar. Dá pra levar congelado? Quero fritar na hora' },
          { de: 'assistente', texto: 'Dá sim! O congelado sai pelo mesmo valor e vai com as instruções para fritar. 😉', destaque: 'Responde as dúvidas de sempre' },
          { de: 'cliente', texto: 'Fechado então! Pode separar' },
          { de: 'assistente', texto: '1 Minuto!' },
          { de: 'notificacao', titulo: 'Cliente quer fechar um pedido', texto: '"Quero 300 pra sábado, metade coxinha…" · R$ 270', destaque: 'No modo "me chamar", te passa a conversa' },
          { de: 'dono', texto: 'Oi! Aqui é a Rosa 😊 Separado: 300 congelados para sábado. Qual o seu nome e que horas você passa?' },
          { de: 'nota', texto: 'A Rosa assumiu: o assistente saiu desta conversa', destaque: 'Você assume quando quiser' },
        ],
      },
      {
        id: 'presentes', rotulo: 'Presentes', loja: 'Ateliê das Flores', inicial: 'A', cor: '#3F7D58', dono: 'Bia', artigo: 'do', inicio: '10:12',
        passos: [
          { de: 'cliente', texto: 'Oi! Vocês fazem buquê de rosas pra entregar hoje?' },
          { de: 'assistente', texto: 'Olá! Aqui é a assistente virtual do Ateliê das Flores 💐' },
          { de: 'assistente', texto: 'Fazemos sim! Pedidos até as 16h são entregues no mesmo dia. O buquê com 12 rosas vermelhas sai por *R$ 129,90* e o com 24 rosas por *R$ 219,90*.', destaque: 'Responde preços e prazos de entrega' },
          { de: 'cliente', texto: 'Tem foto dos buquês?' },
          { de: 'link', url: 'dizai.app/l/atelie-das-flores', titulo: 'Ateliê das Flores · Buquês, cestas e arranjos', destaque: 'Envia o portfólio com as fotos' },
          { de: 'cliente', texto: 'Quero o de 12 rosas. Dá pra mandar um cartão junto?' },
          { de: 'assistente', texto: 'Dá sim! O cartão com a sua mensagem vai junto, sem custo. Para acompanhar, temos a caixa de Ferrero Rocher por + R$ 24,90. Quer incluir?', destaque: 'Oferece os adicionais, sem insistir' },
          { de: 'cliente', texto: 'Quero sim!' },
          { de: 'assistente', texto: 'Para anotar o seu pedido, me passa:\n- Seu nome\n- Para quem é e o endereço de entrega\n- A mensagem do cartão\n- Forma de pagamento', destaque: 'Anota os dados que você escolheu' },
          { de: 'cliente', texto: 'Lucas Andrade. Pra Marina, Av. Cabo Branco 1500, ap 302. "Feliz aniversário, meu amor!" Pix' },
          { de: 'assistente', texto: 'Anotei! Confere:\n- Buquê com 12 rosas vermelhas\n- Caixa de Ferrero Rocher\n- Cartão: "Feliz aniversário, meu amor!"\n- Entrega hoje para Marina: Av. Cabo Branco, 1500, ap 302\n- Pagamento: Pix\n\n*Total: R$ 154,80*\n\nEstá tudo certo?' },
          { de: 'cliente', texto: 'Tudo certo!' },
          { de: 'assistente', texto: '1 Minuto!' },
          { de: 'notificacao', titulo: 'Pedido pronto para fechar', texto: 'Lucas · Buquê 12 rosas + Ferrero · entrega hoje', destaque: 'Te entrega o pedido pronto para fechar' },
          { de: 'dono', texto: 'Oi, Lucas! Aqui é a Bia 🌹 Pedido confirmado! Já te mando a chave Pix.' },
          {
            de: 'tela', destaque: 'Você organiza o pedido na tela de Pedidos',
            pedido: {
              nome: 'Lucas Andrade', whatsapp: '(83) 99471-2280', confirmadoHa: '3 h',
              resumo: [
                { campo: 'Itens', valor: 'Buquê com 12 rosas vermelhas, caixa de Ferrero Rocher' },
                { campo: 'Cartão', valor: '"Feliz aniversário, meu amor!"' },
                { campo: 'Entrega', valor: 'Hoje, para Marina' },
                { campo: 'Endereço', valor: 'Av. Cabo Branco, 1500, ap 302' },
                { campo: 'Pagamento', valor: 'Pix' },
              ],
              valor: 154.8,
            },
          },
          { de: 'dono', hora: '14:52', texto: 'Obrigado pela preferência, Lucas! Esperamos que goste 💛 Qualquer coisa, é só chamar por aqui.', destaque: 'Entregue: o agradecimento vai pelo WhatsApp' },
        ],
      },
    ],
  },
};

export const TIPOS_NEGOCIO: TipoNegocio[] = ['servicos', 'produtos'];

/** O segmento pelo id (de qualquer tipo); sem id ou id desconhecido, o primeiro do tipo. */
export function acharSegmento(tipo: TipoNegocio, id?: string | null): SegmentoDemonstracao {
  const segmentos = DEMONSTRACOES[tipo].segmentos;
  return segmentos.find((segmento) => segmento.id === id) ?? segmentos[0];
}

/** Os destaques do segmento, na ordem em que aparecem. */
export function destaquesDe(segmento: SegmentoDemonstracao): string[] {
  return segmento.passos.flatMap((passo) => (passo.destaque ? [passo.destaque] : []));
}
