import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { CelularMockComponent } from '../celular-mock.component';
import { FOTOS } from './conteudo-vendas';

/**
 * A vitrine pública da Pedacinho do Céu no layout novo (o mesmo de /l/{slug}): capa, o cartão com logo, nome,
 * selos ("Aberto agora", avaliações) e "Atendimento 24 horas", as categorias, as fotos do tópico, as avaliações e
 * as Informações. A tela rola sozinha devagar (topo → avaliações → informações) e para com o mouse em cima.
 * Ao mudar a vitrine de verdade (vitrine-publica + cartao-loja-vitrine.css), atualize esta cópia.
 */
@Component({
  selector: 'app-vitrine-mock',
  imports: [CelularMockComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-celular-mock style="--celular-largura: 330px; --celular-altura: 640px">
      <div class="vt" aria-label="Exemplo de vitrine pública da Pedacinho do Céu">
        <div class="vt__rolagem">
          <div class="vt__capa" [style.background-image]="'url(' + fotos.capaPedacinho + ')'"></div>
          <div class="vt__cartao">
            <img class="vt__logo" [src]="fotos.logoPedacinho" alt="" />
            <b class="vt__nome">Pedacinho do Céu</b>
            <small class="vt__desc">Doces e tortas personalizadas</small>
            <span class="vt__selos">
              <span class="vt__selo vt__selo--aberta">Aberto agora · fecha às 19h</span>
              <span class="vt__selo"><i>★</i> 4,9 · 32 avaliações</span>
            </span>
            <span class="vt__atendimento"><span class="vt__digitando"><i></i><i></i><i></i></span>Atendimento 24 horas</span>
          </div>

          <div class="vt__menu">
            <span class="vt__chip vt__chip--ativa">Frutas vermelhas</span>
            <span class="vt__chip">Chocolate</span>
            <span class="vt__chip">Red velvet</span>
          </div>

          <div class="vt__topico"><b>Frutas vermelhas</b><small>8 fotos</small></div>
          <div class="vt__fotos">
            @for (foto of fotos.bolos; track foto) {
              <img [src]="foto" alt="" loading="lazy" />
            }
          </div>

          <div class="vt__topico"><b>O que dizem</b></div>
          <div class="vt__nota">
            <strong>4,9</strong>
            <span><i>★★★★★</i><small>32 avaliações</small></span>
          </div>
          <div class="vt__depoimentos">
            <span class="vt__depoimento">
              <i>★★★★★</i>
              “O bolo ficou lindo e delicioso. Todo mundo da festa amou!”
              <small><b>A</b>Ana Souza</small>
            </span>
            <span class="vt__depoimento">
              <i>★★★★★</i>
              “Atendimento rápido e entregaram certinho no horário.”
              <small><b>C</b>Carlos Lima</small>
            </span>
          </div>

          <div class="vt__topico"><b>Informações</b></div>
          <div class="vt__infos">
            <span class="vt__info">
              <span class="vt__info-icone"><app-icone nome="relogio" [tamanho]="15" /></span>
              <span><b>Horário de funcionamento</b><span class="vt__semana"><em>Segunda a sexta</em><em>9h às 19h</em><em class="hoje">Sábado</em><em class="hoje">9h às 14h</em><em>Domingo</em><em>Fechado</em></span></span>
            </span>
            <span class="vt__info">
              <span class="vt__info-icone"><app-icone nome="cartao" [tamanho]="15" /></span>
              <span><b>Formas de pagamento</b>Pix, Cartão de crédito e Dinheiro</span>
            </span>
            <span class="vt__info">
              <span class="vt__info-icone"><app-icone nome="caixa" [tamanho]="15" /></span>
              <span><b>Entrega e retirada</b>Entrega e Retirada no local · Taxa de entrega: R$ 8</span>
            </span>
          </div>
          <span class="vt__credito">Criado com DizAI</span>
        </div>
        <span class="vt__whats"><app-icone nome="conversa" [tamanho]="15" />Falar pelo WhatsApp</span>
      </div>
    </app-celular-mock>
  `,
})
export class VitrineMockComponent {
  protected readonly fotos = FOTOS;
}
