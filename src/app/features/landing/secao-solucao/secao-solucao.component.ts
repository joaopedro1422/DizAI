import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';

/** A miniatura no pé do card (o pedacinho da tela de verdade que prova o ganho). */
type DetalheGanho =
  | 'resposta'
  | 'conversa'
  | 'catalogo'
  | 'portfolio'
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
    icone: 'imagem',
    titulo: 'Vitrine e portfólio com as suas fotos',
    texto: 'Uma página exclusiva da sua loja, com os seus trabalhos por tema, que o assistente envia na conversa.',
    detalhe: 'portfolio',
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

/**
 * "A solução": o que o DizAI faz por qualquer negócio. O cartão azul abre com o tempo de volta; os outros, um
 * ganho cada, com uma miniatura da tela no pé.
 */
@Component({
  selector: 'app-secao-solucao',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-solucao.component.html',
  styleUrls: ['../secao-landing.css', './secao-solucao.component.css'],
})
export class SecaoSolucaoComponent {
  protected readonly ganhos = GANHOS;
  protected readonly barras = BARRAS;
}
