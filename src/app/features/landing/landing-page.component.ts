import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../shared/components/icone/icone.component';
import { NomeIcone } from '../../shared/components/icone/icones';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { SecaoGaleriaComponent } from './secao-galeria/secao-galeria.component';
import { SecaoPostsComponent } from './secao-posts/secao-posts.component';
import { SecaoParaQuemComponent } from './secao-para-quem/secao-para-quem.component';
import { SecaoPerguntasComponent } from './secao-perguntas/secao-perguntas.component';
import { SecaoRecursosComponent } from './secao-recursos/secao-recursos.component';
import { FaixaNegociosComponent } from './faixa-negocios/faixa-negocios.component';
import { SecaoHeroComponent } from './secao-hero/secao-hero.component';
import { SecaoPesquisaComponent } from './secao-pesquisa/secao-pesquisa.component';
import { SecaoSolucaoComponent } from './secao-solucao/secao-solucao.component';
import { JornadaInterativaComponent } from './jornada-interativa/jornada-interativa.component';

interface Dor {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  /** Uma mensagem de cliente de verdade, para o lojista se reconhecer. */
  citacao: string;
}

interface Passo {
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
    FaixaNegociosComponent,
    SecaoPesquisaComponent,
    SecaoSolucaoComponent,
    SecaoGaleriaComponent,
    SecaoPostsComponent,
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

  protected readonly dores: Dor[] = [
    {
      icone: 'relogio',
      titulo: 'Cliente que espera, procura em outro lugar',
      texto: 'Enquanto você está com as mãos ocupadas ou descansando, a mensagem fica sem resposta e o cliente vai para o concorrente.',
      citacao: '"Oi? Ainda tem horário hoje?" · enviada há 2 h',
    },
    {
      icone: 'listaRepetida',
      titulo: 'As mesmas perguntas, o dia inteiro',
      texto: 'Horas respondendo o que já está decidido: preço, foto, prazo, entrega, horário.',
      citacao: '"Quanto custa?" "Tem foto?" "Entrega no meu bairro?"',
    },
    {
      icone: 'dispersao',
      titulo: 'Produzir ou responder?',
      texto: 'Parar o que está fazendo a cada notificação atrasa o trabalho. Ignorar o celular perde venda.',
      citacao: '"Faz pra sábado?" · chegou no meio do atendimento',
    },
  ];

  protected readonly passos: Passo[] = [
    {
      titulo: 'Cadastre o seu negócio',
      texto: 'Um passo a passo guiado no painel: serviços ou produtos, preços, perguntas frequentes, formas de pagamento e as regras da sua empresa.',
    },
    {
      titulo: 'Conecte o seu WhatsApp',
      texto: 'Os clientes continuam falando com o mesmo número de sempre. Contatos pessoais, como família e amigos, ficam de fora.',
    },
    {
      titulo: 'Ele atende do começo ao fim',
      texto:
        'Tira dúvidas, faz orçamentos e envia catálogo e fotos. Na hora de fechar, marca o horário na sua agenda ou anota o pedido e te avisa no celular.',
    },
  ];

  /** "01", "02", "03" */
  protected numeroDoPasso(indice: number): string {
    return String(indice + 1).padStart(2, '0');
  }
}
