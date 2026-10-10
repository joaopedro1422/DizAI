import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../shared/components/icone/icone.component';
import { NomeIcone } from '../../shared/components/icone/icones';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { SecaoGaleriaComponent } from './secao-galeria/secao-galeria.component';
import { SecaoHeroComponent } from './secao-hero/secao-hero.component';
import { SecaoPropostaComponent } from './secao-proposta/secao-proposta.component';

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
  imports: [RouterLink, LogoComponent, IconeComponent, SecaoHeroComponent, SecaoPropostaComponent, SecaoGaleriaComponent],
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
      texto: 'Enquanto você está com as mãos ocupadas, a mensagem fica sem resposta e o cliente vai para o concorrente.',
    },
    {
      icone: 'listaRepetida',
      titulo: 'As mesmas perguntas, o dia inteiro',
      texto: '"Quanto custa?", "faz pra sábado?", "entrega no meu bairro?". Horas respondendo o que já está decidido.',
    },
    {
      icone: 'dispersao',
      titulo: 'Produzir ou responder?',
      texto: 'Parar o que está fazendo a cada notificação atrasa o trabalho. Ignorar o celular perde venda.',
    },
  ];

  protected readonly passos: ItemSimples[] = [
    {
      titulo: 'Cadastre sua loja',
      texto: 'Um passo a passo guiado: Serviços, produtos, perguntas frequentes, formas de pagamento e regras da sua empresa. Você decide tudo!',
    },
    {
      titulo: 'Conecte seu WhatsApp',
      texto: 'Seus clientes continuam falando com o mesmo número de sempre. E você pode escolher contatos pessoais que devem ser ignorados pela IA ',
    },
    {
      titulo: 'Ele atende, você fecha',
      texto: 'O DizAI tira as dúvidas, mostra seus trabalhos e te chama quando o cliente estiver pronto para comprar ou perguntar algo que não sabe responder.',
    },
  ];

  /** Os mesmos ramos que o lojista escolhe no cadastro. */
  protected readonly publicos: ItemSimples[] = [
    { titulo: 'Serviços presenciais', texto: 'Manicures, esteticistas, cabeleireiras e pet shops.' },
    { titulo: 'Serviços personalizados', texto: 'Eletricistas, móveis projetados e pintores.' },
    { titulo: 'Doces e salgados', texto: 'Confeitarias, tortas, salgados e lanches.' },
    { titulo: 'Produtos personalizados', texto: 'Cortinas, presentes, estampas e cestas românticas.' },
    { titulo: 'Produtos em geral', texto: 'Roupas, tênis, acessórios e presentes.' }
  ];

  protected readonly recursos: ItemComIcone[] = [
    { icone: 'raio', titulo: 'Responde na hora', texto: 'De dia, de noite e no fim de semana, sem deixar ninguém no vácuo.' },
    { icone: 'escudo', titulo: 'Fala só o que é verdade', texto: 'Usa apenas o que você cadastrou. Se não souber, espera você responder.' },
    { icone: 'prancheta', titulo: 'Anota o pedido para você', texto: 'Coleta sabor, tamanho, data e endereço, confirma com o cliente e te entrega o resumo.' },
    { icone: 'pessoa', titulo: 'Você assume quando quiser', texto: 'Mandou uma mensagem no chat? O DizAI sai de cena na hora.' },
    { icone: 'imagem', titulo: 'Galeria dos seus trabalhos', texto: 'Fotos organizadas por serviço, enviadas no momento certo da conversa.' },
    { icone: 'ajustes', titulo: 'Do seu jeito', texto: 'Saudação própria e regras que só a sua loja tem, como "não atendemos aos domingos".' },
  ];

  /** "01", "02", "03" */
  protected numeroDoPasso(indice: number): string {
    return String(indice + 1).padStart(2, '0');
  }
}
