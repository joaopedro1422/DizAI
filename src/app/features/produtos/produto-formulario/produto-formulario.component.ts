import { Component, OnInit, computed, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ramoDeServico, ramoUsaAgenda } from '../../../core/models/perfil.model';
import { NovoProduto, Produto } from '../../../core/models/produto.model';
import { PerfilService } from '../../../core/services/perfil.service';
import { formatarDuracao } from '../../../core/utils/datas-agenda';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { separarPorVirgula } from '../../../core/utils/texto.utils';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Valor especial do chip "Nova categoria". */
const NOVA_CATEGORIA = '__nova_categoria__';

/** Aceita "70", "70,5" ou "70.50". */
const PADRAO_PRECO = /^\d{1,7}([.,]\d{1,2})?$/;

/** Atalhos de duração (minutos) mostrados como chips; outro valor vai no campo. */
const DURACOES_COMUNS = [30, 45, 60, 90, 120];

type GrupoAtributo = FormGroup<{ nome: FormControl<string>; opcoes: FormControl<string> }>;

/** Formulário do modal "Novo produto". */
@Component({
  selector: 'app-produto-formulario',
  imports: [ReactiveFormsModule, IconeComponent, CarregandoComponent],
  templateUrl: './produto-formulario.component.html',
  styleUrl: './produto-formulario.component.css',
})
export class ProdutoFormularioComponent implements OnInit {
  readonly categoriasExistentes = input<string[]>([]);
  readonly produto = input<Produto | null>(null);
  /** A tela avisa enquanto o produto está sendo salvo. */
  readonly salvando = input(false);
  readonly salvo = output<NovoProduto>();

  private readonly fb = inject(FormBuilder);

  /** Placeholders e textos do ramo da loja. */
  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  protected readonly valorNovaCategoria = NOVA_CATEGORIA;

  private readonly perfil = inject(PerfilService).perfil;
  private readonly ramo = computed(() => this.perfil().ramo);
  /** Serviços mostram a duração; nos ramos com agenda ela é obrigatória (a agenda conta os horários por ela). */
  protected readonly pedeDuracao = computed(() => ramoDeServico(this.ramo()));
  protected readonly duracaoObrigatoria = computed(() => ramoUsaAgenda(this.ramo()));
  protected readonly duracoesComuns = DURACOES_COMUNS.map((minutos) => ({ minutos, rotulo: formatarDuracao(minutos) }));

  protected readonly formulario = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    categoria: ['', Validators.required],
    novaCategoria: ['', Validators.maxLength(40)],
    descricao: ['', Validators.maxLength(500)],
    preco: ['', Validators.pattern(PADRAO_PRECO)],
    precoAPartirDe: [false],
    duracao: ['', [Validators.pattern(/^\d{1,3}$/), Validators.min(5), Validators.max(720)]],
    atributos: this.fb.array<GrupoAtributo>([]),
  });

  protected get atributos(): FormArray<GrupoAtributo> {
    return this.formulario.controls.atributos;
  }

  ngOnInit(): void {
    if (this.duracaoObrigatoria()) {
      this.formulario.controls.duracao.addValidators(Validators.required);
    }
    const produto = this.produto();
    if (produto) {
      this.formulario.patchValue({
        duracao: produto.duracaoMinutos ? String(produto.duracaoMinutos) : '',
        nome: produto.nome,
        categoria: produto.categoria,
        descricao: produto.descricao ?? '',
        preco: produto.preco === null ? '' : String(produto.preco),
        precoAPartirDe: produto.precoAPartirDe,
      });
      produto.atributos.forEach((atributo) => {
        this.atributos.push(
          this.fb.nonNullable.group({
            nome: [atributo.nome, Validators.maxLength(40)],
            opcoes: [atributo.opcoes.join(', '), Validators.maxLength(300)],
          }),
        );
      });
      return;
    }

    const primeiraCategoria = this.categoriasExistentes()[0] ?? NOVA_CATEGORIA;
    this.formulario.controls.categoria.setValue(primeiraCategoria);
  }

  protected escolherCategoria(categoria: string): void {
    this.formulario.controls.categoria.setValue(categoria);
  }

  protected alternarPrecoAPartirDe(): void {
    const controle = this.formulario.controls.precoAPartirDe;
    controle.setValue(!controle.value);
  }

  protected escolherDuracao(minutos: number): void {
    const controle = this.formulario.controls.duracao;
    controle.setValue(String(minutos));
    controle.markAsTouched();
  }

  /** "1h30" ao lado do campo, para o lojista conferir o que digitou em minutos. */
  protected duracaoLegivel(): string {
    const minutos = Number(this.formulario.controls.duracao.value);
    return minutos >= 5 && minutos <= 720 ? formatarDuracao(minutos) : '';
  }

  protected adicionarAtributo(): void {
    this.atributos.push(
      this.fb.nonNullable.group({
        nome: ['', Validators.maxLength(40)],
        opcoes: ['', Validators.maxLength(300)],
      }),
    );
  }

  protected removerAtributo(indice: number): void {
    this.atributos.removeAt(indice);
  }

  protected ehNovaCategoria(): boolean {
    return this.formulario.controls.categoria.value === NOVA_CATEGORIA;
  }

  protected temErro(campo: 'nome' | 'preco' | 'novaCategoria' | 'duracao'): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected salvar(): void {
    if (this.salvando()) {
      return;
    }
    this.exigirNomeDaNovaCategoria();
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvo.emit(this.montarProduto());
  }

  private exigirNomeDaNovaCategoria(): void {
    const controle = this.formulario.controls.novaCategoria;
    controle.setValidators(this.ehNovaCategoria() ? [Validators.required, Validators.maxLength(40)] : Validators.maxLength(40));
    controle.updateValueAndValidity();
  }

  private montarProduto(): NovoProduto {
    const valores = this.formulario.getRawValue();
    const categoria = this.ehNovaCategoria() ? valores.novaCategoria.trim() : valores.categoria;
    const preco = valores.preco.trim();
    const duracao = valores.duracao.trim();

    return {
      nome: valores.nome.trim(),
      categoria,
      descricao: valores.descricao.trim(),
      preco: preco ? Number(preco.replace(',', '.')) : null,
      precoAPartirDe: valores.precoAPartirDe,
      duracaoMinutos: this.pedeDuracao() && duracao ? Number(duracao) : null,
      atributos: valores.atributos
        .map((atributo) => ({ nome: atributo.nome.trim(), opcoes: separarPorVirgula(atributo.opcoes) }))
        .filter((atributo) => atributo.nome && atributo.opcoes.length > 0),
    };
  }
}
