import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChildren,
} from '@angular/core';

import { CenaAgenda, ETAPAS_AGENDA, PASSOS_AGENDA } from './conteudo-agendamentos';
import { EtapasAvisoComponent } from './etapas-aviso.component';

/**
 * "Na prática" de agendamentos: do primeiro "tem horário?" ao cliente que volta, em 5 passos, com o mesmo palco
 * preso da landing de vendas (CSS em landing-meio.css). O passo 3 mostra as mensagens automáticas da agenda
 * (agendado → lembrete → agradecimento) saindo sozinhas para o cliente.
 */
@Component({
  selector: 'app-na-pratica-agenda',
  imports: [NgTemplateOutlet, EtapasAvisoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa nevoa" id="pratica">
      <div class="miolo">
        <div class="cabeca">
          <span class="rotulo">Na prática</span>
          <h2 class="titulo">Do primeiro "tem horário?"<br /><span class="grifo">ao cliente que volta.</span></h2>
        </div>

        <div class="historia__grade">
          <div>
            @for (p of passos; track p.titulo; let i = $index) {
              <article class="passo" #passo [attr.data-passo]="i" [class.ativo]="i === ativo()">
                <span class="passo__num"><i>{{ i + 1 }}</i> de {{ passos.length }}</span>
                <h3>{{ p.titulo }}</h3>
                <p>{{ p.texto }}</p>
                <div class="cena cena-inline" [class.cena--wpp]="ehConversa(p.cena)">
                  <div class="cena__largura"><ng-container *ngTemplateOutlet="cena; context: { $implicit: p.cena }" /></div>
                </div>
              </article>
            }
          </div>

          <div class="palco" aria-hidden="true">
            <div class="palco__moldura">
              @for (p of passos; track p.titulo; let i = $index) {
                <div class="cena" [class.cena--wpp]="ehConversa(p.cena)" [class.ativa]="i === ativo()">
                  <div class="cena__largura"><ng-container *ngTemplateOutlet="cena; context: { $implicit: p.cena }" /></div>
                </div>
              }
              <div class="palco__progresso">
                @for (p of passos; track p.titulo; let i = $index) {
                  <i [class.ativo]="i === ativo()"></i>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <ng-template #cena let-tipo>
      @switch (tipo) {
        @case ('conversa') {
          <span class="cena__selo">Respondido em <b class="mono">3 s</b></span>
          <span class="msg msg--cliente">Tem horário amanhã à tarde para pé e mão?<time>12:07</time></span>
          <span class="msg msg--loja">Tenho às 14:00, 15:30 e 17:00. Qual fica melhor para você?<time>12:07</time></span>
          <span class="msg msg--cliente">14h, por favor<time>12:08</time></span>
        }
        @case ('agenda') {
          <div class="cartao">
            <div class="cartao__topo"><span>Amanhã</span><span class="mono cartao__livres">2 livres</span></div>
            <div class="agenda-blocos">
              <div class="agenda-bloco"><span class="mono">13:00</span><div>Manicure · Ana</div></div>
              <div class="agenda-bloco agenda-bloco--novo"><span class="mono">14:00</span><div>Pé e mão · Maria</div></div>
              <div class="agenda-bloco"><span class="mono">16:00</span><div>Gel · Júlia</div></div>
            </div>
          </div>
          <span class="cena__selo cena__selo--verde">✓ Novo horário na agenda</span>
        }
        @case ('mensagens') {
          <app-etapas-aviso [etapas]="etapasAgenda" hora="12:00" />
        }
        @case ('vaga') {
          <span class="cena__selo">Vaga liberada · <b class="mono">hoje, 15:30</b></span>
          <span class="msg msg--loja">Oi, Júlia! Abriu um horário hoje às 15:30. Quer ficar com ele?<time>13:10</time></span>
          <span class="vaga-botoes"><span>Quero o horário</span><span>Não posso</span></span>
          <span class="msg msg--cliente">Quero o horário<time>13:11</time></span>
          <span class="cena__selo cena__selo--verde">✓ Horário preenchido</span>
        }
        @case ('numeros') {
          <div class="cartao">
            <div class="cartao__topo"><span class="cartao__legenda">Faturamento · outubro</span></div>
            <div class="valor-grande">R$ 6.340,00</div>
            <div class="barras">
              @for (altura of barras; track $index) {
                <i [class.alta]="altura === 100" [style.height.%]="altura" [style.--i]="$index"></i>
              }
            </div>
          </div>
          <span class="insight">Sexta é o dia mais movimentado</span>
          <span class="insight">41 clientes voltaram este mês</span>
        }
      }
    </ng-template>
  `,
})
export class NaPraticaAgendaComponent {
  protected readonly passos = PASSOS_AGENDA;
  protected readonly etapasAgenda = ETAPAS_AGENDA;
  protected readonly barras = [44, 52, 48, 70, 100, 86, 20];
  protected readonly ativo = signal(0);

  private readonly elementosPasso = viewChildren('passo', { read: ElementRef });

  constructor() {
    let observador: IntersectionObserver | undefined;
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      // o passo que cruza a faixa do meio da tela escolhe a cena do palco
      observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (entrada.isIntersecting) {
              this.ativo.set(Number((entrada.target as HTMLElement).dataset['passo']));
            }
          }
        },
        { rootMargin: '-45% 0px -45% 0px' },
      );
      for (const passo of this.elementosPasso()) {
        observador.observe(passo.nativeElement as HTMLElement);
      }
    });
  }

  protected ehConversa(cena: CenaAgenda): boolean {
    return cena === 'conversa' || cena === 'mensagens' || cena === 'vaga';
  }
}
