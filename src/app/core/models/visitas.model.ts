/** Visitas à galeria pública (/loja/{slug}). Os períodos incluem hoje. */
export interface VisitasGaleria {
  hoje: number;
  ultimos7Dias: number;
  ultimos30Dias: number;
}
