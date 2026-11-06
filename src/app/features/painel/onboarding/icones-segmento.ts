import { SegmentoNegocio } from '../../../core/constants/segmentos';
import { ICONES } from '../../../shared/components/icone/icones';

/**
 * Ícones de traço (viewBox 24x24, mesmo desenho do `app-icone`) de cada tipo de negócio, no lugar dos emojis da
 * escolha do segmento. Ficam aqui porque só servem a essa tela.
 */
const circulo = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const ICONES_SEGMENTO: Record<SegmentoNegocio, readonly string[]> = {
  DOCES: [circulo(12, 12, 3.5), 'M8.5 12L4 8.5v7z', 'M15.5 12L20 8.5v7z'],
  BOLOS_TORTAS: [
    'M4 20h16',
    'M5 20v-7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7',
    'M5 15.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0',
    'M12 12V9',
    'M12 6.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5z',
  ],
  SALGADOS: ['M12 3.5c-3 3.5-6 7.5-6 10.5a6 6 0 0 0 12 0c0-3-3-7-6-10.5z', 'M10 14h.01M14 15h.01M12 17.5h.01'],
  LANCHES: ['M4 11c0-3.9 3.6-7 8-7s8 3.1 8 7z', 'M3 14.5h18', 'M4.5 18.5h15a1.5 1.5 0 0 0 1.5-1.5H3a1.5 1.5 0 0 0 1.5 1.5z'],
  CESTAS_PRESENTES: [
    'M4 9h16v3H4z',
    'M5.5 12v8h13v-8',
    'M12 9v11',
    'M12 9c-1.5-3-5-3.5-5-1.3C7 9 9.5 9 12 9z',
    'M12 9c1.5-3 5-3.5 5-1.3C17 9 14.5 9 12 9z',
  ],
  FLORICULTURA: [
    'M12 13c-3 0-5-2.5-5-6l2.5 1.5L12 5l2.5 3.5L17 7c0 3.5-2 6-5 6z',
    'M12 13v8',
    'M12 18c-1.8-2.2-4-2.5-5.5-2 .8 2 3 2.8 5.5 2z',
  ],
  PAPELARIA_PERSONALIZADA: [
    'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
    'M12 11s-2.5-1.5-2.5-3a1.25 1.25 0 0 1 2.5-.6 1.25 1.25 0 0 1 2.5.6c0 1.5-2.5 3-2.5 3z',
    'M9 14.5h6M10 17.5h4',
  ],
  CAMISETAS_ESTAMPAS: [
    'M8.5 4L4 6.5l1.5 4 2-.8V20h9V9.7l2 .8 1.5-4L15.5 4c-.5 1.3-1.8 2-3.5 2s-3-.7-3.5-2z',
    circulo(12, 13.5, 1.8),
  ],
  ROUPAS_ACESSORIOS: [
    'M10.2 5.7a1.8 1.8 0 1 1 2.6 1.6c-.5.3-.8.8-.8 1.3v.9',
    'M12 9.5l-8.2 6.2a.8.8 0 0 0 .5 1.5h15.4a.8.8 0 0 0 .5-1.5z',
  ],
  COSMETICOS_PERFUMARIA: [circulo(12, 15, 5), 'M10.5 10.2V7.5h3v2.7', 'M10 5.5h4', 'M16.5 5.5h2M16.5 3.5l1.5-.8'],
  CASA_DECORACAO: ['M8 4h8l3 7H5z', 'M12 11v8', 'M8.5 20h7'],
  VARIEDADES: ['M4 4h7v7H4z', 'M13 13h7v7h-7z', circulo(16.5, 7.5, 3.5), 'M7.5 13l3.5 7H4z'],
  BARBEARIA: [
    'M12 12c-1.5-2.5-4.5-3-6.5-1.5-1 .8-1.5 2-2.5 2.5 2 1.5 5.5 1.5 9-1 3.5 2.5 7 2.5 9 1-1-.5-1.5-1.7-2.5-2.5-2-1.5-5-1-6.5 1.5z',
  ],
  SALAO_BELEZA: [circulo(6.5, 17, 2.5), circulo(17.5, 17, 2.5), 'M8.5 15.5L18 4', 'M15.5 15.5L6 4'],
  MANICURE: [
    'M8 11h8a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7a1 1 0 0 1 1-1z',
    'M10 11V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V11',
  ],
  ESTETICA: ICONES.brilho,
  DECORACAO_EVENTOS: [
    'M9 3.5c-2.5 0-4 2.2-4 4.5 0 2.7 2 5 4 5s4-2.3 4-5c0-2.3-1.5-4.5-4-4.5z',
    'M16 6.5c-2.2 0-3.5 1.9-3.5 3.9 0 2.4 1.7 4.4 3.5 4.4s3.5-2 3.5-4.4c0-2-1.3-3.9-3.5-3.9z',
    'M9 13c0 2.5-1.5 4-1 7',
    'M16 14.8c0 2-1 3.2-.5 5.2',
  ],
  FOTOGRAFIA: ICONES.camera,
  REFORMAS_REPAROS: [
    'M5 4h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
    'M18 6.5h2V12h-8v3',
    'M11 15h2v6h-2z',
  ],
  AULAS_CONSULTORIA: ['M3 4h18', 'M4 4v11h16V4', 'M12 15v3', 'M8.5 21l3.5-3 3.5 3', 'M8 11l3-3 2 2 3-3'],
  PET_SHOP: [
    circulo(6.5, 10.5, 1.6),
    circulo(9.8, 6.5, 1.6),
    circulo(14.2, 6.5, 1.6),
    circulo(17.5, 10.5, 1.6),
    'M12 12c-2.5 0-5 3-5 5.2 0 1.5 1.2 2.3 2.6 2.1.9-.1 1.6-.4 2.4-.4s1.5.3 2.4.4c1.4.2 2.6-.6 2.6-2.1C17 15 14.5 12 12 12z',
  ],
  SAUDE_BEM_ESTAR: [
    'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    'M7.5 12h2.5l1-2 2 4 1-2h2.5',
  ],
  AULAS_CURSOS: ['M2.5 9L12 4.5 21.5 9 12 13.5z', 'M6.5 11v4.5c1.5 1.5 3.5 2 5.5 2s4-.5 5.5-2V11', 'M21.5 9v5'],
  ACADEMIA_ESTUDIO: ['M6.5 7v10M17.5 7v10', 'M3.5 9.5v5M20.5 9.5v5', 'M6.5 12h11'],
};

/** "Meu negócio é de outro tipo": a grade com o "+". */
export const ICONE_OUTRO_TIPO: readonly string[] = ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M17 14v6M14 17h6'];
