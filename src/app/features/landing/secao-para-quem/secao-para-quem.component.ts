import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

type IdRamo = 'servicos' | 'doces' | 'personalizados' | 'produtos';

interface ExemploRamo {
  id: IdRamo;
  rotulo: string;
  quem: string[];
  /** O que o DizAI faz nesse ramo (o "responde por você" entra antes em todos). */
  faz: string[];
  cliente: string;
  resposta: string;
}

/** Os mesmos ramos do cadastro, cada um com uma conversa típica. */
const RAMOS: ExemploRamo[] = [
  {
    id: 'servicos',
    rotulo: 'Serviços',
    quem: ['Manicure', 'Cabeleireira', 'Esteticista', 'Barbearia', 'Pet shop', 'Eletricista'],
    faz: [
      'Agenda automática: oferece só os horários livres em que o serviço cabe e marca sozinho.',
      'Agenda online na sua página para o cliente escolher o horário e mandar pelo WhatsApp.',
      'Mensagens prontas de lembrete e endereço, com um toque no número do cliente.',
    ],
    cliente: 'Tem horário amanhã à tarde pra mão e pé?',
    resposta: 'Tenho sim! Amanhã à tarde ainda tenho:\n- 14:00\n- 15:30\n- 16:00\nQual fica melhor pra você?',
  },
  {
    id: 'doces',
    rotulo: 'Doces e salgados',
    quem: ['Tortas', 'Confeitaria', 'Bolos', 'Doces finos', 'Salgados'],
    faz: [
      'Monta o orçamento com os seus preços, item por item, com o total.',
      'Confere pedido mínimo, antecedência e os dias em que você entrega.',
      'Anota sabores, data e retirada e te entrega o resumo pronto para fechar.',
    ],
    cliente: 'Quais os sabores disponíveis para a torta G?',
    resposta:
      'Para a torta G temos estes sabores 🎂:\n- Morango com chantilly\n- Ninho com Nutella\n- Ameixa\n- Prestígio\nEla serve cerca de 30 pessoas.',
  },
  {
    id: 'personalizados',
    rotulo: 'Personalizados',
    quem: ['Cortinas', 'Móveis planejados', 'Presentes', 'Estampas', 'Cestas'],
    faz: [
      'Explica modelos, materiais e o que muda o valor, sem inventar preço.',
      'Mostra fotos dos seus trabalhos pela galeria, no momento certo.',
      'Coleta medidas, endereço e o melhor horário para a visita e te passa a conversa.',
    ],
    cliente: 'Vocês fazem cortina blackout pra quarto?',
    resposta: 'Fazemos sim! Trabalhamos com blackout nas cores branco, cinza e bege. Quer marcar uma visita para medir?',
  },
  {
    id: 'produtos',
    rotulo: 'Produtos em geral',
    quem: ['Roupas', 'Tênis', 'Acessórios', 'Perfumes'],
    faz: [
      'Responde tamanhos, cores e o que está disponível agora.',
      'Envia o seu catálogo em PDF ou imagem na conversa.',
      'Passa para você quem já está pronto para comprar.',
    ],
    cliente: 'Tem esse tênis no 38?',
    resposta: 'Temos sim, no 38 nas cores preto e branco. Te mando nosso catálogo aqui embaixo.',
  },
];

const BASICO = 'Responde por você sobre o seu negócio.';

/** "Para quem é": abas por ramo, cada uma com quem usa, o que o assistente faz e uma conversa de exemplo. */
@Component({
  selector: 'app-secao-para-quem',
  imports: [RouterLink, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-para-quem.component.html',
  styleUrls: ['../secao-landing.css', './secao-para-quem.component.css'],
})
export class SecaoParaQuemComponent {
  protected readonly ramos = RAMOS;
  protected readonly ramoAtual = signal<IdRamo>('servicos');
  protected readonly atual = computed(() => {
    const ramo = RAMOS.find((r) => r.id === this.ramoAtual()) ?? RAMOS[0];
    return { ...ramo, faz: [BASICO, ...ramo.faz] };
  });

  protected escolher(id: IdRamo): void {
    this.ramoAtual.set(id);
  }
}
