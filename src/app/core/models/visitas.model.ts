/** Visitas à galeria pública (/l/{slug}). Os períodos incluem hoje. */
export interface VisitasGaleria {
  hoje: number;
  ultimos7Dias: number;
  ultimos30Dias: number;
}
