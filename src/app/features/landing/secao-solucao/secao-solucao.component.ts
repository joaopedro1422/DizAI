import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { exemplosPostsDe } from '../secao-posts/exemplos-posts';
import { NomeIcone } from '../../../shared/components/icone/icones';
import type { TipoNegocio } from '../../demonstracao/conversas-demonstracao';

/** A miniatura no pé do card (o pedacinho da tela de verdade que prova o ganho). */
type DetalheGanho =
  | 'resposta'
  | 'conversa'
  | 'catalogo'
  | 'audio'
  | 'jeito'
  | 'assumir'
  | 'relatorios';

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
    texto: 'Preços, opções, formas de pagamento e tudo o que você cadastrar. Se não souber, te chama.',
    detalhe: 'conversa',
  },
  {
    icone: 'documento',
    titulo: 'Catálogo em imagem ou PDF',
    texto: 'Envia o cardápio ou a tabela de preços direto na conversa.',
    detalhe: 'catalogo',
  },
  {
    icone: 'microfone',
    titulo: 'Entende os áudios dos clientes',
    texto: 'O assistente entende mensagens de voz e responde por escrito.',
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
];

/** O que muda de um público para o outro (o hub, sem tipo, usa o geral). */
interface TextosSolucao {
  conversa: string;
  /** A resposta à nota de voz na miniatura do áudio. */
  respostaAudio: string;
  catalogo: string;
  vitrine: { icone: NomeIcone; titulo: string; texto: string };
}

const TEXTOS: Record<TipoNegocio | 'geral', TextosSolucao> = {
  geral: {
    conversa: 'Preços, opções, formas de pagamento e tudo o que você cadastrar. Se não souber, te chama.',
    respostaAudio: 'Temos sim! Amanhã às 14h ou às 16h30. Qual prefere?',
    catalogo: 'Cardápio de outubro.pdf',
    vitrine: { icone: 'calendario', titulo: 'Agendamento', texto: 'Para serviços, a sua agenda online' },
  },
  produtos: {
    conversa: 'Preços, sabores, tamanhos, prazos e tudo o que você cadastrar. Se não souber, te chama.',
    respostaAudio: 'Temos sim! O cento sai R$ 90,00. Para qual dia seria?',
    catalogo: 'Cardápio de outubro.pdf',
    vitrine: { icone: 'link', titulo: 'Link na bio', texto: 'Para o Instagram e o WhatsApp' },
  },
  servicos: {
    conversa: 'Preços, duração, endereço e tudo o que você cadastrar. Se não souber, te chama.',
    respostaAudio: 'Temos sim! Amanhã às 14h ou às 16h30. Qual prefere?',
    catalogo: 'Tabela de serviços.pdf',
    vitrine: { icone: 'calendario', titulo: 'Agendamento', texto: 'A sua agenda online, com os horários livres' },
  },
};

/** Barras da miniatura do relatório (altura em %). */
const BARRAS = [36, 52, 44, 70, 58, 100, 30];

/** Ondas da nota de voz na miniatura do áudio (altura em %). */
const ONDAS = [30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 65, 30, 50, 75, 40, 25];

/** O que a vitrine pública reúne (no computador, ao lado do texto do último card). */
const RECURSOS_VITRINE: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: 'imagem', titulo: 'Portfólio', texto: 'Suas fotos separadas por tema' },
  { icone: 'estrela', titulo: 'Feedbacks', texto: 'O que os clientes dizem, com estrelas' },
  { icone: 'local', titulo: 'Como chegar', texto: 'Endereço com mapa e rota' },
];

@Component({
  selector: 'app-secao-solucao',
  imports: [IconeComponent, ArtePostComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-solucao.component.html',
  styleUrls: ['../secao-landing.css', './secao-solucao.component.css', './ganho-vitrine.css', './ganho-posts.css'],
})
export class SecaoSolucaoComponent {
  /** Landing de um tipo: textos e miniaturas daquele público; sem tipo (hub), o geral. */
  readonly tipo = input<TipoNegocio | null>(null);
  protected readonly textos = computed(() => TEXTOS[this.tipo() ?? 'geral']);

  protected readonly ganhos = computed(() =>
    GANHOS.map((ganho) =>
      ganho.detalhe === 'conversa'
        ? { ...ganho, texto: this.textos().conversa }
        : ganho.detalhe === 'catalogo' && this.tipo() === 'servicos'
          ? { ...ganho, texto: 'Envia a tabela de preços ou o portfólio direto na conversa.' }
          : ganho,
    ),
  );
  protected readonly barras = BARRAS;
  protected readonly ondas = ONDAS;
  protected readonly recursosVitrine = computed(() => [...RECURSOS_VITRINE, this.textos().vitrine]);
  /** Três artes do gerador de posts, de negócios diferentes (as mesmas da seção "Redes sociais"). */
  protected readonly postsDeExemplo = computed(() => {
    const artes = exemplosPostsDe(this.tipo());
    return this.tipo() ? [artes[1], artes[2], artes[0]] : [artes[1], artes[0], artes[3]];
  });

  /** "Ver mais": desce até a seção da vitrine pública ou a de redes sociais, mais abaixo na landing. */
  protected verSecao(id: 'galeria' | 'posts'): void {
    const galeria = document.getElementById(id);
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
