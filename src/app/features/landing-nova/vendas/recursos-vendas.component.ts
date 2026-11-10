import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ETAPAS_PEDIDO, RECURSOS_VENDAS, TABELA_VENDAS } from './conteudo-vendas';
import { EtapasAvisoComponent } from './etapas-aviso.component';

/**
 * Recursos (o conteúdo da seção de produção, na marca nova): os destaques, o bento com a coleta do pedido, o
 * gerenciador de pedidos (as etapas avançam sozinhas, o card da Ana muda de status e a mensagem daquela etapa sai
 * para o cliente) e os relatórios; depois "Além disso", o antes e depois e a chamada para testar.
 */
@Component({
  selector: 'app-recursos-vendas',
  imports: [RouterLink, EtapasAvisoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa nevoa" id="recursos">
      <div class="miolo">
        <div class="cabeca">
          <span class="rotulo">Recursos</span>
          <h2 class="titulo">Menos tempo no celular.<br /><span class="grifo">Mais pedidos fechados.</span></h2>
          <p class="apoio">Feito para quem vende por encomenda: do orçamento ao pedido entregue, com você no controle.</p>
        </div>

        <ul class="destaques-rec">
          @for (check of recursos.checks; track check) {
            <li><span class="check">✓</span><span>{{ check }}</span></li>
          }
        </ul>

        <div class="bento">
          <article class="rec rec--a">
            <span class="etiqueta">Coleta de pedidos</span>
            <h3>O pedido chega anotado. Você apenas confirma.</h3>
            <p>A função do assistente é responder o seu cliente nos primeiros 30 segundos de interesse e mantê-lo por perto. Ele tira dúvidas, coleta informações e te entrega pedidos anotados, prontos para serem confirmados.</p>
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
            <span class="etiqueta">Gerenciador de pedidos</span>
            <h3>Cada etapa avisa o cliente com um toque.</h3>
            <p>Confirmado, pronto, entregue: mude o status e a mensagem pronta daquela etapa sai, com o nome e o valor já preenchidos.</p>
            <div class="rec__visual">
              <div class="fila">
                <div class="cartao cartao--destaque">
                  <span><b>Ana Souza</b><small>100 coxinhas + 50 kibes · Sáb, 15:00 · <span class="mono">R$ 135</span></small></span>
                  <span [class]="'status status--' + classeStatus()">{{ statusAna() }}</span>
                </div>
                <div class="cartao">
                  <span><b>Carlos Lima</b><small>Bolo de ninho 2 kg · Sex, 18:00 · <span class="mono">R$ 160</span></small></span>
                  <span class="status">Confirmado</span>
                </div>
              </div>
              <app-etapas-aviso [etapas]="etapasPedido" hora="15:02" (etapaMudou)="etapaAna.set($event)" />
            </div>
          </article>

          <article class="rec rec--c">
            <span class="etiqueta">Relatórios e insights</span>
            <h3>Saiba quanto vendeu, em que dia e para quem.</h3>
            <p>Faturamento, ticket médio, tempo de preparo, os dias que mais vendem e os clientes que mais compram, sem planilha e sem caderno.</p>
            <div class="rec__visual">
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
                  <span><small>Preparo médio</small><b class="mono">2h10</b></span>
                  <span><small>Clientes fiéis</small><b class="mono">12</b></span>
                </div>
              </div>
              <span class="insight">Sábado é o dia que mais vende</span>
              <span class="insight">Melhor cliente: Ana, 6 pedidos</span>
            </div>
          </article>
        </div>

        <div class="alem">
          <h3>Além disso</h3>
          <ul>
            @for (item of recursos.alem; track item[0]) {
              <li><span class="check">✓</span><span><b>{{ item[0] }}</b>{{ item[1] }}</span></li>
            }
          </ul>
        </div>

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
}
