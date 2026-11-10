import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A moldura de celular de todos os mocks da marca nova (hero, mensagens sem resposta, prova, vitrine): a mesma
 * borda azul-noite, o mesmo raio e a câmera. `cortado` = sem a parte de baixo (o celular "sai" da faixa do hero).
 * O tamanho vem de --celular-largura e --celular-altura (marca-base.css).
 */
@Component({
  selector: 'app-celular-mock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="celular__tela">
      <span class="celular__camera" aria-hidden="true"></span>
      <ng-content />
    </div>
  `,
  host: { class: 'celular', '[class.celular--cortado]': 'cortado()' },
})
export class CelularMockComponent {
  readonly cortado = input(false);
}
