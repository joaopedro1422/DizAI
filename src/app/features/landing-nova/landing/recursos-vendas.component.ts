import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ArtePostComponent } from '../../posts/arte-post/arte-post.component';
import { artesDaLanding } from './artes-landing';
import { ETAPAS_PEDIDO, FOTOS, RECURSOS_VENDAS, TABELA_VENDAS } from './conteudo-vendas';
import { EtapasAvisoComponent } from './etapas-aviso.component';
import { semMovimento } from '../movimento';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/**
 * Recursos (o conteúdo da seção de produção, na marca nova): os destaques, o bento com a coleta do pedido, o
 * gerenciador de pedidos (as etapas avançam sozinhas, o card da Ana muda de status e a mensagem daquela etapa sai
 * para o cliente) e o gestor de clientes; depois o gestor financeiro, o cartão de Marketing (vitrine, posts e
 * campanhas, com "Saiba mais" até a seção), o antes e depois e a chamada para testar.
 */
const MAIS_VENDIDOS = [
  { nome: 'Bolo M', pedidos: 18, parte: 100 },
  { nome: 'Cento de coxinha', pedidos: 14, parte: 78 },
  { nome: 'Brigadeiros', pedidos: 9, parte: 50 },
  { nome: 'Torta de limão', pedidos: 6, parte: 33 },
];

const CLIENTES_EXEMPLO = [
  { iniciais: 'AS', nome: 'Ana Souza', info: '6 pedidos · R$ 612,00', selo: 'Frequente', tom: 'frequente' },
  { iniciais: 'JA', nome: 'Juliana Alves', info: 'Voltou a comprar ontem', selo: 'Voltou', tom: 'voltou' },
  { iniciais: 'CL', nome: 'Carlos Lima', info: 'Último pedido há 52 dias', selo: 'Sumido', tom: 'sumido' },
];

/** A semana do Gestor de pedidos (uma confeitaria): os pedidos de cada dia, até 4 na tela. */
interface PedidoDaSemana {
  nome: string;
  bolo: string;
  /** Recheio, massa e adicionais. */
  detalhe: string;
  status: 'pronto' | 'preparo';
  valor: string;
  /** O pedido tem a foto do modelo anexada. */
  foto: boolean;
}

interface DiaSemanaPedidos {
  semana: string;
  numero: number;
  rotulo: string;
  pedidos: number;
  lista: PedidoDaSemana[];
}

const p = (valor: string, nome: string, bolo: string, detalhe: string, foto = false, status: PedidoDaSemana['status'] = 'preparo'): PedidoDaSemana =>
  ({ valor, nome, bolo, detalhe, foto, status });

const SEMANA_PEDIDOS: DiaSemanaPedidos[] = [
  { semana: 'seg', numero: 16, rotulo: 'Hoje, 16/11', pedidos: 4, lista: [
    p('R$ 180,00', 'Paula', 'Bolo Festivo | 12-16 fatias', 'Ninho com morango · massa branca · + Nutella', true, 'pronto'),
    p('R$ 95,00', 'Júlia', 'Bolo Vulcão | 8 fatias', 'Brigadeiro · massa de chocolate · calda extra'),
    p('R$ 250,00', 'Renata', 'Bolo Festivo | 20-25 fatias', 'Doce de leite com ameixa · massa branca', true),
    p('R$ 160,00', 'Lucas', 'Naked Cake | 15 fatias', 'Frutas vermelhas · massa baunilha · + Flores comestíveis'),
  ] },
  { semana: 'ter', numero: 17, rotulo: 'Amanhã, 17/11', pedidos: 1, lista: [
    p('R$ 160,00', 'Rita', 'Naked Cake | 15 fatias', 'Frutas vermelhas · massa baunilha', true),
  ] },
  { semana: 'qua', numero: 18, rotulo: 'Quarta, 18/11', pedidos: 4, lista: [
    p('R$ 190,00', 'Marcos', 'Bolo Festivo | 12-16 fatias', 'Prestígio · massa de chocolate · + Morangos', true),
    p('R$ 120,00', 'Bia', 'Bolo de Pote | 10 un.', 'Ninho com Nutella e brigadeiro'),
    p('R$ 95,00', 'Carol', 'Bolo Vulcão | 8 fatias', 'Ninho com Nutella · massa de chocolate'),
    p('R$ 320,00', 'João', 'Bolo Festivo | 30 fatias', 'Quatro leites · massa branca · + Topo personalizado', true),
  ] },
  { semana: 'qui', numero: 19, rotulo: 'Quinta, 19/11', pedidos: 0, lista: [] },
  { semana: 'sex', numero: 20, rotulo: 'Sexta, 20/11', pedidos: 2, lista: [
    p('R$ 90,00', 'Lia', 'Bolo Vulcão | 8 fatias', 'Ninho · massa branca'),
    p('R$ 170,00', 'Davi', 'Bolo Festivo | 12-16 fatias', 'Brigadeiro · massa de chocolate', true),
  ] },
  { semana: 'sáb', numero: 21, rotulo: 'Sábado, 21/11', pedidos: 5, lista: [
    p('R$ 260,00', 'Carla', 'Bolo Festivo | 20-25 fatias', 'Ninho com morango · massa branca · + Topo personalizado', true),
    p('R$ 150,00', 'Marina', 'Naked Cake | 15 fatias', 'Doce de leite · massa de nozes'),
    p('R$ 195,00', 'Pedro', 'Bolo Festivo | 12-16 fatias', 'Brigadeiro branco · massa mista · + Nutella', true),
    p('R$ 140,00', 'Sofia', 'Bolo de Pote | 12 un.', 'Brigadeiro e ninho com morango'),
  ] },
  { semana: 'dom', numero: 22, rotulo: 'Domingo, 22/11', pedidos: 2, lista: [
    p('R$ 95,00', 'Ana', 'Bolo Vulcão | 8 fatias', 'Ninho com Nutella · massa de chocolate'),
    p('R$ 170,00', 'Tiago', 'Bolo Festivo | 12-16 fatias', 'Abacaxi com coco · massa branca', true),
  ] },
];
/** Os dias que ganham o destaque, em volta: hoje, quarta e sábado. */
const DESTAQUES = [0, 2, 5];

@Component({
  selector: 'app-recursos-vendas',
  imports: [RouterLink, EtapasAvisoComponent, ArtePostComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa nevoa" id="recursos">
      <div class="miolo">
        <div class="cabeca">
          <span class="rotulo">Recursos</span>
          <h2 class="titulo">Menos tempo no celular.<br /><span class="grifo">Mais pedidos fechados.</span></h2>
          <p class="apoio">Feito especialmente para quem vende por encomendas.</p>
        </div>

        <ul class="destaques-rec">
          @for (check of recursos.checks; track check) {
            <li><span class="check">✓</span><span>{{ check }}</span></li>
          }
        </ul>

        <div class="bento bento--vendas">
          <article class="rec rec--a">
            <span class="etiqueta">Coleta de pedidos - Apenas com assistente</span>
            <h3>O pedido chega anotado. Você apenas confirma.</h3>
            <p>A função do assistente é manter o seu cliente por perto. Ele coleta as informações que você definir e te entrega pronto para você confirmar a venda.</p>
            <div class="rec__visual">
              <div class="cartao">
                <div class="cartao__topo"><span>Ana Souza <small class="mono cartao__fone">(83) 98812-4410</small></span><span class="status status--pronto">Pronto para fechar</span></div>
                <div class="linha-dado"><span>Itens</span><span>100 coxinhas + 50 kibes</span></div>
                <div class="linha-dado"><span>Retirada</span><span>Sábado, 15:00</span></div>
                <div class="linha-dado"><span>Pagamento</span><span>Pix na retirada</span></div>
                <div class="linha-dado"><span>Total</span><b class="mono">R$ 135,00</b></div>
                <div class="acoes-cartao">
                  <span class="btn btn--escuro btn--pequeno btn--toque">✓ Confirmar pedido</span>
                  <span class="btn btn--linha btn--pequeno">Já entregue</span>
                </div>
              </div>
            </div>
          </article>

          <article class="rec rec--b">
            <span class="etiqueta">Gestor de pedidos</span>
            <h3>Pedidos na palma da sua mão</h3>
            <p>Gerencie as suas vendas de forma organizada, sem dor de cabeça e sem anotações no caderno.<br /><b>Os pedidos são divididos por dia de entrega</b> para organizar a sua rotina.</p>
            <!-- os pedidos por dia, em miniatura: a semana com quantos pedidos tem cada dia e os do dia em destaque
                 (o destaque passa por hoje, quarta e sábado; as linhas trocam com um fade) -->
            <div class="semana-pedidos" aria-hidden="true">
              <div class="semana-pedidos__dias">
                @for (dia of semanaPedidos; track dia.numero) {
                  <span class="sp-dia" [class.sp-dia--ativo]="dia.numero === diaAtivo().numero" [class.sp-dia--vazio]="!dia.pedidos">
                    <small>{{ dia.semana }}</small>
                    <b>{{ dia.numero }}</b>
                    <i class="mono">{{ dia.pedidos || '' }}</i>
                  </span>
                }
              </div>
              @for (dia of [diaAtivo()]; track dia.numero) {
                <div class="sp-lista">
                  <span class="sp-lista__titulo"><b>{{ dia.rotulo }}</b><small>{{ dia.pedidos }} pedidos</small></span>
                  @for (pedido of dia.lista.slice(0, 3); track pedido.nome; let i = $index) {
                    <span class="sp-pedido" [style.--i]="i">
                      <span class="sp-pedido__linha">
                        <span><b>{{ pedido.nome }}</b> · {{ pedido.bolo }}</span>
                        <i [class]="'sp-status sp-status--' + pedido.status">{{ pedido.status === 'pronto' ? 'Pronto' : 'Em preparo' }}</i>
                      </span>
                      <small>{{ pedido.detalhe }}</small>
                      <span class="sp-pedido__rodape">
                        <b class="mono">{{ pedido.valor }}</b>
                        @if (pedido.foto) {
                          <span class="sp-anexo"><app-icone nome="clipe" [tamanho]="13" [espessura]="2" />Foto do modelo</span>
                        }
                      </span>
                    </span>
                  }
                  @if (dia.pedidos > 3) {
                    <small class="sp-mais">+ {{ dia.pedidos - 3 }} {{ dia.pedidos - 3 === 1 ? 'pedido' : 'pedidos' }} neste dia</small>
                  }
                </div>
              }
            </div>
            <div class="rec-status">
            <p><b>Confirmado, pronto, entregue:</b> mude o status e a mensagem definida por você sai automaticamente.</p>
            <div class="rec__visual" style="margin-top: 0">
              <div class="fila">
                <div class="cartao cartao--destaque">
                  <span><b>Ana Souza</b><small>Bolo Festivo | 12-16 fatias · Sáb, 15:00 · <span class="mono">R$ 135,00</span></small></span>
                  <span [class]="'status status--' + classeStatus()">{{ statusAna() }}</span>
                </div>
              </div>
              <app-etapas-aviso [etapas]="etapasPedido" hora="15:02" (etapaMudou)="etapaAna.set($event)" />
            </div>
            </div>
          </article>

          <article class="rec rec--c rec--clientes">
              <span class="etiqueta">Gestor de clientes</span>
              <h3>O histórico de clientes</h3>
              <p>Saiba os clientes que mais compram, quem sumiu e os pedidos preferidos de cada um.</p>
            <div class="cartao lista-clientes" aria-hidden="true">
              <div class="lista-clientes__filtros"><span class="ativo">Todos</span><span>Frequentes</span><span>Sumidos</span></div>
              @for (cliente of clientes; track cliente.nome) {
                <div class="lista-clientes__linha">
                  <i>{{ cliente.iniciais }}</i>
                  <span><b>{{ cliente.nome }}</b><small>{{ cliente.info }}</small></span>
                  <em [class]="'selo-cliente selo-cliente--' + cliente.tom">{{ cliente.selo }}</em>
                </div>
              }
            </div>
          </article>
        </div>

        <article class="rec rec--largo rec--financeiro">
          <div class="rec--largo__texto">
            <span class="etiqueta">Gestor financeiro</span>
            <h3>Saiba quanto vendeu, o que mais vende e para quem.</h3>
            <p>Faturamento, ticket médio, os produtos e os dias que mais vendem e os clientes que mais compram, com relatório em PDF, sem planilha e sem caderno.</p>
          </div>
            <div class="rec__visual rec--financeiro__visual">
              <div class="cartao">
                <small class="cartao__legenda">Faturamento · últimos 30 dias</small>
                <div class="valor-grande">R$ 4.820,00</div>
                <div class="barras barras--crescem">
                  @for (altura of recursos.barras; track $index) {
                    <i [class.alta]="altura === 100" [style.height.%]="altura" [style.--i]="$index"></i>
                  }
                </div>
                <div class="indicadores">
                  <span><small>Ticket médio</small><b class="mono">R$ 68,00</b></span>
                  <span><small>Clientes fiéis</small><b class="mono">12</b></span>
                </div>
              </div>
              <div class="cartao mais-vendidos">
                <small class="cartao__legenda">Produtos que mais vendem</small>
                @for (produto of maisVendidos; track produto.nome; let i = $index) {
                  <div class="mais-vendidos__linha">
                    <span class="mais-vendidos__nome"><i>{{ i + 1 }}</i>{{ produto.nome }}</span>
                    <span class="mais-vendidos__barra"><i [style.width.%]="produto.parte"></i></span>
                    <b class="mono">{{ produto.pedidos }}</b>
                  </div>
                }
              </div>
            </div>
        </article>

        <article class="rec rec--largo rec--marketing">
          <div class="rec--largo__texto">
            <span class="etiqueta">Marketing</span>
            <h3>Divulgue o seu negócio de forma prática</h3>
            <p>Uma página personalizada com os seus produtos, posts prontos para as redes sociais e campanhas no WhatsApp nas datas que mais vendem.</p>
            <button type="button" class="btn btn--linha btn--pequeno marketing__mais" (click)="rolarAte('vitrine')">Saiba mais ↓</button>
          </div>
          <div class="marketing__visual" aria-hidden="true" (mouseenter)="pausado = true" (mouseleave)="pausado = false">
            <!-- a vitrine: o topo da página da loja -->
            <figure class="marketing__peca" [class.ativa]="pecaAtiva() === 0">
              <!-- o topo da vitrine de hoje: a capa, o cartão da loja com os selos, o menu e as fotos -->
              <div class="vitrine-mini">
                <img class="vitrine-mini__capa" [src]="fotos.capaPedacinho" alt="" />
                <div class="vitrine-mini__cartao">
                  <img class="vitrine-mini__logo" [src]="fotos.logoPedacinho" alt="" />
                  <b>Pedacinho do Céu</b>
                  <small>Doces e tortas personalizadas</small>
                  <span class="vitrine-mini__selos"><i class="aberto">Aberto agora</i><i>★ 4,9</i></span>
                  <span class="vitrine-mini__atendimento"><span><i></i><i></i><i></i></span>Atendimento 24 horas</span>
                </div>
                <span class="vitrine-mini__menu"><i class="ativo">Frutas vermelhas</i><i>Chocolate</i><i>Red velvet</i></span>
                <span class="vitrine-mini__fotos">
                  @for (foto of fotosVitrine; track foto) {
                    <img [src]="foto" alt="" />
                  }
                </span>
              </div>
              <figcaption>Página personalizada</figcaption>
            </figure>
            <!-- os posts: 3 artes do gerador de verdade em leque -->
            <figure class="marketing__peca" [class.ativa]="pecaAtiva() === 1">
              <div class="mini-leque">
                @for (arte of artes; track arte.id) {
                  <span class="mini-leque__arte">
                    <app-arte-post [marca]="arte.marca" [conteudo]="arte.conteudo" [estilo]="arte.estilo" formato="feed" [largura]="84" />
                  </span>
                }
              </div>
              <figcaption>Posts para as redes</figcaption>
            </figure>
            <!-- a campanha: a oportunidade e a mensagem que chega ao cliente -->
            <figure class="marketing__peca" [class.ativa]="pecaAtiva() === 2">
              <div class="campanha-mini">
                <div class="push"><span class="push__icone"></span><span><b>Oportunidade</b><small>Faltam 18 dias para o Dia das Mães</small></span></div>
                <span class="msg msg--loja">Olá, Ana! O Dia das Mães está chegando. Que tal encomendar o bolo dela?</span>
                <span class="campanha-mini__botao">Quero encomendar</span>
              </div>
              <figcaption>Campanhas no WhatsApp</figcaption>
            </figure>
            <span class="marketing__pontos">
              @for (n of [0, 1, 2]; track n) {
                <i [class.ativo]="pecaAtiva() === n"></i>
              }
            </span>
          </div>
        </article>

        <div class="comparacao">
          <div class="cabeca"><h2 class="titulo">O seu dia, <span class="grifo">antes e depois.</span></h2></div>
          <div class="tabela" role="table" aria-label="Comparação antes e depois do DizAI">
            <div class="tabela__linha" role="row">
              <span role="columnheader">Situação</span><span role="columnheader">Hoje</span><span role="columnheader">Com o DizAI</span>
            </div>
            @for (linha of tabela; track linha[0]) {
              <div class="tabela__linha" role="row">
                <span role="cell">{{ linha[0] }}</span>
                <span role="cell"><span class="x">✕</span>{{ linha[1] }}</span>
                <span role="cell"><span class="check">✓</span>{{ linha[2] }}</span>
              </div>
            }
          </div>
        </div>

        <div class="chamada-recursos">
          <div>
            <h3>Veja o assistente atendendo o seu negócio.</h3>
            <p>Cadastre os seus produtos em poucos minutos e converse com o assistente como se fosse um cliente, antes de ligar no WhatsApp.</p>
          </div>
          <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: 'produtos' }">Testar de graça →</a>
        </div>
      </div>
    </section>
  `,
})
export class RecursosVendasComponent {
  protected readonly recursos = RECURSOS_VENDAS;
  protected readonly tabela = TABELA_VENDAS;
  protected readonly etapasPedido = ETAPAS_PEDIDO;
  protected readonly etapaAna = signal(0);
  protected readonly statusAna = computed(() => ETAPAS_PEDIDO[this.etapaAna()].nome);
  protected readonly classeStatus = computed(() => ['confirmado', 'pronto', 'ok'][this.etapaAna()] ?? 'confirmado');
  protected readonly maisVendidos = MAIS_VENDIDOS;
  protected readonly clientes = CLIENTES_EXEMPLO;
  protected readonly fotos = FOTOS;
  protected readonly fotosVitrine = FOTOS.bolos.slice(0, 3);
  protected readonly artes = artesDaLanding('produtos').slice(0, 3);
  /** No celular o cartão de Marketing mostra uma peça por vez (no computador, as 3 lado a lado). */
  protected readonly pecaAtiva = signal(0);
  protected pausado = false;

  protected readonly semanaPedidos = SEMANA_PEDIDOS;
  /** O dia em destaque na semana do Gestor de pedidos (passa pelos dias de DESTAQUES a cada 3,5 s). */
  private readonly destaque = signal(0);
  protected readonly diaAtivo = computed(() => SEMANA_PEDIDOS[DESTAQUES[this.destaque()]]);

  constructor() {
    const relogio = setInterval(() => {
      if (!this.pausado) this.pecaAtiva.update((n) => (n + 1) % 3);
      if (!semMovimento()) this.destaque.update((n) => (n + 1) % DESTAQUES.length);
    }, 3500);
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
  }

  /** "Saiba mais": desce até o início da seção de Marketing. */
  protected rolarAte(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
