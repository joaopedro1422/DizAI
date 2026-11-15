import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ConteudoLandingNova, ONDAS_AUDIO } from './conteudo-landing-nova';

/**
 * "Um funcionário, sem férias": as habilidades do assistente de IA em 6 cartões e, embaixo, o gancho para os
 * Recursos: "E se eu não quiser usar o assistente?" (todos os recursos funcionam sem ele).
 */
@Component({
  selector: 'app-solucao-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa solucao">
      <div class="miolo">
        <div class="cabeca">
          <h2 class="titulo"><span class="grifo">Um funcionário, sem férias</span></h2>
          <p class="apoio">Treinado para atender em tom humano e otimizar a qualidade do seu atendimento seguindo as suas regras.</p>
        </div>

        <div class="grade-dia grade-dia--tres">
          @for (item of conteudo().dia; track item.titulo; let i = $index) {
            <article class="hora" [class.hora--largo]="item.largo" [style.--i]="i">
              <span class="hora__momento">{{ item.momento }}</span>
              <h3>{{ item.titulo }}</h3>
              <p>{{ item.texto }}</p>
              <div class="hora__visual">
                @switch (item.visual) {
                  @case ('conversa') {
                    @if (item.conversa; as conversa) {
                      <span class="msg msg--cliente">{{ conversa[0] }}<time>02:14</time></span>
                      <span class="msg msg--loja">{{ conversa[1] }}<time>02:14</time></span>
                    }
                  }
                  @case ('audio') {
                    <div class="onda">
                      <b></b>
                      <span>
                        @for (altura of ondas; track $index) {
                          <i [style.height.%]="altura" [style.--i]="$index"></i>
                        }
                      </span>
                      <small class="mono">0:40</small>
                    </div>
                  }
                  @case ('arquivo') {
                    <span class="msg msg--arquivo"><span class="pdf">PDF</span><span><b>{{ item.detalhe }}</b><small>enviado agora</small></span></span>
                  }
                  @case ('chama') {
                    <div class="push"><span class="push__icone"></span><span><b>Um cliente quer falar com você</b><small>{{ item.detalhe }}</small></span></div>
                  }
                  @case ('chave') {
                    <div class="chave"><span>Assistente nesta conversa</span><i></i></div>
                  }
                  @case ('jeito') {
                    <div class="chips"><span>Saudação</span><span>Regras da loja</span><span>Pagamento</span></div>
                  }
                  @case ('lotada') {
                    <!-- a tela "Restringir agenda" do painel, com o período lotado, e a conversa curta -->
                    <div class="lotada">
                      <div class="agenda-lotada" aria-hidden="true">
                        <div class="agenda-lotada__topo">
                          <b>Novembro de 2026</b>
                          <span>Restringir agenda</span>
                        </div>
                        <div class="agenda-lotada__semana">
                          @for (letra of semana; track $index) {
                            <span>{{ letra }}</span>
                          }
                        </div>
                        <div class="agenda-lotada__dias">
                          @for (dia of novembro; track dia) {
                            <i [class.lotado]="dia >= 16 && dia <= 23" [class.hoje]="dia === 15" [class.passado]="dia < 15">{{ dia }}</i>
                          }
                        </div>
                        <div class="agenda-lotada__periodo">
                          <span class="agenda-lotada__icone"></span>
                          <span><b>16/11 a 23/11</b><small>8 dias sem novos pedidos</small></span>
                        </div>
                      </div>
                      @if (item.conversa; as conversa) {
                        <div class="conversa-lotada">
                          <span class="msg msg--cliente">{{ conversa[0] }}<time>10:42</time></span>
                          <span class="msg msg--loja">{{ conversa[1] }}<time>10:42</time></span>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            </article>
          }
        </div>

        <div class="sem-assistente">
          <h3>E se eu não quiser usar o assistente?</h3>
          <p>{{ conteudo().semAssistente }}</p>
        </div>
      </div>
    </section>
  `,
})
export class SolucaoLandingComponent {
  readonly conteudo = input.required<ConteudoLandingNova>();

  protected readonly ondas = ONDAS_AUDIO;
  /** O mock da "Restringir agenda": novembro de 2026 começa num domingo. */
  protected readonly semana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  protected readonly novembro = Array.from({ length: 30 }, (_, i) => i + 1);
}
