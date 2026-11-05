import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconeComponent } from '../icone/icone.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-painel-marca',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconeComponent, LogoComponent],
  template: `
    <svg class="marca__balao" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M8 6H22A18 17 0 0 1 22 40H16L8 46Z" />
    </svg>

    <app-logo class="logo--claro" [tamanhoSimbolo]="34" [tamanhoTexto]="25" />

    <div class="marca__meio">
      <div class="marca__textos">
        <h2 class="marca__titulo">{{ titulo() }}</h2>
        <p class="marca__descricao">{{ descricao() }}</p>
      </div>

      <figure class="conversa" aria-label="Exemplo de conversa atendida pelo assistente">
        <div class="conversa__topo">
          <span class="conversa__avatar" aria-hidden="true">B</span>
          <span class="conversa__nome">
            Bella Studio
            <span class="conversa__status">online</span>
          </span>
        </div>
        <div class="conversa__mensagens">
          <p class="bolha bolha--cliente">Oi! Tem horário para unha amanhã à tarde?</p>
          <p class="bolha bolha--loja">
            Temos sim! Amanhã às <strong>14:00</strong> ou <strong>15:30</strong>. Qual fica melhor para você?
            <span class="bolha__hora">14:02 <app-icone nome="checkDuplo" [tamanho]="14" [espessura]="2" /></span>
          </p>
          <p class="bolha bolha--cliente">15:30, por favor 😊</p>
          <p class="bolha bolha--loja">
            Agendado! ✅ Amanhã às 15:30. Até lá!
            <span class="bolha__hora">14:02 <app-icone nome="checkDuplo" [tamanho]="14" [espessura]="2" /></span>
          </p>
        </div>
      </figure>
    </div>

    <ul class="marca__garantias">
      @for (garantia of garantias; track garantia) {
        <li class="marca__garantia">
          <span class="marca__check"><app-icone nome="check" [tamanho]="12" [espessura]="3" /></span>
          {{ garantia }}
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: none;
    }

    @media (min-width: 1024px) {
      :host {
        position: sticky;
        top: 0;
        align-self: start;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 32px;
        height: 100dvh;
        min-height: 640px;
        padding: 40px clamp(40px, 5vw, 72px);
        overflow: hidden;
        background: linear-gradient(160deg, #1E3A72 0%, #19325F 60%, #142849 100%);
        color: #ffffff;
      }
    }

    /* o balão da logo, bem grande e quase invisível, saindo pelo canto */
    .marca__balao {
      position: absolute;
      right: -120px;
      bottom: -90px;
      width: 460px;
      height: 460px;
      fill: rgba(255, 255, 255, 0.04);
      pointer-events: none;
    }

    app-logo,
    .marca__meio,
    .marca__garantias {
      position: relative;
    }

    .marca__meio {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 440px;
    }

    .marca__textos {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .marca__titulo {
      font-size: clamp(30px, 2.6vw, 38px);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.1;
    }

    .marca__descricao {
      font-size: 16px;
      line-height: 1.55;
      color: var(--cor-texto-sobre-escuro);
    }

    /* Conversa de exemplo, com as cores do WhatsApp */
    .conversa {
      overflow: hidden;
      border-radius: 18px;
      background: #EFEAE2;
      box-shadow: 0 24px 48px -16px rgba(5, 12, 28, 0.55);
      color: #111B21;
    }

    .conversa__topo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      background: #ffffff;
      border-bottom: 1px solid #E6E1D8;
    }

    .conversa__avatar {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #F4D9E0;
      color: #8C3150;
      font-size: 13px;
      font-weight: 800;
    }

    .conversa__nome {
      display: flex;
      flex-direction: column;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.25;
    }

    .conversa__status {
      font-size: 12px;
      font-weight: 500;
      color: #667781;
    }

    .conversa__mensagens {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px;
    }

    .bolha {
      max-width: 82%;
      padding: 7px 10px;
      border-radius: 10px;
      font-size: 13.5px;
      line-height: 1.4;
      box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
    }

    .bolha--cliente {
      align-self: flex-start;
      border-top-left-radius: 3px;
      background: #ffffff;
    }

    .bolha--loja {
      align-self: flex-end;
      border-top-right-radius: 3px;
      background: #D9FDD3;
    }

    .bolha__hora {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      float: right;
      margin: 6px 0 -3px 10px;
      font-size: 11px;
      color: #667781;
    }

    .bolha__hora app-icone {
      color: #53BDEB;
    }

    .marca__garantias {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 22px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .marca__garantia {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #E3E8F1;
    }

    .marca__check {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
    }

    /* telas baixas: a conversa encurta para caber sem rolar */
    @media (min-width: 1024px) and (max-height: 760px) {
      .bolha:nth-child(n + 3) {
        display: none;
      }
    }
  `,
})
export class PainelMarcaComponent {
  readonly titulo = input('Seus clientes atendidos na hora, mesmo quando você está ocupado.');
  readonly descricao = input(
    'O seu assistente tira dúvidas, anota pedidos e marca horários no WhatsApp com as informações do seu negócio.',
  );

  protected readonly garantias = ['Pronto em poucos minutos', 'No seu número de sempre', 'Você no controle de tudo'];
}
