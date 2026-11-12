import {
  ClienteResultado,
  DiaLivre,
  Individuais,
  Oportunidade,
  PreviaCampanha,
  RascunhoCampanha,
  ResultadoCampanha,
  ResumoCampanha,
  SituacaoCampanhas,
} from '../models/campanha.model';

/**
 * Modo demonstração das Campanhas (?demonstracao=1 no painel ou na tela de Campanhas): dados de exemplo para ver
 * oportunidades, contatos individuais, histórico e relatórios numa conta sem clientes. Nada vai para o backend nem
 * para o WhatsApp. Serviços = um estúdio de unhas; produtos = uma confeitaria.
 */

const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function dia(somar: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + somar);
  return d;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function rotulo(d: Date): string {
  return `${SEMANA[d.getDay()]} (${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')})`;
}

function instante(somarDias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + somarDias);
  return d.toISOString();
}

/** A próxima ocorrência de um dia/mês (o Natal deste ano ou do próximo). */
function proxima(mes: number, diaDoMes: number): { data: Date; faltam: number } {
  const hoje = dia(0);
  let data = new Date(hoje.getFullYear(), mes - 1, diaDoMes, 12);
  if (data < hoje) data = new Date(hoje.getFullYear() + 1, mes - 1, diaDoMes, 12);
  return { data, faltam: Math.round((data.getTime() - hoje.getTime()) / 86_400_000) };
}

const NOMES_SERVICOS = ['Camila Souza', 'Juliana Lima', 'Renata Alves', 'Patrícia Gomes', 'Larissa Melo', 'Fernanda Rocha',
  'Bruna Castro', 'Aline Duarte', 'Carla Nunes', 'Débora Pires', 'Tatiane Reis', 'Vanessa Moura', 'Priscila Lopes', 'Sabrina Dias'];
const NOMES_PRODUTOS = ['Ana Paula', 'Marta Alves', 'Cláudia Ribeiro', 'Joana Silva', 'Lúcia Ferreira', 'Rosana Costa',
  'Beatriz Mendes', 'Eliane Barros', 'Simone Araújo', 'Kelly Martins', 'Gabriela Freitas', 'Helena Cardoso'];

export function situacaoDemo(servico: boolean): SituacaoCampanhas {
  const fimDeAno = proxima(12, 24);
  const natal = proxima(12, 25);
  const maes = proxima(5, 10);
  return {
    conectado: true,
    servico,
    usaAgenda: servico,
    pagamentoPendente: false,
    qualidade: 'GREEN',
    clientes: servico ? 48 : 63,
    aptos: servico ? 41 : 57,
    minimo: 3,
    liberada: true,
    modelos: 'PRONTOS',
    enviadasHoje: 0,
    limiteDiario: 250,
    tipos: servico
      ? [
          { tipo: 'CONVITE', titulo: 'Horários livres', descricao: 'Avise quem está há um tempo sem vir que abriram horários na agenda.', disponivel: true, motivo: null },
          { tipo: 'PROMOCAO', titulo: 'Promoção', descricao: 'Uma condição especial em um serviço, por tempo limitado.', disponivel: true, motivo: null },
          { tipo: 'NOVIDADE', titulo: 'Novidade', descricao: 'Um serviço novo ou uma novidade da casa.', disponivel: true, motivo: null },
          { tipo: 'DATA_ESPECIAL', titulo: 'Data especial', descricao: 'Fim de ano, Carnaval, São João: as épocas em que as pessoas mais se cuidam.', disponivel: true, motivo: null },
        ]
      : [
          { tipo: 'PROMOCAO', titulo: 'Promoção', descricao: 'Um produto com preço especial, por tempo limitado.', disponivel: true, motivo: null },
          { tipo: 'NOVIDADE', titulo: 'Novidade', descricao: 'Um produto novo no cardápio ou na vitrine.', disponivel: true, motivo: null },
          { tipo: 'CONVITE', titulo: 'Encomendas abertas', descricao: 'Avise que você está aceitando encomendas para um período.', disponivel: true, motivo: null },
          { tipo: 'DATA_ESPECIAL', titulo: 'Data especial', descricao: 'Páscoa, Dia das Mães, Natal: as datas em que mais se encomenda.', disponivel: true, motivo: null },
        ],
    datas: servico
      ? [{ id: 'FIM_DE_ANO', nome: 'Festas de fim de ano', dia: iso(fimDeAno.data), comArtigo: 'as festas de fim de ano', detalhe: 'Os horários de dezembro costumam acabar rápido.', diasAte: fimDeAno.faltam }]
      : [
          { id: 'NATAL', nome: 'Natal', dia: iso(natal.data), comArtigo: 'o Natal', detalhe: 'As encomendas para o Natal são limitadas.', diasAte: natal.faltam },
          { id: 'MAES', nome: 'Dia das Mães', dia: iso(maes.data), comArtigo: 'o Dia das Mães', detalhe: 'As encomendas para a data são limitadas.', diasAte: maes.faltam },
        ],
  };
}

export function diasLivresDemo(): DiaLivre[] {
  return [
    { data: iso(dia(1)), rotulo: `Amanhã, ${rotulo(dia(1))}`, vagas: 5, horarios: 'entre 14:00 e 17:30' },
    { data: iso(dia(2)), rotulo: primeira(rotulo(dia(2))), vagas: 3, horarios: 'às 09:00, às 10:30 ou às 16:00' },
    { data: iso(dia(4)), rotulo: primeira(rotulo(dia(4))), vagas: 6, horarios: 'entre 08:00 e 11:30 ou entre 15:00 e 17:00' },
  ];
}

function primeira(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function oportunidadesDemo(servico: boolean): Oportunidade[] {
  if (servico) {
    const fim = proxima(12, 24);
    return [
      {
        chave: `HORARIOS_LIVRES:${iso(dia(1))}`, tipo: 'CONVITE', titulo: 'Amanhã você tem 5 horários livres',
        descricao: '14 clientes estão passando da hora de voltar. Avise que abriram horários na agenda.',
        clientes: 14, vagas: 5, data: iso(dia(1)),
        rascunho: { tipo: 'CONVITE', publico: 'NO_CICLO', dataReferencia: iso(dia(1)), oportunidadeChave: `HORARIOS_LIVRES:${iso(dia(1))}` },
      },
      {
        chave: 'DATA_ESPECIAL:FIM_DE_ANO:demo', tipo: 'DATA_ESPECIAL', titulo: `Faltam ${fim.faltam} dias para as festas de fim de ano`,
        descricao: 'É agora que as pessoas começam a marcar. Avise as suas 38 clientes que a agenda está aberta.',
        clientes: 38, vagas: null, data: iso(fim.data),
        rascunho: { tipo: 'DATA_ESPECIAL', publico: 'TODOS', dataEspecialId: 'FIM_DE_ANO', oportunidadeChave: 'DATA_ESPECIAL:FIM_DE_ANO:demo' },
      },
      {
        chave: 'RECUPERAR:demo', tipo: 'RECUPERAR', titulo: '6 clientes não voltam há um bom tempo',
        descricao: 'Passou muito do intervalo de costume delas. Um convite com um motivo especial pode trazer de volta.',
        clientes: 6, vagas: null, data: null,
        rascunho: { tipo: 'RECUPERAR', publico: 'SUMIDOS', oportunidadeChave: 'RECUPERAR:demo' },
      },
    ];
  }
  const natal = proxima(12, 25);
  return [
    {
      chave: 'DATA_ESPECIAL:NATAL:demo', tipo: 'DATA_ESPECIAL', titulo: `Faltam ${natal.faltam} dias para o Natal`,
      descricao: 'É agora que as encomendas começam. Avise os seus 57 clientes.', clientes: 57, vagas: null, data: iso(natal.data),
      rascunho: { tipo: 'DATA_ESPECIAL', publico: 'TODOS', dataEspecialId: 'NATAL', oportunidadeChave: 'DATA_ESPECIAL:NATAL:demo' },
    },
    {
      chave: 'REPETIR_PEDIDO:demo', tipo: 'REPETIR_PEDIDO', titulo: '4 clientes encomendaram nesta época no ano passado',
      descricao: 'Pode ser um aniversário ou uma data da família. Lembre com antecedência, antes que procurem outro lugar.',
      clientes: 4, vagas: null, data: null,
      rascunho: { tipo: 'REPETIR_PEDIDO', publico: 'ANO_PASSADO', oportunidadeChave: 'REPETIR_PEDIDO:demo' },
    },
  ];
}

export function individuaisDemo(servico: boolean): Individuais {
  if (servico) {
    return {
      sugeridos: [
        {
          id: '5583990000001', sugestao: 'CLIENTE:demo:1', nome: 'Camila Souza', numero: '5583990000001', numeroExibicao: '(83) 99000-0001',
          motivo: 'NA_HORA', titulo: 'Camila Souza está passando da hora de voltar',
          detalhe: 'Costuma voltar a cada 21 dias · última vez há 27 dias',
          mensagem: 'Olá, Camila! Tudo bem? Já faz um tempinho desde o seu último atendimento de esmaltação em gel. '
            + 'Temos horários disponíveis amanhã, entre 14:00 e 17:30. Quer garantir o seu?',
        },
        {
          id: '5583990000002', sugestao: 'CLIENTE:demo:2', nome: 'Juliana Lima', numero: '5583990000002', numeroExibicao: '(83) 99000-0002',
          motivo: 'SUMIDO', titulo: 'Juliana Lima não volta há um bom tempo', detalhe: 'Última vez há 3 meses · Manutenção',
          mensagem: 'Olá, Juliana! Tudo bem? Faz um tempo que você não aparece por aqui e sentimos a sua falta. '
            + 'Temos horários disponíveis amanhã, entre 14:00 e 17:30. Quer garantir o seu?',
        },
      ],
      recentes: [
        { nome: 'Renata', motivo: 'NA_HORA', quando: instante(-5), respondeu: true, converteu: true, valor: 60 },
        { nome: 'Larissa', motivo: 'SUMIDO', quando: instante(-9), respondeu: true, converteu: false, valor: null },
        { nome: 'Aline', motivo: 'NA_HORA', quando: instante(-12), respondeu: false, converteu: false, valor: null },
      ],
    };
  }
  return {
    sugeridos: [
      {
        id: '5583990000011', sugestao: 'CLIENTE:demo:11', nome: 'Marta Alves', numero: '5583990000011', numeroExibicao: '(83) 99000-0011',
        motivo: 'ANO_PASSADO', titulo: 'Marta Alves encomendou nesta época no ano passado',
        detalhe: `Encomendou em ${String(dia(8).getDate()).padStart(2, '0')}/${String(dia(8).getMonth() + 1).padStart(2, '0')}/${dia(8).getFullYear() - 1} · Bolo Festivo`,
        mensagem: 'Olá, Marta! Tudo bem? No ano passado, nesta época, você fez uma encomenda de Bolo Festivo com a gente. '
          + 'Se for uma data especial de novo, já quer garantir a deste ano?',
      },
    ],
    recentes: [{ nome: 'Cláudia', motivo: 'ANO_PASSADO', quando: instante(-6), respondeu: true, converteu: true, valor: 180 }],
  };
}

export function historicoDemo(servico: boolean): ResumoCampanha[] {
  return servico
    ? [
        { id: 'demo-1', titulo: 'Horários livres de amanhã', tipo: 'CONVITE', sugerida: true, status: 'ENVIADA', criadaEm: instante(-3), enviadaEm: instante(-3), enviadas: 13, responderam: 5, converteram: 3, faturamento: 180, custo: 3.85, medindo: true },
        { id: 'demo-2', titulo: 'Promoção: 15% na manutenção do gel', tipo: 'PROMOCAO', sugerida: false, status: 'ENVIADA', criadaEm: instante(-18), enviadaEm: instante(-18), enviadas: 32, responderam: 9, converteram: 4, faturamento: 240, custo: 9.8, medindo: false },
        { id: 'demo-3', titulo: 'Clientes que sumiram', tipo: 'RECUPERAR', sugerida: true, status: 'ENVIADA', criadaEm: instante(-34), enviadaEm: instante(-34), enviadas: 7, responderam: 2, converteram: 1, faturamento: 85, custo: 2.45, medindo: false },
      ]
    : [
        { id: 'demo-1', titulo: 'Dia das Mães', tipo: 'DATA_ESPECIAL', sugerida: true, status: 'ENVIADA', criadaEm: instante(-4), enviadaEm: instante(-4), enviadas: 54, responderam: 16, converteram: 11, faturamento: 1650, custo: 16.1, medindo: true },
        { id: 'demo-2', titulo: 'Encomendas abertas para este fim de semana', tipo: 'CONVITE', sugerida: false, status: 'ENVIADA', criadaEm: instante(-21), enviadaEm: instante(-21), enviadas: 40, responderam: 8, converteram: 5, faturamento: 410, custo: 11.9, medindo: false },
      ];
}

export function resultadoDemo(servico: boolean, id: string): ResultadoCampanha {
  const resumo = historicoDemo(servico).find((c) => c.id === id) ?? historicoDemo(servico)[0];
  const nomes = servico ? NOMES_SERVICOS : NOMES_PRODUTOS;
  const clientes: ClienteResultado[] = Array.from({ length: Math.min(resumo.enviadas, 12) }, (_, i) => ({
    nome: nomes[i % nomes.length].split(' ')[0],
    numero: `(83) 99000-00${String(i + 10)}`,
    status: i === 11 ? 'FALHOU' : i < 6 ? 'LIDO' : 'ENTREGUE',
    respondeu: i < resumo.responderam,
    converteu: i < resumo.converteram,
    valor: i < resumo.converteram ? Math.round(resumo.faturamento / resumo.converteram) : null,
    erro: i === 11 ? 'Este número não recebe mensagens do WhatsApp.' : null,
  }));
  return {
    id: resumo.id,
    titulo: resumo.titulo,
    tipo: resumo.tipo,
    sugerida: resumo.sugerida,
    servico,
    status: resumo.status,
    criadaEm: resumo.criadaEm,
    enviadaEm: resumo.enviadaEm,
    medicaoAte: instante(resumo.medindo ? 4 : -10),
    medindo: resumo.medindo,
    texto: servico
      ? 'Olá, {nome}! Abriram horários para amanhã: entre 14:00 e 17:30. Quer garantir o seu? É só responder esta mensagem.'
      : 'Olá, {nome}! Estamos nos preparando para o Dia das Mães e já estamos aceitando encomendas.',
    imagem: null,
    total: resumo.enviadas + 1,
    enviadas: resumo.enviadas,
    entregues: resumo.enviadas - 1,
    lidas: Math.round(resumo.enviadas * 0.8),
    falharam: 1,
    pendentes: 0,
    responderam: resumo.responderam,
    converteram: resumo.converteram,
    faturamento: resumo.faturamento,
    custo: resumo.custo,
    comparacao: resumo.sugerida
      ? { clientes: servico ? 2 : 6, converteram: 0, taxaRecebeu: Math.round((resumo.converteram / resumo.enviadas) * 1000) / 10, taxaNaoRecebeu: servico ? 0 : 4.2 }
      : null,
    clientes,
  };
}

/** A prévia de exemplo: o texto como o backend escreveria e uma lista de clientes. */
export function previaDemo(servico: boolean, r: RascunhoCampanha): PreviaCampanha {
  const nomes = servico ? NOMES_SERVICOS : NOMES_PRODUTOS;
  const quantos = r.publico === 'SUMIDOS' ? 6 : r.publico === 'ANO_PASSADO' ? 4 : r.publico === 'FREQUENTES' ? 9 : r.publico === 'NO_CICLO' ? 14 : 12;
  const dias = diasLivresDemo();
  const escolhido = dias.find((d) => d.data === r.dataReferencia) ?? dias[0];
  const detalhe = (r.detalhe ?? '').trim();
  let texto: string;
  switch (r.tipo) {
    case 'CONVITE':
      texto = servico
        ? r.semana
          ? `Olá, Camila! Temos horários livres para esta semana. ${detalhe || 'Os dias com horários livres são amanhã, ' + dias[1].rotulo.toLowerCase() + ' e ' + dias[2].rotulo.toLowerCase() + '.'} Quer garantir o seu? É só responder esta mensagem.`
          : `Olá, Camila! Abriram horários para ${escolhido.rotulo.charAt(0).toLowerCase() + escolhido.rotulo.slice(1)}: ${escolhido.horarios}. Quer garantir o seu? É só responder esta mensagem.`
        : `Olá, Ana! Estamos com encomendas abertas ${r.destaque ?? 'para este fim de semana'}. ${detalhe || 'Conte para a gente o que você precisa.'} Quer fazer a sua? É só responder esta mensagem.`;
      break;
    case 'PROMOCAO':
      texto = `Olá, ${servico ? 'Camila' : 'Ana'}! Temos uma condição especial para você: ${r.destaque}. ${detalhe || 'Válido por tempo limitado.'} Quer aproveitar? É só responder esta mensagem${servico ? ' para agendar' : ''}.`;
      break;
    case 'NOVIDADE':
      texto = `Olá, ${servico ? 'Camila' : 'Ana'}! Temos novidade por aqui: ${r.destaque}. ${detalhe || 'Preparamos com muito carinho para você.'} Quer saber mais ou já ${servico ? 'agendar' : 'fazer o seu pedido'}? É só responder esta mensagem.`;
      break;
    case 'DATA_ESPECIAL': {
      const data = situacaoDemo(servico).datas.find((d) => d.id === r.dataEspecialId);
      const nome = data?.comArtigo ?? r.destaque ?? 'a data';
      texto = servico
        ? `Olá, Camila! Estamos nos preparando para ${nome} e a nossa agenda já está aberta. ${detalhe || data?.detalhe || ''} Quer garantir o seu horário? É só responder esta mensagem.`
        : `Olá, Ana! Estamos nos preparando para ${nome} e já estamos aceitando encomendas. ${detalhe || data?.detalhe || ''} Quer garantir a sua? É só responder esta mensagem.`;
      break;
    }
    case 'RECUPERAR':
      texto = `Olá, Juliana! Faz um tempinho que você não vem aqui e sentimos a sua falta. ${detalhe || 'Temos horários disponíveis nesta semana.'} Quer marcar um horário? É só responder esta mensagem.`;
      break;
    default:
      texto = 'Olá, Marta! No ano passado, nesta época, você fez uma encomenda de Bolo Festivo com a gente. Se for uma data especial de novo, já quer garantir a deste ano? É só responder esta mensagem.';
  }
  const clientes = Array.from({ length: quantos }, (_, i) => ({
    id: `demo-${i}`,
    nome: nomes[i % nomes.length],
    numero: `(83) 99000-00${String(i + 10)}`,
    detalhe: servico
      ? r.publico === 'NO_CICLO'
        ? `Costuma voltar a cada ${[21, 21, 28, 30, 21][i % 5]} dias · última vez há ${26 + i * 2} dias`
        : `Última vez há ${30 + i * 6} dias · ${['Esmaltação em gel', 'Manutenção', 'Pé e mão'][i % 3]}`
      : r.publico === 'ANO_PASSADO'
        ? `Encomendou no ano passado · ${['Bolo Festivo', 'Docinhos', 'Torta de limão'][i % 3]}`
        : `Último pedido há ${12 + i * 9} dias${i % 3 === 0 ? ' · 3 pedidos' : ''}`,
    semCusto: i < 3,
  }));
  const pagos = quantos - 3;
  return {
    titulo: 'Exemplo',
    texto: texto.replace(/ {2,}/g, ' '),
    botao: servico ? 'Quero agendar' : 'Tenho interesse',
    versoes: servico && (r.tipo === 'CONVITE' || r.tipo === 'RECUPERAR') ? 2 : 1,
    clientes,
    sairam: 1,
    recentes: 2,
    comHorario: servico ? 1 : 0,
    gratis: 3,
    pagos,
    custoEstimado: pagos * 0.35,
    grupoComparacao: !!r.oportunidadeChave && quantos >= 10,
    avisos: [],
  };
}
