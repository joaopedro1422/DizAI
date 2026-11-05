import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import type { NomeIcone } from '../../../shared/components/icone/icones';
import { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

interface ExemploRamo {
  rotulo: string;
  quem: string[];
  /** O que o DizAI faz nesse ramo, além de responder sobre o negócio. */
  faz: string[];
  /** A conversa que mostra esse ramo na página /demonstracao. */
  demonstracao: { tipo: TipoNegocio; segmento: string };
  /** Até 2 fotos no topo do cartão; sem foto, a capa no tom com o ícone. */
  fotos?: string[];
  icone?: NomeIcone;
}

/** Os mesmos ramos do cadastro (o hub, sem tipo, mostra um cartão por ramo). */
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

/** Landing de serviços: os públicos de quem atende com hora marcada, cada um com o que mais pesa no dia a dia. */
const RAMOS_SERVICOS: ExemploRamo[] = [
  {
    rotulo: 'Beleza',
    quem: ['Manicure', 'Salão de beleza', 'Barbearia', 'Sobrancelhas', 'Cílios'],
    faz: [
      'Marca vários serviços juntos, somando a duração de cada um.',
      'Uma agenda para a equipe toda, com "qualquer um" ou com quem o cliente preferir.',
      'Lembrete de retorno para a manutenção do gel, da progressiva, do corte.',
    ],
    demonstracao: { tipo: 'servicos', segmento: 'manicure' },
    fotos: ['/landing/galeria/unhas/01.webp', '/landing/hub/barbearia.webp'],
  },
  {
    rotulo: 'Estética e bem-estar',
    quem: ['Esteticista', 'Massoterapia', 'Depilação', 'Podologia', 'Fisioterapia'],
    faz: [
      'Explica cada procedimento e o preço, do jeito que você ensinou.',
      'Lembrete antes do horário e confirmação de presença.',
      'Lista de espera: vagou um horário, o próximo da fila é avisado.',
    ],
    demonstracao: { tipo: 'servicos', segmento: 'estetica' },
    fotos: ['/landing/hub/estetica.webp'],
  },
  {
    rotulo: 'Pets, aulas e treinos',
    quem: ['Banho e tosa', 'Aulas particulares', 'Personal trainer', 'Tatuagem'],
    faz: [
      'Agenda online na sua página para o cliente escolher o horário.',
      'Remarca e cancela pela conversa, sem você no meio.',
      'Agradece depois do atendimento e chama de volta no tempo certo.',
    ],
    demonstracao: { tipo: 'servicos', segmento: 'barbearia' },
    icone: 'calendario',
  },
];

/** Landing de produtos: quem vende por encomenda e quer manter o cliente por perto até fechar. */
const RAMOS_PRODUTOS: ExemploRamo[] = [
  {
    rotulo: 'Doces, bolos e salgados',
    quem: ['Confeitaria', 'Bolos e tortas', 'Doces finos', 'Salgados', 'Lanches'],
    faz: [
      'Orçamento com os seus preços, até por quantidade, com o total.',
      'Confere pedido mínimo, antecedência e os dias de entrega.',
      'Anota sabores, tamanho, data e entrega e te entrega o resumo.',
    ],
    demonstracao: { tipo: 'produtos', segmento: 'doces' },
    fotos: ['/landing/galeria/bolos/02.webp', '/landing/hub/salgados.webp'],
  },
  {
    rotulo: 'Personalizados e presentes',
    quem: ['Cestas', 'Floricultura', 'Papelaria', 'Estampas', 'Cortinas'],
    faz: [
      'Explica modelos, materiais e o que muda o valor, sem inventar preço.',
      'Mostra as fotos dos seus trabalhos e envia o catálogo.',
      'Coleta os detalhes do pedido e passa para você confirmar.',
    ],
    demonstracao: { tipo: 'produtos', segmento: 'presentes' },
    fotos: ['/landing/hub/flores.webp'],
  },
  {
    rotulo: 'Lojas e revenda',
    quem: ['Roupas', 'Cosméticos', 'Acessórios', 'Casa e decoração'],
    faz: [
      'Responde tamanhos, cores e o que está disponível.',
      'Envia o seu catálogo em PDF ou imagem na conversa.',
      'Segue as suas regras de troca e envio.',
    ],
    demonstracao: { tipo: 'produtos', segmento: 'salgados' },
    fotos: ['/landing/galeria/cortinas/01.webp'],
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
  readonly tipo = input<TipoNegocio | null>(null);
  protected readonly ramos = computed(() =>
    this.tipo() === 'servicos' ? RAMOS_SERVICOS : this.tipo() === 'produtos' ? RAMOS_PRODUTOS : RAMOS,
  );
  protected readonly descricao = computed(() =>
    this.tipo() === 'servicos'
      ? 'Não é formulário de agendamento: é conversa de verdade, do jeito que o seu cliente já pede o horário.'
      : 'Não é cardápio com carrinho: é conversa de verdade, do jeito que o seu cliente já pergunta.',
  );
  protected readonly titulo = computed(() =>
    this.tipo() === 'servicos'
      ? 'Para quem vive de hora marcada.'
      : this.tipo() === 'produtos'
        ? 'Para quem vende por encomenda e quer o cliente por perto.'
        : 'Para quem toca o negócio quase sozinho.',
  );
}
