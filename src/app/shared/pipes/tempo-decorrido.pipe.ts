import { Pipe, PipeTransform } from '@angular/core';

/** "agora", "5 min", "2 h", "3 dias" desde a data informada. */
@Pipe({ name: 'tempoDecorrido' })
export class TempoDecorridoPipe implements PipeTransform {
  transform(data: Date): string {
    const minutos = Math.floor((Date.now() - data.getTime()) / 60_000);
    if (minutos < 1) {
      return 'agora';
    }
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return `${horas} h`;
    }
    const dias = Math.floor(horas / 24);
    return dias === 1 ? '1 dia' : `${dias} dias`;
  }
}
