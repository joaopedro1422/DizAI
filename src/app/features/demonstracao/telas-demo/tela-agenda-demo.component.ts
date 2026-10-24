import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal } from '@angular/core';

import { FaixaDiasComponent, ItemFaixaDia } from '../../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { formatarReal } from '../../pedidos/textos-pedido';
import { AgendaDemo } from '../conversas-demonstracao';

/** A tela rola até onde o horário novo vai entrar (se ele ficar abaixo da dobra)... */
const ROLAGEM_MS = 700;
/** ...e ele entra na lista logo depois (como chega no painel aberto). */
const ENTRADA_DO_NOVO_MS = 1500;

/**
 * A Minha Agenda do painel no celular, no tamanho real, no dia do horário que o assistente acabou de marcar.
 * Mesmo HTML e as mesmas classes da tela real (agenda-page na visualização resumida; o CSS é a cópia das regras
 * de celular). A faixa de dias é o próprio FaixaDiasComponent da tela real.
 */
@Component({
  selector: 'app-tela-agenda-demo',
  imports: [IconeComponent, FaixaDiasComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tela-agenda-demo.component.html',
  styleUrls: ['./tela-agenda-demo.component.css', './telas-demo.css'],
  // a tela rola por dentro do celular, como a página de verdade (sem barra de rolagem)
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      scrollbar-width: none;
    }
  `,
})
export class TelaAgendaDemoComponent {
  readonly agenda = input.required<AgendaDemo>();

  protected readonly novoChegou = signal(false);

  protected readonly horarios = computed(() =>
    this.agenda().horarios.filter((horario) => this.novoChegou() || !horario.novo),
  );
  protected readonly resumo = computed(() => {
    const total = this.horarios().length;
    return total === 1 ? '1 cliente' : `${total} clientes`;
  });
  /** Antes do horário novo entrar, o dia escolhido mostra um a menos na faixa. */
  protected readonly dias = computed<ItemFaixaDia[]>(() =>
    this.agenda().dias.map((dia) =>
      dia.data === this.agenda().selecionado ? { ...dia, detalhe: String(this.horarios().length) } : dia,
    ),
  );

  constructor() {
    const tela = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const temporizadores = [
      setTimeout(() => this.rolarAteONovo(tela), ROLAGEM_MS),
      setTimeout(() => this.novoChegou.set(true), ENTRADA_DO_NOVO_MS),
    ];
    inject(DestroyRef).onDestroy(() => temporizadores.forEach(clearTimeout));
  }

  /** Deixa à vista o card que fica logo antes do horário novo (o novo entra embaixo dele). */
  private rolarAteONovo(tela: HTMLElement): void {
    const indiceNovo = this.agenda().horarios.findIndex((horario) => horario.novo);
    const anterior = indiceNovo > 0 ? tela.querySelectorAll<HTMLElement>('.horario')[indiceNovo - 1] : null;
    if (anterior) {
      tela.scrollTo({ top: anterior.offsetTop - 140, behavior: 'smooth' });
    }
  }

  protected real(valor: number): string {
    return formatarReal(valor);
  }
}
