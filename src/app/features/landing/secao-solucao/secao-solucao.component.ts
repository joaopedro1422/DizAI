import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';

type CorGanho = 'azul' | 'verde' | 'ambar' | 'rosa';

interface Ganho {
  icone: NomeIcone;
  cor: CorGanho;
  titulo: string;
  texto: string;
  /** Ganho que vale só para um ramo. */
  para?: 'Serviços' | 'Produtos';
}

const GANHOS: Ganho[] = [
  {
    icone: 'raio',
    cor: 'azul',
    titulo: 'Resposta em segundos, 24 horas',
    texto: 'De madrugada, no domingo ou com as mãos ocupadas. Você ativa e desativa o assistente quando quiser.',
  },
  { icone: 'calendario', cor: 'verde', para: 'Serviços', titulo: 'Agendamento automático', texto: 'Marca, remarca, lembra o cliente e confirma a presença.' },
  { icone: 'prancheta', cor: 'ambar', para: 'Produtos', titulo: 'Pedidos anotados para você', texto: 'Coleta os dados que você escolhe e entrega o pedido pronto.' },
  {
    icone: 'conversa',
    cor: 'rosa',
    titulo: 'Responde tudo sobre o seu negócio',
    texto: 'Tira dúvidas, lista produtos e serviços, faz orçamentos e informa restrições.',
  },
  { icone: 'documento', cor: 'azul', titulo: 'Catálogo em imagem ou PDF', texto: 'Envia o cardápio ou a tabela de preços na hora certa.' },
  { icone: 'imagem', cor: 'rosa', titulo: 'Portfólio dos seus trabalhos', texto: 'Uma página com as suas fotos, que o assistente envia.' },
  { icone: 'ajustes', cor: 'verde', titulo: 'Totalmente do seu jeito', texto: 'Saudação, regras e jeito de falar definidos por você.' },
  { icone: 'pessoa', cor: 'ambar', titulo: 'Você assume a qualquer momento', texto: 'Respondeu pelo celular? O assistente sai daquela conversa.' },
];

/**
 * "A solução": os ganhos de usar o DizAI. O cartão grande mostra o tempo de volta com a tela de Estatísticas
 * do painel (números de exemplo); os outros, um ganho cada.
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
}
