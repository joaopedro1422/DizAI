import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { MockInstrucoesComponent } from './mock-instrucoes.component';
import { TelefoneDemoComponent } from './telefone-demo.component';

type TelaPainel = 'produto' | 'fechamento' | 'galeria' | 'instrucoes';

@Component({
  selector: 'app-mock-painel-jornada',
  imports: [IconeComponent, MockInstrucoesComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-painel.component.html',
  styleUrl: './mock-painel.component.css',
})
export class MockPainelJornadaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() tela: TelaPainel = 'produto';

  protected readonly descricaoDigitada = signal('');
  protected readonly produtoSalvo = signal(false);
  protected readonly camposPedidoDigitados = signal('');
  protected readonly configuracaoSalva = signal(false);

  ngOnInit(): void {
    if (this.tela !== 'produto' && this.tela !== 'fechamento') {
      return;
    }

    const eProduto = this.tela === 'produto';
    const texto = eProduto
      ? 'Deliciosa torta para até 20 pessoas, nos sabores Brigadeiro, Ninho ou Limão. Topo personalizado com o tema da sua festa por + R$ 5,00'
      : 'Nome, retirada ou entrega, data';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.atualizarTextoDigitado(eProduto, texto);
      this.marcarSalvo(eProduto);
      return;
    }

    let indice = 0;
    let temporizadorSalvamento: number | undefined;
    const digitador = window.setInterval(() => {
      indice += 1;
      this.atualizarTextoDigitado(eProduto, texto.slice(0, indice));
      if (indice >= texto.length) {
        window.clearInterval(digitador);
        temporizadorSalvamento = window.setTimeout(() => this.marcarSalvo(eProduto), 500);
      }
    }, 35);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(digitador);
      if (temporizadorSalvamento !== undefined) {
        window.clearTimeout(temporizadorSalvamento);
      }
    });
  }

  private atualizarTextoDigitado(eProduto: boolean, texto: string): void {
    if (eProduto) {
      this.descricaoDigitada.set(texto);
    } else {
      this.camposPedidoDigitados.set(texto);
    }
  }

  private marcarSalvo(eProduto: boolean): void {
    if (eProduto) {
      this.produtoSalvo.set(true);
    } else {
      this.configuracaoSalva.set(true);
    }
  }
}
