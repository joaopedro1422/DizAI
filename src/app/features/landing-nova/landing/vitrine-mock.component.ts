import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import type { TipoLanding } from '../../landing/conteudo-landing';
import { CelularMockComponent } from '../celular-mock.component';
import { semMovimento } from '../movimento';
import { LojaMock, VITRINES_MOCK } from './vitrines-mock';

/** O tempo de um ciclo do celular: a rolagem de produtos (18 s) e o ciclo Vitrine → Agendar dos serviços (16 s). */
const CICLO_MS: Record<TipoLanding, number> = { produtos: 18000, servicos: 16000 };

/**
 * A vitrine pública no layout novo (o mesmo de /l/{slug}), com 2 lojas por tipo que se alternam a cada ciclo
 * (botões embaixo do celular; o mouse em cima pausa). Produtos: capa, cartão com selos e "Atendimento 24 horas",
 * categorias, fotos, avaliações, Informações e o mapa do Como chegar, rolando sozinha. Serviços: o cartão, as abas e a troca sozinha de
 * "Vitrine" para "Agendar horário" (serviço, dia e horário escolhidos e o "Enviar pelo WhatsApp"). Tudo em CSS
 * (landing-vitrine.css e landing-agenda.css); a troca de loja recria a tela, e as animações começam de novo.
 * Ao mudar a vitrine de verdade (vitrine-publica + cartao-loja-vitrine.css), atualize esta cópia.
 */
@Component({
  selector: 'app-vitrine-mock',
  imports: [NgTemplateOutlet, CelularMockComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vt-palco" (mouseenter)="pausado = true" (mouseleave)="pausado = false">
      <app-celular-mock style="--celular-largura: 330px; --celular-altura: 640px">
        @for (loja of [loja()]; track loja.chave) {
          <div
            class="vt"
            [class.vt--agenda]="!!loja.agenda"
            [style.--vt-destaque]="loja.cores.destaque"
            [style.--vt-fundo]="loja.cores.fundo"
            [style.--vt-borda]="loja.cores.borda"
            [style.--vt-suave]="loja.cores.suave"
            [style.--vt-selo]="loja.cores.selo"
            [style.--vt-fonte]="loja.fonte"
            [attr.aria-label]="'Exemplo de vitrine pública: ' + loja.nome"
          >
            <ng-template #cartao>
              @if (loja.capa) {
                <div class="vt__capa" [style.background-image]="'url(' + loja.capa + ')'"></div>
              } @else {
                <div class="vt__capa vt__capa--degrade"></div>
              }
              <div class="vt__cartao">
                @if (loja.logo) {
                  <img class="vt__logo" [src]="loja.logo" alt="" />
                } @else {
                  <span class="vt__logo vt__logo--inicial">{{ loja.nome[0] }}</span>
                }
                <b class="vt__nome">{{ loja.nome }}</b>
                <small class="vt__desc">{{ loja.descricao }}</small>
                <span class="vt__selos">
                  <span class="vt__selo vt__selo--aberta">{{ loja.aberto }}</span>
                  <span class="vt__selo"><i>★</i> {{ loja.nota }} · {{ loja.avaliacoes }} avaliações</span>
                </span>
                <span class="vt__atendimento"><span class="vt__digitando"><i></i><i></i><i></i></span>Atendimento 24 horas</span>
              </div>
            </ng-template>

            <ng-template #fotos>
              <div class="vt__fotos">
                @for (foto of loja.fotos; track $index) {
                  <img [src]="foto.src" [style.object-position]="foto.posicao ?? 'center'" alt="" loading="lazy" />
                }
              </div>
            </ng-template>

            @if (loja.agenda; as agenda) {
              <ng-container *ngTemplateOutlet="cartao" />
              <div class="vt__abas">
                <span class="vt__aba vt__aba--vitrine"><app-icone nome="imagem" [tamanho]="13" />Vitrine</span>
                <span class="vt__aba vt__aba--agenda"><app-icone nome="calendario" [tamanho]="13" />Agendar horário</span>
              </div>
              <div class="vt__paineis">
                <div class="vt__painel vt__painel--vitrine">
                  <div class="vt__topico"><b>{{ loja.topico.nome }}</b><small>{{ loja.topico.fotos }} fotos</small></div>
                  <ng-container *ngTemplateOutlet="fotos" />
                </div>
                <div class="vt__painel vt__painel--agenda">
                  <small class="vt__passo">1. Serviço</small>
                  @for (servico of agenda.servicos; track servico[0]; let s = $index) {
                    <span class="vt__escolha" [class.vt__escolha--1]="s === 0"><b>{{ servico[0] }}</b><em>{{ servico[1] }}</em></span>
                  }
                  <small class="vt__passo">2. Dia</small>
                  <span class="vt__dias">
                    @for (dia of agenda.dias; track dia[1]; let d = $index) {
                      <span class="vt__dia" [class.vt__escolha--2]="d === 1"><em>{{ dia[0] }}</em>{{ dia[1] }}</span>
                    }
                  </span>
                  <small class="vt__passo">3. Horário</small>
                  <span class="vt__horas">
                    @for (hora of agenda.horas; track hora; let h = $index) {
                      <span [class.vt__escolha--3]="h === 2">{{ hora }}</span>
                    }
                  </span>
                </div>
              </div>
              <span class="vt__whats vt__whats--vitrine"><app-icone nome="conversa" [tamanho]="15" />Falar pelo WhatsApp</span>
              <span class="vt__whats vt__whats--enviar"><app-icone nome="conversa" [tamanho]="15" />Enviar pelo WhatsApp</span>
            } @else {
              <div class="vt__rolagem">
                <ng-container *ngTemplateOutlet="cartao" />
                <div class="vt__menu">
                  @for (categoria of loja.categorias; track categoria; let k = $index) {
                    <span class="vt__chip" [class.vt__chip--ativa]="k === 0">{{ categoria }}</span>
                  }
                </div>
                <div class="vt__topico"><b>{{ loja.topico.nome }}</b><small>{{ loja.topico.fotos }} fotos</small></div>
                <ng-container *ngTemplateOutlet="fotos" />

                <div class="vt__topico"><b>O que dizem</b></div>
                <div class="vt__nota">
                  <strong>{{ loja.nota }}</strong>
                  <span><i>★★★★★</i><small>{{ loja.avaliacoes }} avaliações</small></span>
                </div>
                <div class="vt__depoimentos">
                  @for (depoimento of loja.depoimentos; track depoimento.nome) {
                    <span class="vt__depoimento">
                      <i>★★★★★</i>
                      “{{ depoimento.texto }}”
                      <small><b>{{ depoimento.nome[0] }}</b>{{ depoimento.nome }}</small>
                    </span>
                  }
                </div>

                <div class="vt__topico"><b>Informações</b></div>
                <div class="vt__infos">
                  <span class="vt__info">
                    <span class="vt__info-icone"><app-icone nome="relogio" [tamanho]="15" /></span>
                    <span>
                      <b>Horário de funcionamento</b>
                      <span class="vt__semana">
                        @for (linha of loja.semana; track linha[0]; let l = $index) {
                          <em [class.hoje]="l === loja.hoje">{{ linha[0] }}</em><em [class.hoje]="l === loja.hoje">{{ linha[1] }}</em>
                        }
                      </span>
                    </span>
                  </span>
                  <span class="vt__info">
                    <span class="vt__info-icone"><app-icone nome="cartao" [tamanho]="15" /></span>
                    <span><b>Formas de pagamento</b>{{ loja.pagamento }}</span>
                  </span>
                  <span class="vt__info">
                    <span class="vt__info-icone"><app-icone nome="caixa" [tamanho]="15" /></span>
                    <span><b>Entrega e retirada</b>{{ loja.entrega }}</span>
                  </span>
                </div>
                @if (loja.endereco; as endereco) {
                  <div class="vt__topico"><b>Como chegar</b></div>
                  <div class="vt__mapa">
                    <div class="vt__mapa-desenho"><i></i></div>
                    <span class="vt__mapa-rodape">
                      <span><b>{{ endereco.rua }}</b>{{ endereco.bairro }}</span>
                      <span class="vt__rota">Traçar rota</span>
                    </span>
                  </div>
                }
                <span class="vt__credito">Criado com DizAI</span>
              </div>
              <span class="vt__whats"><app-icone nome="conversa" [tamanho]="15" />Falar pelo WhatsApp</span>
            }
          </div>
        }
      </app-celular-mock>

      <div class="vt-lojas" role="group" aria-label="Exemplos de vitrine">
        @for (opcao of lojas(); track opcao.chave; let i = $index) {
          <button type="button" [attr.aria-pressed]="i === indice()" (click)="escolher(i)">{{ opcao.nome }}</button>
        }
      </div>
    </div>
  `,
})
export class VitrineMockComponent {
  readonly variante = input<TipoLanding>('produtos');

  protected readonly lojas = computed(() => VITRINES_MOCK[this.variante()]);
  protected readonly indice = signal(0);
  protected readonly loja = computed<LojaMock>(() => this.lojas()[this.indice()] ?? this.lojas()[0]);
  protected pausado = false;

  /** Quantos ciclos faltam para a próxima troca (um toque faz a escolhida ficar um ciclo a mais). */
  private ciclosAteTrocar = 1;

  constructor() {
    let relogio: ReturnType<typeof setInterval> | undefined;
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));
    afterNextRender(() => {
      if (semMovimento()) return;
      relogio = setInterval(() => {
        if (this.pausado || document.hidden) return;
        if (--this.ciclosAteTrocar > 0) return;
        this.ciclosAteTrocar = 1;
        this.indice.update((i) => (i + 1) % this.lojas().length);
      }, CICLO_MS[this.variante()]);
    });
  }

  protected escolher(indice: number): void {
    this.indice.set(indice);
    this.ciclosAteTrocar = 2;
  }
}
