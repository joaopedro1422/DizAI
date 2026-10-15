import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';

interface EtapaAtendimento {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  /** A etapa do lojista aparece em destaque. */
  ehDoLojista: boolean;
}

/** Faixa logo abaixo do hero: o DizAI não muda o modelo de negócio, a venda continua com o lojista. */
@Component({
  selector: 'app-secao-proposta',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-proposta.component.html',
  styleUrl: './secao-proposta.component.css',
})
export class SecaoPropostaComponent {
  protected readonly etapas: EtapaAtendimento[] = [
    {
      icone: 'conversa',
      titulo: 'O cliente pergunta',
      texto: 'Serviços, sabores, cores, prazo, horário, entrega: as mesmas dúvidas de sempre.',
      ehDoLojista: false,
    },
    {
      icone: 'raio',
      titulo: 'O DizAI responde',
      texto: 'Na hora, com as informações da sua loja, enquanto você trabalha ou descansa no final de semana.',
      ehDoLojista: false,
    },
    {
      icone: 'pessoa',
      titulo: 'Você fecha',
      texto: 'A venda ou o agendamento é confirmado por você, do seu jeito.',
      ehDoLojista: true,
    },
  ];
}
