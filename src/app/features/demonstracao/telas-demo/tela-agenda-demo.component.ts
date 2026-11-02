import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, signal } from '@angular/core';

import { FaixaDiasComponent, ItemFaixaDia } from '../../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { minutosDoDia } from '../../../core/utils/datas-agenda';
import { PIXELS_POR_MINUTO } from '../../agenda/linha-do-tempo';
import { AgendaDemo } from '../conversas-demonstracao';
import { LinhaAgendaDemoComponent } from './linha-agenda-demo.component';

/** A tela rola até onde o horário novo vai entrar na linha do tempo (se ele ficar abaixo da dobra)... */
const ROLAGEM_MS = 700;
/** ...e ele entra na lista logo depois (como chega no painel aberto). */
const ENTRADA_DO_NOVO_MS = 1500;

/**
 * A Minha Agenda do painel no celular, no tamanho real, no dia do horário que o assistente acabou de marcar.
 * Mesmo HTML e as mesmas classes da tela real (agenda-page na visualização completa, a linha do tempo do
 * `LinhaAgendaDemoComponent`; o CSS é a cópia das regras de celular). A faixa de dias é o próprio
 * FaixaDiasComponent da tela real.
 */
@Component({
  selector: 'app-tela-agenda-demo',
  imports: [IconeComponent, FaixaDiasComponent, LinhaAgendaDemoComponent],
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

  /** Deixa à vista o trecho da linha do tempo em que o horário novo vai entrar (com um pouco do que vem antes). */
  private rolarAteONovo(tela: HTMLElement): void {
    const novo = this.agenda().horarios.find((horario) => horario.novo);
    const linha = tela.querySelector<HTMLElement>('.linha');
    // a primeira marca da linha é a hora em que a grade começa
    const primeiraHora = linha?.querySelector('.linha__hora')?.textContent?.trim();
    if (!novo || !linha || !primeiraHora) return;
    const topoDoNovo = (minutosDoDia(novo.inicio) - minutosDoDia(primeiraHora)) * PIXELS_POR_MINUTO;
    const topoDaLinha = linha.getBoundingClientRect().top - tela.getBoundingClientRect().top + tela.scrollTop;
    tela.scrollTo({ top: Math.max(0, topoDaLinha + topoDoNovo - 170), behavior: 'smooth' });
  }

}
