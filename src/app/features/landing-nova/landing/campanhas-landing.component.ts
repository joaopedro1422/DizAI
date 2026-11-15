import { ChangeDetectionStrategy, Component, afterNextRender, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { semMovimento } from '../movimento';
import { ConteudoLandingNova } from './conteudo-landing-nova';

interface TextosCampanhas {
  titulo: string;
  texto: string;
  passos: [string, string][];
  oportunidade: { titulo: string; detalhe: string; itens: [string, string][]; botao: string };
  conversa: { de: 'loja' | 'cliente'; texto: string; botao?: string; arte?: { titulo: string; apoio: string; cor: string } }[];
  loja: string;
  resultado: { campanha: string; valor: string; frase: string; funil: [string, number][]; custo: string };
  datas: string[];
}

const SERVICOS: TextosCampanhas = {
  titulo: 'Ele percebe quem sumiu e traz de volta.',
  texto: 'Não é só disparar mensagem: o DizAI acompanha o ritmo de cada cliente, enxerga os horários livres da sua agenda '
    + 'e as datas que movimentam o seu negócio. Quando aparece uma oportunidade, ele avisa e deixa a mensagem e a arte prontas.',
  passos: [
    ['Encontra a oportunidade', 'Quem passou da hora de voltar, quem sumiu e os horários que sobraram.'],
    ['O cliente recebe', 'Uma mensagem pessoal no WhatsApp. Quando ela responde, o assistente agenda.'],
    ['Mostra o resultado', 'Quem respondeu, quem agendou e quanto entrou no caixa.'],
  ],
  oportunidade: {
    titulo: 'Amanhã você tem 5 horários livres',
    detalhe: '6 clientes passaram da hora de voltar.',
    itens: [['Camila', 'volta a cada 21 dias · há 27'], ['Juliana', 'volta a cada 30 dias · há 41'], ['Renata', 'volta a cada 21 dias · há 25']],
    botao: 'Ver campanha',
  },
  conversa: [
    {
      de: 'loja',
      texto: 'Olá, Camila! Abriram horários para amanhã, entre 14:00 e 17:30. Quer garantir o seu?',
      botao: 'Quero agendar',
      arte: { titulo: 'Horários livres', apoio: 'Amanhã · 14:00 às 17:30', cor: '#b0306a' },
    },
    { de: 'cliente', texto: 'Quero! Pode ser às 15h?' },
    { de: 'loja', texto: 'Agendado! ✅ Esmaltação em gel, amanhã às 15:00.' },
  ],
  loja: 'Studio Bella',
  resultado: {
    campanha: 'Horários livres de amanhã',
    valor: 'R$ 180',
    frase: '3 clientes agendaram',
    funil: [['Enviadas', 14], ['Lidas', 11], ['Responderam', 5], ['Agendaram', 3]],
    custo: 'Custo na Meta: R$ 3,85',
  },
  datas: ['Carnaval', 'Páscoa', 'São João', 'Natal', 'Réveillon'],
};

const VENDAS: TextosCampanhas = {
  titulo: 'Ele sabe a época de vender e avisa os seus clientes.',
  texto: 'Não é só disparar mensagem: o DizAI acompanha as datas que mais vendem no seu segmento, avisa com a antecedência '
    + 'e monta a campanha com a sua arte e a mensagem pronta.',
  passos: [
    ['Avisa na hora certa', 'A data chegando e quantos clientes podem comprar.'],
    ['O cliente recebe', 'A mensagem da campanha e a arte.'],
    ['Mostra o resultado', 'Quem respondeu, quem comprou e quanto a data rendeu.'],
  ],
  oportunidade: {
    titulo: 'Faltam 18 dias para o Dia das Mães',
    detalhe: 'É agora que as encomendas começam. Avise os seus 57 clientes.',
    itens: [['Cestas', 'a mais vendida nas datas do ano passado'], ['Bolo Festivo', 'pedido por 12 clientes em datas parecidas']],
    botao: 'Ver campanha',
  },
  conversa: [
    {
      de: 'loja',
      texto: 'Olá, Ana! Estamos nos preparando para o Dia das Mães e já estamos aceitando encomendas. Quer garantir a sua?',
      botao: 'Tenho interesse',
      arte: { titulo: 'Dia das Mães', apoio: 'Encomendas abertas', cor: '#a8326e' },
    },
    { de: 'cliente', texto: 'Quero 2 cestas para o dia 9! 💐' },
    { de: 'loja', texto: 'Anotei! 2 cestas para o dia 9. Já vou confirmar o seu pedido.' },
  ],
  loja: 'Pedacinho do Céu',
  resultado: {
    campanha: 'Dia das Mães',
    valor: 'R$ 1.650',
    frase: '11 clientes compraram',
    funil: [['Enviadas', 54], ['Lidas', 46], ['Responderam', 16], ['Compraram', 11]],
    custo: 'Custo na Meta: R$ 16,10',
  },
  datas: ['Páscoa', 'Dia das Mães', 'Dia dos Pais', 'Natal'],
};

/**
 * Campanhas no WhatsApp: o 3º bloco da seção de marketing (depois da vitrine e dos posts, no mesmo desenho: texto de
 * um lado, exemplo do outro). O exemplo é uma tela só que passa os 3 passos em slides (a oportunidade no painel, a
 * conversa com a arte no topo e o resultado em reais); os passos do texto são as abas (o ativo enche a barrinha, que é
 * o relógio: o animationend passa o passo; o mouse na tela pausa). O host é o próprio `.vp__bloco`, para a linha entre os blocos valer.
 */
@Component({
  selector: 'app-campanhas-landing',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'vp__bloco cp' },
  template: `
    @let t = textos();
    <div class="vp__texto">
      <span class="etiqueta-vp">Campanhas no WhatsApp</span>
      <h3>{{ t.titulo }}</h3>
      <p>{{ t.texto }}</p>
      <div class="cp__passos" role="tablist" aria-label="Como funciona">
        @for (p of t.passos; track p[0]; let i = $index) {
          <button type="button" role="tab" class="cp__passo" [class.cp__passo--ativo]="ativo() === i"
            [attr.aria-selected]="ativo() === i" (click)="ir(i)">
            <i>{{ i + 1 }}</i>
            <span><b>{{ p[0] }}</b><small>{{ p[1] }}</small></span>
            @if (ativo() === i && !parado()) {
              <em class="cp__relogio" [class.cp__relogio--pausado]="pausado()" (animationend)="ir((i + 1) % 3)"></em>
            }
          </button>
        }
      </div>
      <div class="cp__datas">
        <div class="cp__tags">
          @for (d of t.datas; track d) { <span>{{ d }}</span> }
        </div>
        <small>ou quando você quiser</small>
      </div>
      <a class="btn btn--forte" [routerLink]="conteudo().rota + '/campanhas'">Como funciona →</a>
    </div>

    <div class="vp__visual">
      <div class="cp__tela" (mouseenter)="pausado.set(true)" (mouseleave)="pausado.set(false)" aria-live="polite">
        <!-- 1. a oportunidade no painel -->
        <div class="cp__slide cp__oportunidade" [class.cp__slide--ativo]="ativo() === 0" [attr.aria-hidden]="ativo() !== 0">
          <span class="cp__selo">Oportunidade</span>
          <b class="cp__op-titulo">{{ t.oportunidade.titulo }}</b>
          <span class="cp__op-detalhe">{{ t.oportunidade.detalhe }}</span>
          <ul class="cp__itens">
            @for (item of t.oportunidade.itens; track item[0]) {
              <li><i>{{ item[0].charAt(0) }}</i><span><b>{{ item[0] }}</b><small>{{ item[1] }}</small></span></li>
            }
          </ul>
          <span class="cp__op-botao">{{ t.oportunidade.botao }}</span>
        </div>

        <!-- 2. a conversa no WhatsApp -->
        <div class="cp__slide cp__chat" [class.cp__slide--ativo]="ativo() === 1" [attr.aria-hidden]="ativo() !== 1">
          <span class="cp__chat-topo"><i>{{ t.loja.charAt(0) }}</i>{{ t.loja }}</span>
          @for (m of t.conversa; track $index) {
            <div class="cp__msg" [class.cp__msg--cliente]="m.de === 'cliente'" [style.--ordem]="$index">
              @if (m.arte; as arte) {
                <span class="cp__arte" [style.--cor-arte]="arte.cor"><small>{{ t.loja }}</small><b>{{ arte.titulo }}</b><em>{{ arte.apoio }}</em></span>
              }
              <p>{{ m.texto }}</p>
              @if (m.botao) { <span class="cp__msg-botao">{{ m.botao }}</span> }
            </div>
          }
        </div>

        <!-- 3. o resultado -->
        <div class="cp__slide cp__resultado" [class.cp__slide--ativo]="ativo() === 2" [attr.aria-hidden]="ativo() !== 2">
          <span class="cp__res-campanha">{{ t.resultado.campanha }}</span>
          <span class="cp__res-rotulo">Trouxe</span>
          <b class="cp__res-valor">{{ t.resultado.valor }}</b>
          <span class="cp__res-frase">{{ t.resultado.frase }}</span>
          <div class="cp__funil">
            @for (etapa of t.resultado.funil; track etapa[0]; let ultima = $last) {
              <div class="cp__funil-linha" [class.cp__funil-linha--fim]="ultima">
                <span>{{ etapa[0] }}</span>
                <i><s [style.--cheio]="etapa[1] / t.resultado.funil[0][1]"></s></i>
                <b>{{ etapa[1] }}</b>
              </div>
            }
          </div>
          <small class="cp__res-custo">{{ t.resultado.custo }}</small>
        </div>
      </div>
    </div>
  `,
})
export class CampanhasLandingComponent {
  readonly conteudo = input.required<ConteudoLandingNova>();

  protected readonly textos = computed(() => (this.conteudo().tipo === 'servicos' ? SERVICOS : VENDAS));
  protected readonly ativo = signal(0);
  protected readonly pausado = signal(false);
  /** Movimento reduzido: sem troca sozinha (os passos continuam clicáveis). */
  protected readonly parado = signal(false);

  constructor() {
    // a barrinha do passo ativo é o relógio: o fim da animação (5,2 s) passa para o próximo
    afterNextRender(() => {
      if (semMovimento()) this.parado.set(true);
    });
  }

  protected ir(passo: number): void {
    this.ativo.set(passo);
  }
}
