import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';

/** A miniatura no pé do card (o pedacinho da tela de verdade que prova o ganho). */
type DetalheGanho =
  | 'resposta'
  | 'conversa'
  | 'catalogo'
  | 'audio'
  | 'jeito'
  | 'assumir'
  | 'relatorios'
  | 'aviso'
  | 'verdade';

interface Ganho {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  detalhe: DetalheGanho;
  /** Ocupa duas colunas no computador. */
  largo?: boolean;
}

/** O que é do DizAI para qualquer negócio (o que é só de produtos ou de serviços fica na seção Recursos). */
const GANHOS: Ganho[] = [
  {
    icone: 'raio',
    titulo: 'Resposta em segundos, 24 horas',
    texto: 'De madrugada, no domingo ou com as mãos ocupadas. Você liga e desliga quando quiser.',
    detalhe: 'resposta',
  },
  {
    icone: 'conversa',
    titulo: 'Responde tudo sobre o seu negócio',
    texto: 'Preços, opções, prazos, formas de pagamento, endereço e restrições, do jeito que você cadastrou.',
    detalhe: 'conversa',
  },
  {
    icone: 'documento',
    titulo: 'Catálogo em imagem ou PDF',
    texto: 'Envia o cardápio ou a tabela de preços na saudação ou quando o cliente pedir.',
    detalhe: 'catalogo',
  },
  {
    icone: 'microfone',
    titulo: 'Entende os áudios dos clientes',
    texto: 'O cliente prefere falar? O assistente entende a mensagem de voz e responde por escrito, sem você precisar ouvir.',
    detalhe: 'audio',
  },
  {
    icone: 'grafico',
    titulo: 'Relatório financeiro e insights do negócio',
    texto: 'Quanto você faturou, o ticket médio, os dias que mais vendem e os clientes que mais voltam.',
    detalhe: 'relatorios',
    largo: true,
  },
  {
    icone: 'ajustes',
    titulo: 'Totalmente do seu jeito',
    texto: 'Saudação, regras da loja e jeito de falar definidos por você.',
    detalhe: 'jeito',
  },
  {
    icone: 'pessoa',
    titulo: 'Você assume a qualquer momento',
    texto: 'Respondeu pelo celular? O assistente sai daquela conversa.',
    detalhe: 'assumir',
  },
  {
    icone: 'sino',
    titulo: 'Aviso no celular',
    texto: 'Cliente pronto para fechar ou com uma dúvida? Você fica sabendo na hora.',
    detalhe: 'aviso',
  },
  {
    icone: 'escudo',
    titulo: 'Só fala o que é verdade',
    texto: 'Não inventa preço nem prazo. Se não souber responder, te chama na mesma hora.',
    detalhe: 'verdade',
  },
];

/** Barras da miniatura do relatório (altura em %). */
const BARRAS = [36, 52, 44, 70, 58, 100, 30];

/** Ondas da nota de voz na miniatura do áudio (altura em %). */
const ONDAS = [30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 65, 30, 50, 75, 40, 25];

/** O que a vitrine pública reúne (no computador, ao lado do texto do último card). */
const RECURSOS_VITRINE: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: 'imagem', titulo: 'Portfólio', texto: 'Suas fotos separadas por tema' },
  { icone: 'estrela', titulo: 'Feedbacks', texto: 'O que os clientes dizem, com estrelas' },
  { icone: 'local', titulo: 'Como chegar', texto: 'Endereço com mapa e rota' },
  { icone: 'calendario', titulo: 'Agendamento', texto: 'Para serviços, a sua agenda online' },
];

/**
 * "A solução": o que o DizAI faz por qualquer negócio. O cartão azul abre com o tempo de volta; os outros, um
 * ganho cada, com uma miniatura da tela no pé.
 */
@Component({
  selector: 'app-secao-solucao',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-solucao.component.html',
  styleUrls: ['../secao-landing.css', './secao-solucao.component.css', './ganho-vitrine.css'],
})
export class SecaoSolucaoComponent {
  protected readonly ganhos = GANHOS;
  protected readonly barras = BARRAS;
  protected readonly ondas = ONDAS;
  protected readonly recursosVitrine = RECURSOS_VITRINE;

  /** "Ver": desce até a seção da vitrine pública, logo abaixo na landing. */
  protected verVitrine(): void {
    const galeria = document.getElementById('galeria');
    if (!galeria) {
      return;
    }
    galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // as seções do meio carregam imagens enquanto a página rola e empurram a vitrine para baixo: no fim, acerta
    const acertar = () => {
      if (Math.abs(galeria.getBoundingClientRect().top) > 4) {
        galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', acertar, { once: true });
    } else {
      setTimeout(acertar, 1200);   // Safari sem o evento scrollend
    }
  }
}
