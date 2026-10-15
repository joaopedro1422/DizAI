import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SecaoConfiguracaoComponent } from '../../../shared/components/secao-configuracao/secao-configuracao.component';
import { TelefoneDemoComponent } from './telefone-demo.component';

@Component({
  selector: 'app-mock-instrucoes',
  imports: [IconeComponent, SecaoConfiguracaoComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-instrucoes.component.html',
  styleUrl: './mock-instrucoes.component.css',
})
export class MockInstrucoesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly instrucaoDigitada = signal('');
  protected readonly instrucoesSalvas = signal(false);

  ngOnInit(): void {
    const instrucao = 'Não fazemos entregas aos domingos. \n Funcionamos de segunda a sábado das 8h às 18h';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.instrucaoDigitada.set(instrucao);
      this.instrucoesSalvas.set(true);
      return;
    }

    let indice = 0;
    let temporizadorSalvamento: number | undefined;
    const digitador = window.setInterval(() => {
      indice += 1;
      this.instrucaoDigitada.set(instrucao.slice(0, indice));
      if (indice >= instrucao.length) {
        window.clearInterval(digitador);
        temporizadorSalvamento = window.setTimeout(() => this.instrucoesSalvas.set(true), 500);
      }
    }, 55);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(digitador);
      if (temporizadorSalvamento !== undefined) {
        window.clearTimeout(temporizadorSalvamento);
      }
    });
  }
}
