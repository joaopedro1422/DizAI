/**
 * Ícones de traço (viewBox 24x24). Cada ícone é uma lista de caminhos SVG,
 * desenhados com `stroke="currentColor"`, então herdam a cor do texto.
 */
const CIRCULO = 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0';

export const ICONES = {
  voltar: ['M15 6l-6 6 6 6'],
  avancar: ['M9 6l6 6-6 6'],
  reproduzir: ['M8 5v14l11-7z'],
  pausar: ['M9 5v14', 'M15 5v14'],
  arrastar: ['M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01'],
  seta: ['M5 12h14M13 6l6 6-6 6'],
  setaDiagonal: ['M7 17L17 7M9 7h8v8'],
  externo: ['M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  mais: ['M12 5v14M5 12h14'],
  fechar: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12l5 5L20 7'],
  editar: ['M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z', 'M14 8l3 3'],
  lixeira: ['M4 7h16', 'M10 11v6M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  maisOpcoes: ['M12 5.5h.01M12 12h.01M12 18.5h.01'],
  caixa: ['M3 8l9-5 9 5-9 5-9-5z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
  pergunta: [CIRCULO, 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4', 'M12 17h.01'],
  conversa: ['M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z'],
  imagem: [
    'M5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4z',
    'M7.2 10a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0',
    'M21 16l-5-5-9 9',
  ],
  pastaMais: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M12 10v6M9 13h6'],
  camera: ['M4 8h3l2-3h6l2 3h3v11H4z', 'M8.5 13a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0'],
  link: [
    'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1',
    'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  ],
  informacao: [CIRCULO, 'M12 11v5', 'M12 7.5h.01'],
  alerta: [CIRCULO, 'M12 8v5', 'M12 16.5h.01'],
  lampada: [
    'M9 18h6M10 21h4',
    'M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z',
  ],
  relogio: [CIRCULO, 'M12 7v5l3 2'],
  listaRepetida: ['M4 7h11M4 12h16M4 17h9'],
  dispersao: [
    'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1',
  ],
  raio: ['M13 3L5 13h6l-1 8 8-10h-6l1-8z'],
  escudo: ['M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7l8-4z', 'M9 12l2 2 4-4'],
  prancheta: [
    'M7 4h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M9 4V3h6v1M9 10h6M9 14h6M9 18h3',
  ],
  pessoa: ['M8 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6'],
  ajustes: [
    'M4 6h10M4 12h16M4 18h7',
    'M15 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
    'M12 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  ],
  checkDuplo: ['M2 12.5l4 4 8-8.5', 'M10 15l1.5 1.5L20 8'],
  microfone: ['M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z', 'M5 11a7 7 0 0 0 14 0', 'M12 18v3'],
  email: ['M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M3.5 7l8.5 6 8.5-6'],
  celular: ['M8 3h8a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 8 3z', 'M11 18h2'],
  pessoaIgnorada: ['M6.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0', 'M3 20c1-3.6 3.6-5.5 7-5.5', 'M15 15l5 5M20 15l-5 5'],
  busca: ['M4.5 10.5a6 6 0 1 0 12 0a6 6 0 1 0-12 0', 'M15 15l5 5'],
  olho: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z', 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
  sair: ['M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3', 'M16 16l4-4-4-4', 'M20 12H9'],
  emoji: [CIRCULO, 'M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8', 'M9 9.5h.01M15 9.5h.01'],
  grafico: ['M4 20h16', 'M7 16v-4', 'M12 16V8', 'M17 16v-7'],
  sino: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  documento: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h5'],
  setaBaixo: ['M6 9l6 6 6-6'],
  brilho: [
    'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
    'M19 3v4', 'M21 5h-4', 'M5 17v3', 'M6.5 18.5h-3',
  ],
  calendario: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'],
  calendarioFolga: [
    'M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M10 14l4 4', 'M14 14l-4 4',
  ],
} as const satisfies Record<string, readonly string[]>;

export type NomeIcone = keyof typeof ICONES;
