import { TipoPost } from './tipos-post';

/** Uma opção de texto (o backend devolve neste formato: TextosPostDTO.Opcao). */
export interface TextoPost {
  titulo: string;
  apoio: string;
  chamada: string;
  legenda: string;
}

/** O selo pequeno da arte, por tipo (varia entre as opções). */
export const SELOS: Record<TipoPost, string[]> = {
  DESTAQUE: ['Destaque', 'Queridinho', 'Para você', 'Vale conhecer'],
  AGENDA: ['Agenda aberta', 'Horários livres', 'Ainda dá tempo', 'Agenda da semana'],
  DEPOIMENTO: ['Depoimento', 'Cliente feliz', 'Quem já veio', 'Amamos ouvir'],
  NOVIDADE: ['Novidade', 'Saiu do forno', 'Recém-feito', 'Novo por aqui'],
  PROMOCAO: ['Promoção', 'Oferta especial', 'Só esta semana', 'Aproveite'],
  CARDAPIO: ['Nossos preços', 'Cardápio', 'Escolha o seu', 'Tabela'],
  CONVITE: ['Vem pra cá', 'Te esperamos', 'Fale com a gente', 'Bora?'],
};

export const TIPOS_POST: { tipo: TipoPost; nome: string; descricao: string; icone: string }[] = [
  { tipo: 'DESTAQUE', nome: 'Destaque', descricao: 'Um serviço ou produto com foto e preço', icone: 'estrela' },
  { tipo: 'AGENDA', nome: 'Agenda aberta', descricao: 'Os próximos horários livres', icone: 'calendario' },
  { tipo: 'NOVIDADE', nome: 'Novidade', descricao: 'Uma foto nova da sua vitrine', icone: 'imagem' },
  { tipo: 'DEPOIMENTO', nome: 'Depoimento', descricao: 'O feedback de um cliente', icone: 'conversa' },
  { tipo: 'PROMOCAO', nome: 'Promoção', descricao: 'Uma oferta escrita por você', icone: 'brilho' },
  { tipo: 'CARDAPIO', nome: 'Tabela de preços', descricao: 'Vários itens com o preço de cada um', icone: 'documento' },
  { tipo: 'CONVITE', nome: 'Convite', descricao: 'Chamar para o WhatsApp e a vitrine', icone: 'seta' },
];

/** Textos prontos para quando a IA não responde: o gerador continua funcionando. */
export function textosReserva(tipo: TipoPost, assunto: string, loja: string): TextoPost[] {
  const item = assunto || loja;
  const hashtags = '#' + loja.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const legenda = (frase: string) => `${frase}\n\nChama a gente no WhatsApp, o link está na bio.\n\n${hashtags}`;
  const porTipo: Record<TipoPost, TextoPost[]> = {
    DESTAQUE: [
      { titulo: item, apoio: 'Feito com cuidado do começo ao fim', chamada: 'Fale com a gente', legenda: legenda(`${item}: do jeito que você gosta.`) },
      { titulo: 'O favorito da casa', apoio: item, chamada: 'Peça o seu', legenda: legenda(`Quem prova volta. ${item}.`) },
      { titulo: 'Feito para você', apoio: item, chamada: 'Garanta o seu', legenda: legenda(`${item} esperando por você.`) },
      { titulo: 'Vale cada detalhe', apoio: item, chamada: 'Chame no WhatsApp', legenda: legenda(`Detalhe por detalhe: ${item}.`) },
    ],
    AGENDA: [
      { titulo: 'Ainda tem horário', apoio: item, chamada: 'Agende já', legenda: legenda('Abrimos novos horários. Garanta o seu antes que acabe.') },
      { titulo: 'Agenda aberta', apoio: item, chamada: 'Garanta o seu', legenda: legenda('Os horários desta semana estão abertos.') },
      { titulo: 'Bora se cuidar?', apoio: item, chamada: 'Marque agora', legenda: legenda('Tem horário esperando por você.') },
      { titulo: 'Seu horário está aqui', apoio: item, chamada: 'Agende pelo WhatsApp', legenda: legenda('É só escolher o melhor horário.') },
    ],
    DEPOIMENTO: [
      { titulo: 'Quem vem, volta', apoio: '', chamada: 'Venha também', legenda: legenda('Obrigado pelo carinho! Ver vocês felizes é o melhor do nosso trabalho.') },
      { titulo: 'Palavra de cliente', apoio: '', chamada: 'Agende o seu', legenda: legenda('Cada feedback assim enche o coração.') },
      { titulo: 'É por isso que fazemos', apoio: '', chamada: 'Fale com a gente', legenda: legenda('Obrigado pela confiança!') },
      { titulo: 'Recado que emociona', apoio: '', chamada: 'Venha conhecer', legenda: legenda('Feedback de quem já passou por aqui.') },
    ],
    NOVIDADE: [
      { titulo: 'Acabou de sair', apoio: item, chamada: 'Veja mais', legenda: legenda('Trabalho novo na vitrine. Qual é o seu favorito?') },
      { titulo: 'Novidade na vitrine', apoio: item, chamada: 'Fale com a gente', legenda: legenda('Mais um para a coleção.') },
      { titulo: 'Olha isso', apoio: item, chamada: 'Quero o meu', legenda: legenda('Feito com carinho, do jeitinho que a gente ama.') },
      { titulo: 'Recém-feito', apoio: item, chamada: 'Peça o seu', legenda: legenda('Novidade fresquinha por aqui.') },
    ],
    PROMOCAO: [
      { titulo: item, apoio: 'Por tempo limitado', chamada: 'Aproveite', legenda: legenda(`${item}. Corre que é por pouco tempo.`) },
      { titulo: 'Oferta especial', apoio: item, chamada: 'Quero aproveitar', legenda: legenda(item) },
      { titulo: 'Não deixe passar', apoio: item, chamada: 'Garanta já', legenda: legenda(item) },
      { titulo: 'Preparamos para você', apoio: item, chamada: 'Chame no WhatsApp', legenda: legenda(item) },
    ],
    CARDAPIO: [
      { titulo: 'Escolha o seu', apoio: '', chamada: 'Peça pelo WhatsApp', legenda: legenda('Nossos preços em um só lugar.') },
      { titulo: 'Nossos queridinhos', apoio: '', chamada: 'Fale com a gente', legenda: legenda('Qual vai ser hoje?') },
      { titulo: 'Tabela de preços', apoio: '', chamada: 'Agende o seu', legenda: legenda('Salve para consultar depois.') },
      { titulo: 'Tem para todo gosto', apoio: '', chamada: 'Peça o seu', legenda: legenda('Escolha o seu favorito.') },
    ],
    CONVITE: [
      { titulo: 'Vem pra cá', apoio: loja, chamada: 'Fale com a gente', legenda: legenda('Estamos esperando você.') },
      { titulo: 'A gente te espera', apoio: loja, chamada: 'Chame no WhatsApp', legenda: legenda('Atendimento rápido pelo WhatsApp.') },
      { titulo: 'Bora conversar?', apoio: loja, chamada: 'Mande uma mensagem', legenda: legenda('Tire suas dúvidas com a gente.') },
      { titulo: 'Seu próximo favorito', apoio: loja, chamada: 'Conheça', legenda: legenda('Conheça o nosso trabalho.') },
    ],
  };
  return porTipo[tipo];
}
