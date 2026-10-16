import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../shared/components/icone/icone.component';
import { NomeIcone } from '../../shared/components/icone/icones';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { SecaoGaleriaComponent } from './secao-galeria/secao-galeria.component';
import { SecaoParaQuemComponent } from './secao-para-quem/secao-para-quem.component';
import { SecaoPerguntasComponent } from './secao-perguntas/secao-perguntas.component';
import { SecaoRecursosComponent } from './secao-recursos/secao-recursos.component';
import { SecaoHeroComponent } from './secao-hero/secao-hero.component';
import { SecaoPropostaComponent } from './secao-proposta/secao-proposta.component';
import { JornadaInterativaComponent } from './jornada-interativa/jornada-interativa.component';

interface ItemComIcone {
  icone: NomeIcone;
  titulo: string;
  texto: string;
}

interface ItemSimples {
  titulo: string;
  texto: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [
    RouterLink,
    LogoComponent,
    IconeComponent,
    SecaoHeroComponent,
    SecaoPropostaComponent,
    SecaoGaleriaComponent,
    JornadaInterativaComponent,
    SecaoRecursosComponent,
    SecaoParaQuemComponent,
    SecaoPerguntasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  protected readonly anoAtual = new Date().getFullYear();

  protected readonly dores: ItemComIcone[] = [
    {
      icone: 'relogio',
      titulo: 'Cliente que espera, compra de outro',
      texto: 'Enquanto você está com as mãos ocupadas ou descansando, a mensagem fica sem resposta e o cliente vai para o concorrente.',
    },
    {
      icone: 'listaRepetida',
      titulo: 'As mesmas perguntas, o dia inteiro',
      texto: '"Quanto custa?","Tem fotos?", "faz pra sábado?", "entrega no meu bairro?". Horas respondendo o que já está decidido.',
    },
    {
      icone: 'dispersao',
      titulo: 'Produzir ou responder?',
      texto: 'Parar o que está fazendo a cada notificação atrasa o trabalho. Ignorar o celular perde venda.',
    },
  ];

  protected readonly passos: ItemSimples[] = [
    {
      titulo: 'Cadastre suas informações',
      texto: 'Um passo a passo guiado pelo painel: Serviços, produtos, perguntas frequentes, formas de pagamento e regras da sua empresa. Você decide tudo! ',
    },
    {
      titulo: 'Conecte seu WhatsApp',
      texto: 'Seus clientes continuam falando com o mesmo número de sempre. E você pode escolher contatos pessoais que devem ser ignorados pela IA. ',
    },
    {
      titulo: 'Ele atende, você fecha',
      texto: 'O DizAI tira as dúvidas, explica os seus serviços, mostra seus trabalhos e te chama quando o cliente estiver pronto para comprar ou perguntar algo que não sabe responder.',
    },
  ];

  /** "01", "02", "03" */
  protected numeroDoPasso(indice: number): string {
    return String(indice + 1).padStart(2, '0');
  }
}
