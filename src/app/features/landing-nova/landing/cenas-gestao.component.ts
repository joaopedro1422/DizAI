import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

export type CenaGestao = 'pedidos' | 'financeiro';

/** Uma linha do caderno: o que foi riscado aparece antes do texto que ficou. */
interface LinhaCaderno {
  texto: string;
  riscado?: string;
}

interface PedidoCena {
  nome: string;
  whatsapp: string;
  ha: string;
  pronto: boolean;
  resumo: [string, string][];
  valor: string;
}

const PEDIDOS: PedidoCena[] = [
  {
    nome: 'Paula Ramos',
    whatsapp: '(83) 99812-4410',
    ha: '2 h',
    pronto: false,
    resumo: [['Itens', '50 coxinhas e 50 risoles'], ['Data', 'Hoje, 10:00'], ['Entrega', 'Retirada']],
    valor: 'R$ 85,00',
  },
  {
    nome: 'Júlia Martins',
    whatsapp: '(83) 99630-5127',
    ha: '3 h',
    pronto: false,
    resumo: [['Itens', '50 kibes e 50 bolinhas de queijo'], ['Data', 'Hoje, 15:00'], ['Entrega', 'Rua das Flores, 120']],
    valor: 'R$ 85,00',
  },
];

/** Faturamento por dia (altura da coluna em %), de 01/11 até hoje. */
const SERIE = [38, 22, 0, 46, 30, 52, 88, 64, 18, 34, 41, 28, 60, 96, 57];
/** Dias que mais vendem (seg → dom); o sábado é o melhor. */
const SEMANA = [26, 31, 22, 38, 55, 100, 40];
const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

/**
 * As cenas da gestão na seção "A solução" (landing de vendas), no lugar da conversa: os pedidos (o caderno × o painel
 * de Pedidos) e o financeiro (a conta de cabeça × a tela de Números). Tudo em CSS (`landing-cenas.css`): cada cena que
 * entra anima de novo.
 */
@Component({
  selector: 'app-cenas-gestao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconeComponent],
  template: `
    @if (cena() === 'pedidos') {
      @if (!com()) {
        <div class="cg-caderno">
          <b class="cg-caderno__titulo">Encomendas</b>
          @for (linha of cadernoPedidos; track $index; let i = $index) {
            <span class="cg-caderno__linha" [style.--i]="i">
              {{ linha.texto }}
              @if (linha.riscado) {
                <s>{{ linha.riscado }}</s>
              }
            </span>
          }
          <span class="cg-postit">Qual é o número da Júlia???</span>
          <div class="cg-busca">
            <span class="cg-busca__campo"><app-icone nome="busca" [tamanho]="15" [espessura]="2" />Júlia</span>
            <small>Nenhuma conversa encontrada</small>
            <span class="cg-busca__tempo"><app-icone nome="relogio" [tamanho]="14" [espessura]="2" />12 minutos procurando</span>
          </div>
          <span class="cg-fim">Um pedido ficou para trás</span>
        </div>
      } @else {
        <div class="cg-tela">
          <div class="cg-topo">
            <app-icone nome="menu" [tamanho]="20" [espessura]="2" />
            <b>Pedidos</b>
            <span class="cg-topo__mais"><app-icone nome="mais" [tamanho]="16" [espessura]="2.4" /></span>
          </div>
          <div class="cg-dia">
            <span class="cg-dia__textos">
              <span class="cg-dia__troca cg-dia__troca--sai"><b>Hoje</b><small>segunda, 16 de novembro · 2 pedidos</small></span>
              <span class="cg-dia__troca cg-dia__troca--entra"><b>Sábado, 21/11</b><small>sábado, 21 de novembro · 5 pedidos</small></span>
            </span>
            <span class="cg-dia__calendario"><app-icone nome="calendario" [tamanho]="18" [espessura]="2.2" /></span>
          </div>
          <div class="cg-tela__corpo">
            <div class="cg-rolagem cg-rolagem--pedidos">
              @for (p of pedidos; track p.nome; let i = $index) {
                <div class="cg-pedido" [style.--i]="i">
                  <div class="cg-pedido__topo">
                    <span><b>{{ p.nome }}</b><small>{{ p.whatsapp }} · confirmado há {{ p.ha }}</small></span>
                    <app-icone nome="maisOpcoes" [tamanho]="18" />
                  </div>
                  <div class="cg-selos">
                    @if (i === 0) {
                      <span class="cg-selo cg-selo--sai"><i></i>Em preparo</span>
                      <span class="cg-selo cg-selo--pronto cg-selo--entra"><i></i>Pronto</span>
                    } @else {
                      <span class="cg-selo" [class.cg-selo--pronto]="p.pronto"><i></i>{{ p.pronto ? 'Pronto' : 'Em preparo' }}</span>
                    }
                  </div>
                  <dl class="cg-resumo">
                    @for (linha of p.resumo; track linha[0]) {
                      <div><dt>{{ linha[0] }}</dt><dd>{{ linha[1] }}</dd></div>
                    }
                  </dl>
                  <div class="cg-pedido__rodape">
                    <b>{{ p.valor }}</b>
                    <app-icone nome="conversa" [tamanho]="18" />
                  </div>
                  <div class="cg-acoes" [class.cg-acoes--uma]="p.pronto">
                    @if (!p.pronto) {
                      <span class="cg-botao" [class.cg-botao--toque]="i === 0"><app-icone nome="sino" [tamanho]="15" />Pedido pronto</span>
                    }
                    <span class="cg-botao cg-botao--ok"><app-icone nome="check" [tamanho]="15" [espessura]="2.4" />Entregue</span>
                  </div>
                </div>
              }
            </div>
            <!-- depois de escolher o sábado no calendário: os pedidos daquele dia -->
            <div class="cg-rolagem cg-rolagem--sabado">
              @for (p of pedidosSabado; track p[0]; let i = $index) {
                <div class="cg-mini" [style.--i]="i">
                  <span><b>{{ p[0] }}</b><small>{{ p[1] }}</small></span>
                  <span class="cg-mini__direita"><em class="mono">{{ p[2] }}</em><span class="cg-selo"><i></i>Em preparo</span></span>
                </div>
              }
            </div>
            <div class="cg-aviso">
              <span class="cg-aviso__icone"><app-icone nome="checkDuplo" [tamanho]="16" [espessura]="2.2" /></span>
              <span><b>Aviso enviado pelo WhatsApp</b><small>"Paula, seus salgados estão prontos!"</small></span>
            </div>
          </div>
          <!-- o calendário no modal: o número de pedidos em cada dia -->
          <div class="cg-folha">
            <div class="cg-folha__cartao">
              <span class="cg-folha__alca"></span>
              <b class="cg-folha__titulo">Escolha o dia</b>
              <span class="cg-folha__mes">Novembro de 2026</span>
              <div class="cg-cal">
                @for (letra of letrasSemana; track $index) {
                  <span class="cg-cal__letra">{{ letra }}</span>
                }
                @for (vazio of vaziosNovembro; track $index) {
                  <span></span>
                }
                @for (dia of diasNovembro; track dia.numero) {
                  <span
                    class="cg-cal__dia"
                    [class.cg-cal__dia--com]="dia.pedidos > 0"
                    [class.cg-cal__dia--hoje]="dia.numero === 16"
                    [class.cg-cal__dia--escolhe]="dia.numero === 21"
                  >
                    {{ dia.numero }}
                    @if (dia.pedidos > 0) {
                      <i class="mono">{{ dia.pedidos }}</i>
                    }
                  </span>
                }
              </div>
            </div>
          </div>
          <span class="cg-fim cg-fim--com">Os pedidos organizados por dia</span>
        </div>
      }
    } @else {
      @if (!com()) {
        <div class="cg-caderno cg-caderno--contas">
          <b class="cg-caderno__titulo">Novembro</b>
          @for (linha of cadernoContas; track $index; let i = $index) {
            <span class="cg-caderno__linha" [style.--i]="i">{{ linha }}</span>
          }
          <span class="cg-caderno__linha cg-caderno__total" style="--i: 4">= ???</span>
          <div class="cg-duvidas">
            @for (duvida of duvidas; track duvida; let i = $index) {
              <span class="cg-duvida" [style.--i]="i"><i>?</i>{{ duvida }}</span>
            }
          </div>
          <span class="cg-fim">Sem saber para onde o negócio vai</span>
        </div>
      } @else {
        <div class="cg-tela cg-tela--numeros">
          <div class="cg-topo">
            <app-icone nome="menu" [tamanho]="20" [espessura]="2" />
            <b>Números</b>
          </div>
          <div class="cg-tela__corpo">
            <div class="cg-rolagem cg-rolagem--numeros">
              <div class="cg-filtros">
                <span class="cg-chip cg-chip--ativo">Novembro de 2026<i></i></span>
                <span class="cg-chip">Ano<i></i></span>
              </div>
              <div class="cg-filtros cg-filtros--semana">
                <span class="cg-chip cg-chip--solto">Esta semana</span>
                <span class="cg-pdf"><app-icone nome="setaBaixo" [tamanho]="14" [espessura]="2.2" />PDF</span>
              </div>

              <div class="cg-kpis">
                <div class="cg-kpi cg-kpi--destaque">
                  <span class="cg-kpi__rotulo">Faturamento</span>
                  <span class="cg-kpi__valor">R$ 8.420,00</span>
                  <span class="cg-kpi__nota">pedidos entregues em novembro</span>
                  <span class="cg-comparacao"><b>▲ 18%</b> em relação a outubro</span>
                </div>
                <div class="cg-kpi cg-kpi--largo">
                  <span class="cg-kpi__icone"><app-icone nome="grafico" [tamanho]="14" [espessura]="2" /></span>
                  <span class="cg-kpi__rotulo">Ticket médio</span>
                  <span class="cg-kpi__valor">R$ 96,78</span>
                  <span class="cg-kpi__nota">por pedido</span>
                </div>
                <div class="cg-kpi">
                  <span class="cg-kpi__icone"><app-icone nome="check" [tamanho]="14" [espessura]="2.4" /></span>
                  <span class="cg-kpi__rotulo">Entregues</span>
                  <span class="cg-kpi__valor">87</span>
                  <span class="cg-kpi__nota">2 cancelados</span>
                </div>
                <div class="cg-kpi">
                  <span class="cg-kpi__icone"><app-icone nome="caixa" [tamanho]="14" [espessura]="2" /></span>
                  <span class="cg-kpi__rotulo">Em andamento agora</span>
                  <span class="cg-kpi__valor">6</span>
                  <span class="cg-kpi__nota">R$ 540,00 a receber</span>
                </div>
              </div>

              <div class="cg-cartao">
                <b class="cg-cartao__titulo">Faturamento por dia</b>
                <small class="cg-cartao__sub">Pedidos entregues em novembro</small>
                <div class="cg-grafico">
                  <span class="cg-eixo" style="bottom: 100%"><i>R$ 900</i></span>
                  <span class="cg-eixo" style="bottom: 50%"><i>R$ 450</i></span>
                  <span class="cg-eixo cg-eixo--base" style="bottom: 0"></span>
                  <div class="cg-colunas">
                    @for (altura of serie; track $index; let i = $index) {
                      <span class="cg-coluna"><i [style.height.%]="altura" [style.--i]="i"></i></span>
                    }
                  </div>
                </div>
                <div class="cg-rotulos">
                  @for (altura of serie; track $index; let i = $index) {
                    <span [class.cg-rotulos--hoje]="i === serie.length - 1">{{ i === serie.length - 1 ? 'hoje' : rotuloDia(i) }}</span>
                  }
                </div>
              </div>

              <div class="cg-cartao">
                <b class="cg-cartao__titulo">Produtos que mais vendem</b>
                <small class="cg-cartao__sub">Faturamento de cada um em novembro</small>
                <ol class="cg-barras">
                  @for (produto of maisVendidos; track produto[0]; let i = $index) {
                    <li>
                      <span class="cg-barra__topo">
                        <span class="cg-barra__nome"><em>{{ i + 1 }}</em>{{ produto[0] }}<small>{{ produto[1] }} unidades</small></span>
                        <b>{{ produto[2] }}</b>
                      </span>
                      <span class="cg-barra__trilho"><i [style.width.%]="produto[3]" [style.--i]="i"></i></span>
                    </li>
                  }
                </ol>
              </div>

              <div class="cg-cartao">
                <b class="cg-cartao__titulo">Dias que mais vendem</b>
                <small class="cg-cartao__sub">Sábado é o seu melhor dia em novembro</small>
                <div class="cg-colunas cg-colunas--semana">
                  @for (altura of semana; track $index; let i = $index) {
                    <span class="cg-coluna" [class.cg-coluna--destaque]="altura === 100"><i [style.height.%]="altura" [style.--i]="i"></i></span>
                  }
                </div>
                <div class="cg-rotulos cg-rotulos--semana">
                  @for (dia of dias; track dia) {
                    <span [class.cg-rotulos--hoje]="dia === 'sáb'">{{ dia }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
          <span class="cg-fim cg-fim--com">Quanto vendeu, o que mais vende e quando</span>
        </div>
      }
    }
  `,
})
export class CenasGestaoComponent {
  readonly cena = input.required<CenaGestao>();
  /** false = sem o DizAI (o caderno); true = com o DizAI (o painel). */
  readonly com = input(false);

  protected readonly pedidos = PEDIDOS;
  /** Sábado, 21/11: [cliente, itens e hora, valor]. */
  protected readonly pedidosSabado: [string, string, string][] = [
    ['Carlos Lima', '200 salgados de festa · 09:00', 'R$ 170'],
    ['Marina Costa', '100 coxinhas · 10:30', 'R$ 85'],
    ['Pedro Alves', 'Mini pizzas (cento) · 14:00', 'R$ 95'],
    ['Ana Souza', '150 salgados sortidos · 16:00', 'R$ 127'],
    ['Bia Rocha', '50 kibes · 18:00', 'R$ 45'],
  ];
  protected readonly letrasSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  /** Novembro de 2026 começa num domingo (a semana começa na segunda). */
  protected readonly vaziosNovembro = Array.from({ length: 6 });
  protected readonly diasNovembro = Array.from({ length: 30 }, (_, i) => ({
    numero: i + 1,
    pedidos: ({ 16: 2, 17: 1, 18: 3, 20: 2, 21: 5, 22: 2, 25: 1, 28: 4 } as Record<number, number>)[i + 1] ?? 0,
  }));
  protected readonly serie = SERIE;
  protected readonly semana = SEMANA;
  protected readonly dias = DIAS;

  protected readonly cadernoPedidos: LinhaCaderno[] = [
    { texto: 'Paula: 100 salg. sáb 10h' },
    { texto: 'Carlos:', riscado: '150' },
    { texto: '200 salg., entrega?' },
    { texto: 'Júlia: kibe + queijo, dom' },
    { texto: 'Marcos: mini pizza' },
    { texto: 'Bia: ligar!!' },
  ];

  protected readonly cadernoContas = ['85 + 170 + 85 + 96 + 120', '+ 85 + 60 (pix?) + 170', '+ 45 + ... + ...', '- 38 (troco?)'];

  protected readonly duvidas = ['Quanto eu vendi este mês?', 'Qual produto vende mais?', 'Quando eu vendo mais?'];

  /** [nome, unidades, faturamento, largura da barra %] */
  protected readonly maisVendidos: [string, number, string, number][] = [
    ['Salgados (cento)', 46, 'R$ 3.910,00', 100],
    ['Salgados de forno', 21, 'R$ 2.100,00', 54],
    ['Mini pizzas', 12, 'R$ 1.140,00', 29],
    ['Coxinha de costela', 8, 'R$ 880,00', 23],
  ];

  protected rotuloDia(i: number): string {
    return `${String(i + 1).padStart(2, '0')}/11`;
  }
}
