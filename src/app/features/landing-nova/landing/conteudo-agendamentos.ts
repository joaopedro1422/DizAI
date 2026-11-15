import { ROTA_LANDING } from '../../landing/conteudo-landing';
import { ConteudoLandingNova, EtapaAviso, PERGUNTAS_COMUNS } from './conteudo-landing-nova';

/**
 * Textos e exemplos da landing de agendamentos (/agendamentos). O foco é a dor de quem marca horário à mão pelo
 * WhatsApp: parar o atendimento para responder, o vai e volta do "tem horário?", agenda no caderno e as faltas.
 */
const LOGOS = '/landing/galeria/logos';
const UNHAS = '/landing/galeria/unhas';

export const FOTOS_AGENDA = {
  unhas: `${UNHAS}/01.webp`,
  barbearia: '/landing/hub/barbearia.webp',
  estetica: '/landing/hub/estetica.webp',
  logoBella: `${LOGOS}/studio-bella.webp`,
  logoLeo: `${LOGOS}/barbearia-do-leo.svg`,
  logoRenova: `${LOGOS}/espaco-renova.svg`,
  trabalhos: ['02', '03', '04', '05', '06', '07'].map((n) => `${UNHAS}/${n}.webp`),
};

export type CenaAgenda = 'conversa' | 'agenda' | 'mensagens' | 'vaga' | 'numeros';

export const PASSOS_AGENDA: { titulo: string; texto: string; cena: CenaAgenda }[] = [
  { titulo: 'Responde o seu cliente', texto: 'Tira dúvidas, passa os valores e mostra só os horários livres, enquanto você atende.', cena: 'conversa' },
  { titulo: 'Marca direto na sua agenda', texto: 'Marca, remarca e cancela pela conversa, com a duração certa de cada serviço. Sem horário em dobro.', cena: 'agenda' },
  { titulo: 'Confirma, lembra e agradece sozinho', texto: 'A confirmação sai na hora, o lembrete antes do horário e o agradecimento depois. Você não digita nada.', cena: 'mensagens' },
  { titulo: 'Recupera o horário vago', texto: 'Desmarcou? A vaga vai para o primeiro da lista de espera, que confirma com um toque.', cena: 'vaga' },
  { titulo: 'Mostra quanto você faturou', texto: 'Faturamento, ocupação, serviços mais feitos e os clientes que voltam.', cena: 'numeros' },
];

/** As mensagens automáticas da agenda (as padrão do AgendaService), na ordem em que saem. */
export const ETAPAS_AGENDA: EtapaAviso[] = [
  { nome: 'Agendado', mensagem: 'Agendado! ✅\n🛠️ Serviço: Pé e mão\n📅 Data: amanhã\n⏰ Horário: 14:00\n👤 Nome: Maria' },
  { nome: 'Lembrete', mensagem: 'Oi, Maria! Lembrando do seu horário hoje às 14:00. Podemos confirmar?' },
  { nome: 'Obrigado', mensagem: 'Obrigada pela visita, Maria! Foi um prazer te atender 💅' },
];

export const RECURSOS_AGENDA = {
  checks: [
    'Informa só os horários livres da sua agenda',
    'Marca, remarca e cancela agendamentos sozinho',
    'Aceita vários profissionais',
    'Lembra, confirma a presença e agradece depois do atendimento',
    'Mensagens personalizadas por você',
  ],
  alem: [
    ['Lista de espera', 'Dia lotado e clientes esperando? Vagou horário, a mensagem de aviso é enviada aos clientes na ordem da fila.'],
    ['Produtos à venda', 'Esmalte, shampoo, minoxidil: o cliente reserva junto do horário e você registra cada venda.'],
    ['Lembrete de retorno', 'Marque quando o cliente deve voltar. Na véspera, ele recebe o lembrete automaticamente.'],
  ],
  horarios: ['09:00', '10:30', '14:00', '15:30', '17:00', '18:30'],
};

export const TABELA_AGENDA: [string, string, string][] = [
  ['Responder "tem horário?"', 'Você para o atendimento', 'Responde e marca'],
  ['Mensagem às 23h', 'Responde amanhã', 'Agendado na hora'],
  ['Marcar o horário', 'Caderno, print, memória', 'Na agenda, sem dobrar'],
  ['Cliente que esquece', 'Cadeira vazia', 'Lembrete e confirmação'],
  ['Horário desmarcado', 'Fica vazio', 'Vai para a lista de espera'],
  ['Saber quanto faturou', 'Conta de cabeça', 'Painel pronto'],
];

export const CONTEUDO_AGENDAMENTOS: ConteudoLandingNova = {
  tipo: 'servicos',
  tituloPagina: 'DizAI para quem agenda pelo WhatsApp: horários marcados sem você parar',
  rota: ROTA_LANDING.servicos,
  outra: { rota: ROTA_LANDING.produtos, rotulo: 'Para quem vende' },
  rotuloRecursos: 'Recursos da agenda',
  hero: {
    descricao:
      'Chega de parar o atendimento para marcar horário. O DizAI responde no seu WhatsApp, mostra os horários livres, marca na sua agenda e lembra o cliente antes.',
    garantias: ['No seu número de sempre', 'Pronto em poucos minutos', 'Ferramentas de marketing', 'Todos os tipos de negócio'],
    conversas: [
      {
        chave: 'manicure',
        rotulo: 'Manicure',
        loja: 'Studio Bella Unhas',
        logo: FOTOS_AGENDA.logoBella,
        aviso: ['Novo horário na agenda', 'Gel · amanhã, 14:00'],
        msgs: [
          ['c', 'Oi! Quanto custa a esmaltação em gel?'],
          ['l', 'Bom dia! A esmaltação em gel fica R$ 60 e leva 1 hora. Quer agendar?'],
          ['c', 'Quero sim, tem amanhã à tarde?'],
          ['l', 'Amanhã à tarde tenho às 14:00, 15:30 e 17:00. Qual fica melhor?'],
          ['c', '14h, por favor. Sou a Maria'],
          ['l', 'Agendado! ✅\nEsmaltação em gel\nAmanhã às 14:00\nMaria'],
        ],
      },
      {
        chave: 'barbearia',
        rotulo: 'Barbearia',
        loja: 'Barbearia do Léo',
        logo: FOTOS_AGENDA.logoLeo,
        aviso: ['Novo horário na agenda', 'Corte + barba · hoje, 16:00'],
        msgs: [
          ['c', 'Tem horário hoje para corte e barba?'],
          ['l', 'Tenho! Com o Léo às 16:00 ou com o Rafa às 17:30. Com quem você prefere?'],
          ['c', 'Com o Léo'],
          ['l', 'Fechado. Qual é o seu nome?'],
          ['c', 'Pedro'],
          ['l', 'Agendado! ✅\nCorte + barba com o Léo\nHoje às 16:00\nPedro'],
        ],
      },
      {
        chave: 'estetica',
        rotulo: 'Estética',
        loja: 'Espaço Renova',
        logo: FOTOS_AGENDA.logoRenova,
        aviso: ['Novo horário na agenda', 'Limpeza de pele · sábado'],
        msgs: [
          ['c', 'Como funciona a limpeza de pele?'],
          ['l', 'A limpeza de pele profunda dura 1h30 e fica R$ 150. Remove cravos, hidrata e acalma a pele. Quer agendar?'],
          ['c', 'Quero, sábado de manhã tem?'],
          ['l', 'Sábado tenho às 9:00 e às 10:30. Qual prefere?'],
          ['c', '9h. Ana Paula'],
          ['l', 'Agendado! ✅\nLimpeza de pele\nSábado às 9:00\nAna Paula'],
        ],
      },
    ],
  },
  dores: {
    titulo: ['Marcar horário à mão', 'virou um segundo trabalho.'],
    itens: [
      {
        titulo: 'Você para um atendimento para marcar outro',
        texto: 'Com a cliente na cadeira, você larga o que está fazendo para abrir a agenda e responder. Ou deixa para depois, e ela marca em outro lugar.',
        citacao: '"Oi! Tem horário hoje à tarde?" · enviada há 2 h',
      },
      {
        titulo: 'Dez mensagens para marcar um horário',
        texto: 'Você oferece um horário, o cliente pede outro, você confere a agenda de novo. Um vai e volta que se repete o dia inteiro.',
        citacao: '"Pode ser às 16h?" "E às 17h?" "Então sexta?"',
      },
      {
        titulo: 'Agenda no caderno, faltas na cadeira',
        texto: 'Horário anotado em dobro, cliente que esquece e ninguém para lembrar antes. O buraco no meio do dia sai do seu bolso.',
        citacao: '"Esqueci completamente, desculpa!" · 15 min depois do horário',
      },
    ],
  },
  bloqueio: {
    contador: '9 pedidos de horário esperando',
    avisos: [
      { nome: 'Maria Souza', cor: '#B4466A', texto: 'Oi! Tem horário hoje à tarde?', quando: 'há 2 h' },
      { nome: 'Lucas Prado', cor: '#2B2B2B', texto: 'Quanto fica corte e barba?', quando: 'há 1 h' },
      { nome: 'Bia Martins', cor: '#3F7D58', texto: 'Pode ser às 15h?', quando: 'há 40 min' },
      { nome: 'Rafael Dias', cor: '#2F5FA8', texto: 'Preciso remarcar o de amanhã', quando: 'há 15 min' },
      { nome: 'Júlia Reis', cor: '#7A4FB5', texto: 'Oi?? Ainda tem vaga amanhã?', quando: 'agora' },
    ],
  },
  prova: {
    loja: 'Barbearia do Léo',
    logo: FOTOS_AGENDA.logoLeo,
    objetivo: 'o cliente marcar com você',
    sem: [
      ['c', 'Fala! Tem horário hoje para corte?', '10:02'],
      ['t', '18 minutos depois', ''],
      ['c', 'Pode ser depois das 17h', '10:20'],
      ['t', '18 minutos depois', ''],
      ['c', 'Deixa, marquei em outro lugar', '10:38'],
    ],
    com: [
      ['c', 'Fala! Tem horário hoje para corte?', '10:02'],
      ['l', 'Tem sim! Hoje às 16:00, 17:30 ou 18:30. Qual fica melhor?', '10:02'],
      ['c', '17:30. Pedro', '10:03'],
      ['l', 'Agendado! ✅ Corte · hoje às 17:30 · Pedro', '10:03'],
    ],
    fimSem: 'Marcou em outro lugar',
    fimCom: 'Agendado em 1 minuto',
  },
  como: {
    cadastro: ['Cadastre os seus serviços e horários', 'Serviços, duração, preços, os dias em que você atende e quem da equipe faz cada um.'],
    atende: ['Ele marca na sua agenda', 'O cliente pede o horário e ele marca sozinho, só nos horários livres, sem você parar o atendimento.'],
    selo: '✓ Marcado na agenda',
    slides: [
      {
        produto: 'Esmaltação em gel', preco: 'R$ 60', opcao: 'Dias de atendimento', regra: '08:00 às 18:00',
        valores: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], extra: ['Duração', '1 h'],
        pergunta: 'Tem horário amanhã à tarde para gel?',
        resposta: 'Tenho às 14:00, 15:30 e 17:00. Qual fica melhor para você? 💅',
      },
      {
        produto: 'Corte + barba', preco: 'R$ 55', opcao: 'Quem atende', regra: 'O cliente escolhe com quem',
        valores: ['Léo', 'Rafa', 'Qualquer um'], extra: ['Duração', '45 min'],
        pergunta: 'Tem horário hoje com o Léo?',
        resposta: 'Tenho! Com o Léo às 16:00 ou às 18:30. Qual prefere?',
      },
      {
        produto: 'Limpeza de pele', preco: 'R$ 150', opcao: 'Lembrete para o cliente', regra: 'Sai sozinho',
        valores: ['1 h antes', '2 h antes', '1 dia antes'], extra: ['Duração', '1 h 30'],
        pergunta: 'Tem horário sábado de manhã?',
        resposta: 'Sábado tenho às 9:00 e às 10:30. Qual fica melhor?',
      },
    ],
  },
  dia: [
    { momento: 'Pedido de horário de madrugada', titulo: 'Marca em segundos, 24 horas', texto: 'De madrugada, no domingo ou com a cliente na cadeira.', visual: 'conversa', conversa: ['Tem horário amanhã cedo?', 'Tenho às 8:00 e às 9:30! Qual prefere?'] },
    { momento: 'Chegou um áudio', titulo: 'Entende os áudios', texto: 'O cliente manda voz, ele entende e responde por escrito.', visual: 'audio' },
    { momento: 'Pediram os valores', titulo: 'Envia a sua tabela', texto: 'Tabela de serviços, preços ou portfólio, em PDF ou imagem.', visual: 'arquivo', detalhe: 'Tabela de serviços.pdf' },
    { momento: 'Uma pergunta difícil', titulo: 'Não inventa: te chama', texto: 'Se não souber, avisa você no celular. Depois, ele aprende a resposta.', visual: 'chama', detalhe: '"Vocês atendem a domicílio?"' },
    { momento: 'Você quis responder', titulo: 'Você assume quando quiser', texto: 'Respondeu pelo celular? Ele sai daquela conversa na hora.', visual: 'chave' },
    { momento: 'Do jeito do seu espaço', titulo: 'Fala do seu jeito', texto: 'Saudação, regras e jeito de falar definidos por você.', visual: 'jeito' },
  ],
  semAssistente:
    'Sem problemas, todos os recursos da plataforma podem ser utilizados sem ele. Você agenda os horários manualmente para organizar o seu negócio.',
  vitrine: {
    texto: 'O link para a bio do Instagram e para mandar no WhatsApp. O cliente vê os seus trabalhos e escolhe o horário na agenda online, sem precisar te chamar.',
    itens: [
      'Portfólio com as fotos do seu trabalho',
      'Avaliações dos clientes, endereço no Maps e informações gerais',
      'Você define cores, estilo, tipo de fonte e muito mais',
    ],
    textoPosts: 'Escolha o que divulgar e receba as artes prontas para o feed e o story: horários livres da semana, serviços e preços, com a legenda escrita.',
    diferenciais: [
      ['Com a sua identidade', 'A sua logo, as suas cores, as suas fotos e a fonte da sua vitrine.'],
      ['Com os seus horários de verdade', 'Os horários livres da agenda e os serviços com preço, tirados do seu cadastro.'],
      ['Legenda pronta', 'Título, chamada e hashtags. É baixar e postar.'],
    ],
  },
  confiancaCabeca: { rotulo: 'Você no controle', titulo: ['O assistente trabalha.', 'Você continua no comando.'] },
  confianca: [
    ['Você escolhe como ele marca', 'Ele marca sozinho na sua agenda ou te chama antes. Você decide.'],
    ['Só os horários livres', 'Ele oferece o que cabe na sua agenda, com a duração de cada serviço. Nada de horário em dobro.'],
    ['Assume quando quiser', 'Respondeu pelo celular? Ele sai daquela conversa na hora.'],
    ['Não inventa respostas', 'Se não souber, responde "vou confirmar" e te chama.'],
    ['Contatos pessoais ficam de fora', 'Família e amigos não recebem resposta do assistente.'],
    ['Liga e desliga quando quiser', 'No seu número de sempre, sem trocar de chip nem de aplicativo.'],
  ],
  ramos: [
    {
      titulo: 'Beleza',
      quem: 'Manicure, salão, barbearia, sobrancelhas, cílios',
      fotos: [FOTOS_AGENDA.unhas, FOTOS_AGENDA.barbearia],
      faz: ['Marca vários serviços juntos', 'Agenda para a equipe toda', 'Lembrete de retorno da manutenção'],
    },
    {
      titulo: 'Estética e bem-estar',
      quem: 'Esteticista, massoterapia, depilação, podologia',
      fotos: [FOTOS_AGENDA.estetica],
      faz: ['Explica cada procedimento e o preço', 'Lembrete e confirmação de presença', 'Lista de espera para horários vagos'],
    },
    {
      titulo: 'Pets, aulas e treinos',
      quem: 'Banho e tosa, aulas, personal, tatuagem',
      fotos: [],
      faz: ['Agenda online para o cliente escolher', 'Remarca e cancela pela conversa', 'Agradece e chama de volta no tempo certo'],
    },
  ],
  perguntas: [
    ['Ele marca horário sozinho?', 'Sim. Ele só oferece os horários livres da sua agenda, conta a duração de cada serviço e marca na hora. Se preferir, ele te chama em vez de marcar.'],
    ['Preciso usar o assistente de IA?', 'Não. Você pode desligar o assistente quando quiser e responder os clientes você mesmo. A gestão continua funcionando: a agenda, os lembretes, os números, a vitrine, os posts e as campanhas.'],
    ['E se ele marcar dois clientes no mesmo horário?', 'Não marca. Antes de confirmar, o sistema confere a agenda de novo; se o horário acabou de ser ocupado, ele oferece os que ainda estão livres.'],
    ['E se o cliente faltar ou quiser remarcar?', 'Ele manda o lembrete antes do horário e pede a confirmação de presença. Para remarcar ou cancelar, o cliente fala com ele mesmo, e a vaga volta para a agenda.'],
    ['Tenho mais de um profissional. Funciona?', 'Funciona. Cada profissional tem a sua agenda e o cliente escolhe com quem, ou "qualquer um" e o assistente acha quem está livre.'],
    ...PERGUNTAS_COMUNS,
  ],
  final: {
    titulo: 'Deixe o DizAI cuidar da sua agenda.',
    texto: 'Cadastre os seus serviços e horários em poucos minutos e veja o assistente marcando um horário de verdade.',
  },
};
