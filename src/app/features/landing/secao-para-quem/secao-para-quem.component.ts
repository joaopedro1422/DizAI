import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

interface ExemploRamo {
  rotulo: string;
  quem: string[];
  /** O que o DizAI faz nesse ramo, além de responder sobre o negócio. */
  faz: string[];
  /** A conversa que mostra esse ramo na página /demonstracao. */
  demonstracao: { tipo: TipoNegocio; segmento: string };
}

/** Os mesmos ramos do cadastro. */
const RAMOS: ExemploRamo[] = [
  {
    rotulo: 'Serviços',
    quem: ['Manicure', 'Barbearia', 'Estética', 'Cabeleireira', 'Pet shop'],
    faz: [
      'Agenda automática, só com os horários livres em que o serviço cabe.',
      'Lembrete antes do horário e confirmação de presença.',
      'Agenda online na sua página para o cliente escolher o horário.',
    ],
    demonstracao: { tipo: 'servicos', segmento: 'manicure' },
  },
  {
    rotulo: 'Doces e salgados',
    quem: ['Confeitaria', 'Bolos', 'Doces finos', 'Salgados', 'Tortas'],
    faz: [
      'Orçamento com os seus preços, item por item, com o total.',
      'Confere pedido mínimo, antecedência e os dias de entrega.',
      'Anota sabores, data e entrega e te entrega o resumo.',
    ],
    demonstracao: { tipo: 'produtos', segmento: 'doces' },
  },
  {
    rotulo: 'Personalizados',
    quem: ['Cortinas', 'Móveis planejados', 'Presentes', 'Estampas', 'Cestas'],
    faz: [
      'Explica modelos, materiais e o que muda o valor, sem inventar preço.',
      'Mostra as fotos dos seus trabalhos no momento certo.',
      'Coleta medidas, endereço e o melhor horário para a visita.',
    ],
    demonstracao: { tipo: 'produtos', segmento: 'presentes' },
  },
  {
    rotulo: 'Produtos em geral',
    quem: ['Roupas', 'Tênis', 'Acessórios', 'Perfumes'],
    faz: [
      'Responde tamanhos, cores e o que está disponível.',
      'Envia o seu catálogo em PDF ou imagem na conversa.',
      'Segue as suas regras de troca e envio.',
    ],
    demonstracao: { tipo: 'produtos', segmento: 'presentes' },
  },
];

/** "Para quem é": um cartão por ramo; "Ver uma conversa" abre a demonstração daquele ramo. */
@Component({
  selector: 'app-secao-para-quem',
  imports: [RouterLink, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-para-quem.component.html',
  styleUrls: ['../secao-landing.css', './secao-para-quem.component.css'],
})
export class SecaoParaQuemComponent {
  protected readonly ramos = RAMOS;
}
