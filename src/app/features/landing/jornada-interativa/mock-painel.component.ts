import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { RoteiroDemo } from './roteiro-demo';
import { TelefoneDemoComponent } from './telefone-demo.component';

type TelaPainel = 'produto' | 'fechamento' | 'instrucoes';

/** Etapas do cadastro de produto: lista → modal preenchido aos poucos → produto salvo na lista. */
type EtapaProduto = 'lista' | 'tocando' | 'formulario' | 'salvando' | 'salvo';

const PRODUTO = {
  nome: 'Torta artesanal G',
  descricao: 'Serve até 20 pessoas. Massa amanteigada e recheio cremoso, com topo no tema da sua festa.',
  preco: '85,00',
  opcao: 'Sabores',
  valores: 'Brigadeiro, Ninho, Limão',
};
const INSTRUCAO = 'Não fazemos entregas aos domingos.\nFuncionamos de segunda a sábado, das 8h às 18h.';
const CAMPOS_PEDIDO = 'Nome, retirada ou entrega, data';

/**
 * As telas do painel na demonstração da landing, iguais às do app (mesmos textos, cabeçalhos e
 * barra de salvar), com as ações acontecendo sozinhas e os textos sendo digitados aos poucos.
 */
@Component({
  selector: 'app-mock-painel-jornada',
  imports: [IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-painel.component.html',
  styleUrl: './mock-painel.component.css',
})
export class MockPainelJornadaComponent implements OnInit {
  @Input() tela: TelaPainel = 'produto';

  private readonly roteiro = new RoteiroDemo(inject(DestroyRef));

  // cadastro de produto
  protected readonly etapaProduto = signal<EtapaProduto>('lista');
  protected readonly nome = signal('');
  protected readonly categoriaEscolhida = signal(false);
  protected readonly descricao = signal('');
  protected readonly preco = signal('');
  protected readonly aPartirDe = signal(false);
  protected readonly opcao = signal('');
  protected readonly valores = signal('');
  /** O formulário rola sozinho para mostrar o campo que está sendo preenchido. */
  protected readonly rolagem = signal(0);
  protected readonly campoAtivo = signal<'nome' | 'descricao' | 'preco' | 'opcao' | 'valores' | null>(null);

  // instruções e "quando o cliente quiser fechar"
  protected readonly instrucao = signal('');
  protected readonly coletarDados = signal(false);
  protected readonly camposPedido = signal('');
  protected readonly alterado = signal(false);
  protected readonly salvandoAlteracoes = signal(false);
  protected readonly salvo = signal(false);

  ngOnInit(): void {
    if (this.tela === 'produto') {
      this.roteiroProduto();
    } else if (this.tela === 'instrucoes') {
      this.roteiroInstrucoes();
    } else {
      this.roteiroFechamento();
    }
  }

  private roteiroProduto(): void {
    if (this.roteiro.movimentoReduzido) {
      this.etapaProduto.set('salvo');
      return;
    }
    const r = this.roteiro;
    r.em(500, () => this.etapaProduto.set('tocando'));
    r.em(800, () => this.etapaProduto.set('formulario'));

    r.em(1150, () => this.campoAtivo.set('nome'));
    let fim = r.digitar(this.nome, PRODUTO.nome, 1150, 40);
    r.em(fim + 200, () => this.categoriaEscolhida.set(true));

    r.em(fim + 400, () => this.campoAtivo.set('descricao'));
    fim = r.digitar(this.descricao, PRODUTO.descricao, fim + 400, 22);

    r.em(fim + 150, () => {
      this.rolagem.set(130);
      this.campoAtivo.set('preco');
    });
    fim = r.digitar(this.preco, PRODUTO.preco, fim + 350, 70);
    r.em(fim + 150, () => this.aPartirDe.set(true));

    r.em(fim + 350, () => {
      this.rolagem.set(250);
      this.campoAtivo.set('opcao');
    });
    fim = r.digitar(this.opcao, PRODUTO.opcao, fim + 550, 45);
    r.em(fim + 50, () => this.campoAtivo.set('valores'));
    fim = r.digitar(this.valores, PRODUTO.valores, fim + 100, 28);

    r.em(fim + 300, () => {
      this.campoAtivo.set(null);
      this.etapaProduto.set('salvando');
    });
    r.em(fim + 900, () => this.etapaProduto.set('salvo'));
  }

  private roteiroInstrucoes(): void {
    if (this.roteiro.movimentoReduzido) {
      this.instrucao.set(INSTRUCAO);
      this.salvo.set(true);
      return;
    }
    const r = this.roteiro;
    r.em(600, () => this.alterado.set(true));
    const fim = r.digitar(this.instrucao, INSTRUCAO, 600, 42);
    this.salvar(fim + 500);
  }

  private roteiroFechamento(): void {
    if (this.roteiro.movimentoReduzido) {
      this.coletarDados.set(true);
      this.camposPedido.set(CAMPOS_PEDIDO);
      this.salvo.set(true);
      return;
    }
    const r = this.roteiro;
    r.em(1000, () => {
      this.coletarDados.set(true);
      this.alterado.set(true);
    });
    const fim = r.digitar(this.camposPedido, CAMPOS_PEDIDO, 1900, 60);
    this.salvar(fim + 600);
  }

  /** Toca em "Salvar alterações": a barra some e aparece o aviso de salvo, como no painel. */
  private salvar(quando: number): void {
    this.roteiro.em(quando, () => this.salvandoAlteracoes.set(true));
    this.roteiro.em(quando + 600, () => {
      this.salvandoAlteracoes.set(false);
      this.alterado.set(false);
      this.salvo.set(true);
    });
  }
}
