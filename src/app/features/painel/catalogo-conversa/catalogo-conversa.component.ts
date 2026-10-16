import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { MODOS_CATALOGO } from '../../../core/constants/opcoes-perfil';
import { urlDaImagem } from '../../../core/imagens/url-imagem';
import { ModoCatalogo } from '../../../core/models/perfil.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { ToastService } from '../../../core/services/toast.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { OpcaoCardComponent } from '../../../shared/components/opcao-card/opcao-card.component';
import { FormularioConfiguracoes } from '../painel-formulario';

const MAXIMO_IMAGENS = 2;
const TAMANHO_MAXIMO_PDF = 15 * 1024 * 1024;
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;
/** O WhatsApp só envia JPG e PNG como imagem; PDF vai como documento. */
const TIPOS_IMAGEM = ['image/jpeg', 'image/png'];
const TIPO_PDF = 'application/pdf';

/** Um arquivo do catálogo na tela: já salvo (referência) ou escolhido agora (sobe ao salvar). */
interface ItemCatalogo {
  chave: string;
  pdf: boolean;
  /** Endereço para a miniatura ou para abrir o PDF. */
  url: string | null;
  nome: string;
  detalhe: string;
  remover: () => void;
}

/**
 * "Enviar catálogo em imagem ou PDF?" no painel.
 * Altera os campos modoCatalogo e catalogoArquivos do formulário do painel; os arquivos escolhidos agora
 * ficam em `pendentes` e o painel envia ao salvar (assim "Descartar" não deixa arquivo perdido no Storage).
 */
@Component({
  selector: 'app-catalogo-conversa',
  imports: [RouterLink, IconeComponent, OpcaoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogo-conversa.component.html',
  styleUrl: './catalogo-conversa.component.css',
})
export class CatalogoConversaComponent {
  readonly formulario = input.required<FormularioConfiguracoes>();
  /** valores().modoCatalogo do painel (signal, para a tela reagir). */
  readonly modo = input.required<ModoCatalogo>();
  /** valores().catalogoArquivos do painel: referências já salvas. */
  readonly arquivosSalvos = input.required<string[]>();
  /** O painel tentou salvar com o envio ligado e sem arquivo. */
  readonly mostrarErro = input(false);
  readonly pendentes = model<File[]>([]);

  private readonly toastService = inject(ToastService);
  private readonly produtoService = inject(ProdutoService);
  private readonly conteudo = inject(ConteudoRamoService).conteudo;
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  protected readonly rotaProdutos = computed(() => this.rotas().produtos);

  protected readonly modos = MODOS_CATALOGO;
  /**
   * O aviso do cadastro só aparece quando o lojista troca a opção desta seção:
   * ao abrir ou recarregar o painel ele começa fechado, e o X fecha de novo.
   */
  protected readonly avisoFechado = signal(true);
  protected readonly ligado = computed(() => this.modo() !== 'NAO');
  protected readonly tituloItens = computed(() => this.conteudo().tituloItens);
  protected readonly totalProdutos = computed(() => this.produtoService.produtos().length);
  protected readonly resumoProdutos = computed(() =>
    pluralizar(this.totalProdutos(), 'cadastrado', 'cadastrados'),
  );

  /** Miniaturas dos arquivos escolhidos agora; liberadas quando saem da lista ou a tela fecha. */
  private readonly previas = new Map<File, string>();

  protected readonly itens = computed<ItemCatalogo[]>(() => [
    ...this.arquivosSalvos().map((referencia) => {
      const pdf = referencia.endsWith('.pdf');
      return {
        chave: referencia,
        pdf,
        url: urlDaImagem(referencia),
        nome: pdf ? 'Catálogo em PDF' : 'Imagem do catálogo',
        detalhe: 'Salvo',
        remover: () => this.removerSalvo(referencia),
      };
    }),
    ...this.pendentes().map((arquivo, indice) => {
      const pdf = arquivo.type === TIPO_PDF;
      return {
        chave: `pendente-${indice}-${arquivo.name}`,
        pdf,
        url: pdf ? null : this.previa(arquivo),
        nome: arquivo.name,
        detalhe: `${tamanhoLegivel(arquivo.size)} · sobe ao salvar`,
        remover: () => this.removerPendente(arquivo),
      };
    }),
  ]);

  /** Com 1 imagem ainda dá para adicionar a segunda; PDF ou 2 imagens só trocando. */
  protected readonly podeAdicionarImagem = computed(() => {
    const itens = this.itens();
    return itens.length === 1 && !itens[0].pdf;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.previas.forEach((url) => URL.revokeObjectURL(url)));
  }

  protected escolherModo(modo: ModoCatalogo): void {
    if (modo !== this.modo()) {
      this.avisoFechado.set(false);   // trocou a opção: o aviso do cadastro volta a aparecer
    }
    const controle = this.formulario().controls.modoCatalogo;
    controle.setValue(modo);
    controle.markAsDirty();
  }

  protected fecharAviso(): void {
    this.avisoFechado.set(true);
  }

  /**
   * Com 1 imagem no catálogo, escolher mais 1 imagem adiciona a segunda.
   * Qualquer outra escolha (PDF, 2 imagens, ou já havia PDF/2 imagens) troca o catálogo inteiro.
   */
  protected aoEscolherArquivos(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const escolhidos = Array.from(campo.files ?? []);
    campo.value = '';
    if (escolhidos.length === 0) {
      return;
    }
    const erro = validarEscolha(escolhidos);
    if (erro) {
      this.toastService.mostrar(erro);
      return;
    }

    const adicionarSegunda = this.podeAdicionarImagem() && escolhidos.length === 1 && escolhidos[0].type !== TIPO_PDF;
    if (!adicionarSegunda) {
      this.limparTudo();
    }
    this.pendentes.update((atuais) => [...atuais, ...escolhidos]);
  }

  private removerSalvo(referencia: string): void {
    const controle = this.formulario().controls.catalogoArquivos;
    controle.setValue(controle.value.filter((atual) => atual !== referencia));
    controle.markAsDirty();
  }

  private removerPendente(arquivo: File): void {
    this.liberarPrevia(arquivo);
    this.pendentes.update((atuais) => atuais.filter((atual) => atual !== arquivo));
  }

  private limparTudo(): void {
    const controle = this.formulario().controls.catalogoArquivos;
    if (controle.value.length > 0) {
      controle.setValue([]);
      controle.markAsDirty();
    }
    this.pendentes().forEach((arquivo) => this.liberarPrevia(arquivo));
    this.pendentes.set([]);
  }

  private previa(arquivo: File): string {
    let url = this.previas.get(arquivo);
    if (!url) {
      url = URL.createObjectURL(arquivo);
      this.previas.set(arquivo, url);
    }
    return url;
  }

  private liberarPrevia(arquivo: File): void {
    const url = this.previas.get(arquivo);
    if (url) {
      URL.revokeObjectURL(url);
      this.previas.delete(arquivo);
    }
  }
}

/** Mensagem de erro para o lojista, ou null se a escolha é válida. */
function validarEscolha(arquivos: File[]): string | null {
  const pdfs = arquivos.filter((arquivo) => arquivo.type === TIPO_PDF);
  const imagens = arquivos.filter((arquivo) => TIPOS_IMAGEM.includes(arquivo.type));
  if (pdfs.length + imagens.length !== arquivos.length) {
    return 'Envie o catálogo em PDF, JPG ou PNG.';
  }
  if (pdfs.length > 0 && arquivos.length > 1) {
    return 'Escolha 1 PDF ou até 2 imagens, não os dois juntos.';
  }
  if (imagens.length > MAXIMO_IMAGENS) {
    return 'O catálogo pode ter até 2 imagens.';
  }
  if (pdfs.some((arquivo) => arquivo.size > TAMANHO_MAXIMO_PDF)) {
    return 'O PDF pode ter no máximo 15 MB.';
  }
  if (imagens.some((arquivo) => arquivo.size > TAMANHO_MAXIMO_IMAGEM)) {
    return 'Cada imagem pode ter no máximo 5 MB.';
  }
  return null;
}

function tamanhoLegivel(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB` : `${Math.round(bytes / 1024)} KB`;
}
