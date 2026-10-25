import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { MODOS_CATALOGO } from '../../../core/constants/opcoes-perfil';
import { urlDaImagem } from '../../../core/imagens/url-imagem';
import { CatalogoConversa, ModoCatalogo, ramoDeServico } from '../../../core/models/perfil.model';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { ToastService } from '../../../core/services/toast.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { OpcaoCardComponent } from '../../../shared/components/opcao-card/opcao-card.component';
import { FormularioConfiguracoes } from '../painel-formulario';

const MAXIMO_IMAGENS = 2;
/** Lojas de produtos podem separar o catálogo por assunto (ex.: salgados e doces), até 3. */
const MAXIMO_CATALOGOS = 3;
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
 * Altera os campos modoCatalogo e catalogos do formulário do painel; os arquivos escolhidos agora ficam em
 * `pendentes` (um grupo por catálogo) e o painel envia ao salvar (assim "Descartar" não deixa arquivo perdido).
 * Lojas de produtos no modo "Quando o cliente perguntar" podem ter até 3 catálogos, cada um com um assunto e o
 * contexto (do que ele fala): o assistente envia o do assunto da conversa. Com um só, a tela é a de sempre.
 */
@Component({
  selector: 'app-catalogo-conversa',
  imports: [RouterLink, IconeComponent, OpcaoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogo-conversa.component.html',
  styleUrls: ['./catalogo-conversa.component.css', './catalogos-por-assunto.css'],
})
export class CatalogoConversaComponent {
  readonly formulario = input.required<FormularioConfiguracoes>();
  /** valores().modoCatalogo do painel (signal, para a tela reagir). */
  readonly modo = input.required<ModoCatalogo>();
  /** valores().catalogos do painel: os catálogos com as referências já salvas. */
  readonly catalogos = input.required<CatalogoConversa[]>();
  /** O painel tentou salvar com algo faltando (arquivo, assunto ou contexto). */
  readonly mostrarErro = input(false);
  readonly pendentes = model<File[][]>([]);

  private readonly toastService = inject(ToastService);
  private readonly produtoService = inject(ProdutoService);
  private readonly perfil = inject(PerfilService).perfil;
  private readonly conteudo = inject(ConteudoRamoService).conteudo;
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  protected readonly rotaProdutos = computed(() => this.rotas().produtos);

  protected readonly modos = MODOS_CATALOGO;
  protected readonly maximoCatalogos = MAXIMO_CATALOGOS;
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
  /** Mais de um catálogo: só lojas de produtos, no modo "Quando o cliente perguntar". */
  protected readonly podeTerVarios = computed(
    () => !ramoDeServico(this.perfil().ramo) && this.modo() === 'AO_PERGUNTAR',
  );

  /** Miniaturas dos arquivos escolhidos agora; liberadas quando saem da lista ou a tela fecha. */
  private readonly previas = new Map<File, string>();

  /** Um cartão por catálogo, com os arquivos salvos e os escolhidos agora. */
  protected readonly cartoes = computed(() =>
    this.catalogos().map((catalogo, indice) => {
      const pendentes = this.pendentes()[indice] ?? [];
      const itens: ItemCatalogo[] = [
        ...catalogo.arquivos.map((referencia) => {
          const pdf = referencia.endsWith('.pdf');
          return {
            chave: referencia,
            pdf,
            url: urlDaImagem(referencia),
            nome: pdf ? 'Catálogo em PDF' : 'Imagem do catálogo',
            detalhe: 'Salvo',
            remover: () => this.removerSalvo(indice, referencia),
          };
        }),
        ...pendentes.map((arquivo, posicao) => {
          const pdf = arquivo.type === TIPO_PDF;
          return {
            chave: `pendente-${posicao}-${arquivo.name}`,
            pdf,
            url: pdf ? null : this.previa(arquivo),
            nome: arquivo.name,
            detalhe: `${tamanhoLegivel(arquivo.size)} · sobe ao salvar`,
            remover: () => this.removerPendente(indice, arquivo),
          };
        }),
      ];
      return {
        indice,
        assunto: catalogo.assunto ?? '',
        contexto: catalogo.contexto ?? '',
        itens,
        // com 1 imagem ainda dá para adicionar a segunda; PDF ou 2 imagens só trocando
        podeAdicionarImagem: itens.length === 1 && !itens[0].pdf,
      };
    }),
  );
  protected readonly varios = computed(() => this.catalogos().length > 1);

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

  /** Mais um catálogo, vazio: o lojista dá o assunto, o contexto e manda os arquivos. */
  protected adicionarCatalogo(): void {
    if (this.catalogos().length >= MAXIMO_CATALOGOS) {
      return;
    }
    this.atualizarCatalogos((lista) => [...lista, { assunto: '', contexto: '', arquivos: [] }]);
    this.pendentes.update((grupos) => ajustar(grupos, this.catalogos().length));
    const novo = this.catalogos().length - 1;
    setTimeout(() => document.getElementById(`catalogo-assunto-${novo}`)?.focus());
  }

  protected removerCatalogo(indice: number): void {
    (this.pendentes()[indice] ?? []).forEach((arquivo) => this.liberarPrevia(arquivo));
    this.atualizarCatalogos((lista) => lista.filter((_, i) => i !== indice));
    this.pendentes.update((grupos) => ajustar(grupos, this.catalogos().length + 1).filter((_, i) => i !== indice));
  }

  protected definirAssunto(indice: number, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.atualizarCatalogos((lista) => lista.map((c, i) => (i === indice ? { ...c, assunto: valor } : c)));
  }

  protected definirContexto(indice: number, evento: Event): void {
    const valor = (evento.target as HTMLTextAreaElement).value;
    this.atualizarCatalogos((lista) => lista.map((c, i) => (i === indice ? { ...c, contexto: valor } : c)));
  }

  /**
   * Com 1 imagem no catálogo, escolher mais 1 imagem adiciona a segunda.
   * Qualquer outra escolha (PDF, 2 imagens, ou já havia PDF/2 imagens) troca o catálogo inteiro.
   */
  protected aoEscolherArquivos(indice: number, evento: Event): void {
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

    const cartao = this.cartoes()[indice];
    const adicionarSegunda = cartao.podeAdicionarImagem && escolhidos.length === 1 && escolhidos[0].type !== TIPO_PDF;
    if (!adicionarSegunda) {
      this.limparCatalogo(indice);
    }
    this.pendentes.update((grupos) => {
      const novos = ajustar(grupos, this.catalogos().length);
      novos[indice] = [...novos[indice], ...escolhidos];
      return novos;
    });
  }

  private removerSalvo(indice: number, referencia: string): void {
    this.atualizarCatalogos((lista) =>
      lista.map((c, i) => (i === indice ? { ...c, arquivos: c.arquivos.filter((atual) => atual !== referencia) } : c)),
    );
  }

  private removerPendente(indice: number, arquivo: File): void {
    this.liberarPrevia(arquivo);
    this.pendentes.update((grupos) =>
      ajustar(grupos, this.catalogos().length).map((grupo, i) => (i === indice ? grupo.filter((a) => a !== arquivo) : grupo)),
    );
  }

  private limparCatalogo(indice: number): void {
    if (this.catalogos()[indice].arquivos.length > 0) {
      this.atualizarCatalogos((lista) => lista.map((c, i) => (i === indice ? { ...c, arquivos: [] } : c)));
    }
    (this.pendentes()[indice] ?? []).forEach((arquivo) => this.liberarPrevia(arquivo));
    this.pendentes.update((grupos) => ajustar(grupos, this.catalogos().length).map((grupo, i) => (i === indice ? [] : grupo)));
  }

  private atualizarCatalogos(mudar: (lista: CatalogoConversa[]) => CatalogoConversa[]): void {
    const controle = this.formulario().controls.catalogos;
    controle.setValue(mudar(controle.value));
    controle.markAsDirty();
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

/** Os grupos de arquivos pendentes, um por catálogo (completa com grupos vazios). */
function ajustar(grupos: File[][], total: number): File[][] {
  return Array.from({ length: Math.max(total, grupos.length) }, (_, i) => [...(grupos[i] ?? [])]);
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
