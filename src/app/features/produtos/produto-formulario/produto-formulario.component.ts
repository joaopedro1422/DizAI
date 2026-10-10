import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NovoProduto } from '../../../core/models/produto.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { separarPorVirgula } from '../../../core/utils/texto.utils';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Valor especial do chip "Nova categoria". */
const NOVA_CATEGORIA = '__nova_categoria__';

/** Aceita "70", "70,5" ou "70.50". */
const PADRAO_PRECO = /^\d{1,7}([.,]\d{1,2})?$/;

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
  /** A tela avisa enquanto o produto está sendo salvo. */
  readonly salvando = input(false);
  readonly salvo = output<NovoProduto>();

  private readonly fb = inject(FormBuilder);

  /** Placeholders e textos do ramo da loja. */
  protected readonly conteudo = inject(ConteudoRamoService).conteudo;

  protected readonly valorNovaCategoria = NOVA_CATEGORIA;

  protected readonly formulario = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    categoria: ['', Validators.required],
    novaCategoria: ['', Validators.maxLength(40)],
    descricao: ['', Validators.maxLength(500)],
    preco: ['', Validators.pattern(PADRAO_PRECO)],
    precoAPartirDe: [false],
    atributos: this.fb.array<GrupoAtributo>([]),
  });

  protected get atributos(): FormArray<GrupoAtributo> {
    return this.formulario.controls.atributos;
  }

  ngOnInit(): void {
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

  protected temErro(campo: 'nome' | 'preco' | 'novaCategoria'): boolean {
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

    return {
      nome: valores.nome.trim(),
      categoria,
      descricao: valores.descricao.trim(),
      preco: preco ? Number(preco.replace(',', '.')) : null,
      precoAPartirDe: valores.precoAPartirDe,
      atributos: valores.atributos
        .map((atributo) => ({ nome: atributo.nome.trim(), opcoes: separarPorVirgula(atributo.opcoes) }))
        .filter((atributo) => atributo.nome && atributo.opcoes.length > 0),
    };
  }
}
