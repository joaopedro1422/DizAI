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
   */
  de: 'cliente' | 'assistente' | 'dono' | 'documento' | 'imagem' | 'link' | 'nota' | 'notificacao' | 'dia';
  texto?: string;
  titulo?: string;
  nome?: string;
  detalhe?: string;
  url?: string;
  /** O que acende quando o passo chega (a legenda do hero e os checks da página de demonstração). */
  destaque?: string;
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
          { de: 'dia', texto: 'Quinta-feira, 24/10' },
          { de: 'assistente', texto: 'Oi, Fernanda! Lembrando do seu horário hoje às 16:00: Esmaltação em gel. Podemos confirmar?' },
          { de: 'cliente', texto: 'Confirmadíssimo! 😍' },
          { de: 'nota', texto: '✅ Presença confirmada na sua agenda', destaque: 'Lembra a cliente e confirma a presença' },
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
        ],
      },
    ],
  },
  produtos: {
    rotulo: 'Produtos',
    exemplos: 'Doces, salgados, roupas, sob medida…',
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
          { de: 'assistente', texto: '1 minuto! Já te confirmo.' },
          { de: 'notificacao', titulo: 'Pedido pronto para fechar', texto: 'Ana Paula · Bolo + 100 brigadeiros · sáb 26/10', destaque: 'Te entrega o pedido pronto para fechar' },
          { de: 'dono', texto: 'Oi, Ana! Aqui é a Ju 💕 Pedido confirmado! Já te mando a chave Pix.' },
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
        id: 'moda', rotulo: 'Moda', loja: 'Use Mel', inicial: 'M', cor: '#3E5BA9', dono: 'Mel', artigo: 'da', inicio: '19:30',
        passos: [
          { de: 'cliente', texto: 'Oi! Tem o vestido midi floral no M?' },
          { de: 'assistente', texto: 'Olá! Bem-vinda à Use Mel 🌸 Sou a assistente virtual da loja.' },
          { de: 'assistente', texto: 'Temos sim! O vestido midi floral está no P, M e G, nas cores azul e terracota. Sai por *R$ 139,90*.', destaque: 'Responde tamanhos, cores e preços' },
          { de: 'cliente', texto: 'Me manda a coleção nova?' },
          { de: 'documento', nome: 'Coleção Primavera Use Mel.pdf', detalhe: '8 páginas · PDF', destaque: 'Envia o seu catálogo em PDF' },
          { de: 'cliente', texto: 'E se não servir, posso trocar?' },
          { de: 'assistente', texto: 'Pode sim! Você tem *7 dias* para trocar, com a etiqueta. A primeira troca é por nossa conta. 😉', destaque: 'Segue as suas políticas de troca' },
          { de: 'cliente', texto: 'Então quero o azul no M! Vocês enviam pra Recife?' },
          { de: 'assistente', texto: 'Enviamos para todo o Brasil. Para anotar o seu pedido, me passa:\n- Seu nome\n- CEP e endereço\n- Forma de pagamento (Pix ou cartão)', destaque: 'Anota os dados que você escolheu' },
          { de: 'cliente', texto: 'Larissa Melo, 50030-230, Rua da Aurora 45. Cartão' },
          { de: 'assistente', texto: 'Anotei! Confere:\n- Vestido midi floral azul, tamanho M\n- Envio: Rua da Aurora, 45, Recife (50030-230)\n- Pagamento: cartão\n\nEstá tudo certo?' },
          { de: 'cliente', texto: 'Certinho!' },
          { de: 'assistente', texto: '1 minuto! Já te confirmo.' },
          { de: 'notificacao', titulo: 'Pedido pronto para fechar', texto: 'Larissa · Vestido midi floral M · envio para Recife', destaque: 'Te entrega o pedido pronto para fechar' },
        ],
      },
      {
        id: 'sob-medida', rotulo: 'Sob medida', loja: 'Casa das Cortinas', inicial: 'C', cor: '#7A5C3E', dono: 'Paulo', artigo: 'do', inicio: '11:47',
        passos: [
          { de: 'cliente', texto: 'Olá! Vocês fazem cortina blackout pra quarto?' },
          { de: 'assistente', texto: 'Olá! Aqui é o assistente virtual da Casa das Cortinas 👋' },
          { de: 'assistente', texto: 'Fazemos sim! O blackout vem nas cores branco, cinza e bege, em tecido ou rolô.', destaque: 'Explica modelos e materiais' },
          { de: 'cliente', texto: 'Quanto fica mais ou menos?' },
          { de: 'assistente', texto: 'O valor depende da medida da janela e do modelo. Para te passar o orçamento certinho, o Paulo faz uma visita para medir, *sem custo*.', destaque: 'Não inventa preço: segue as suas regras' },
          { de: 'cliente', texto: 'Tem foto de umas que vocês já fizeram?' },
          { de: 'link', url: 'dizai.app/l/casa-das-cortinas', titulo: 'Casa das Cortinas · Blackout, rolô e voil', destaque: 'Envia o portfólio com as fotos' },
          { de: 'cliente', texto: 'Gostei! Quero marcar a visita' },
          { de: 'assistente', texto: 'Ótimo! Para agendar a visita, me passa:\n- Seu nome\n- Endereço\n- Melhor dia e horário\n- Quantas janelas são', destaque: 'Anota os dados que você escolheu' },
          { de: 'cliente', texto: 'Renata, Rua Ipê 300, ap 52. Sábado de manhã. São 2 janelas' },
          { de: 'assistente', texto: '1 minuto! Já te confirmo.' },
          { de: 'notificacao', titulo: 'Pedido pronto para fechar', texto: 'Renata · visita para 2 janelas · sábado de manhã', destaque: 'Te entrega o pedido pronto para fechar' },
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
