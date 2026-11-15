import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';

import { mensagemDoErro } from '../../../../core/api/erro-api';
import { FORMAS_PAGAMENTO } from '../../../../core/constants/opcoes-perfil';
import { SegmentoNegocio } from '../../../../core/constants/segmentos';
import { DiaSemana, PeriodoAtendimento } from '../../../../core/models/agenda.model';
import {
  ConfiguracoesAtendimento,
  DadosLoja,
  FormaPagamento,
  FormaRecebimento,
  Perfil,
  ramoDeServico,
  ramoUsaAgenda,
} from '../../../../core/models/perfil.model';
import { AtributoProduto, Produto } from '../../../../core/models/produto.model';
import { AgendaService } from '../../../../core/services/agenda.service';
import { ArmazenamentoFotosService } from '../../../../core/services/armazenamento-fotos.service';
import { ConteudoRamoService } from '../../../../core/services/conteudo-ramo.service';
import { PerfilService } from '../../../../core/services/perfil.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { ToastService } from '../../../../core/services/toast.service';
import { alternarItem } from '../../../../core/utils/colecao.utils';
import { DIAS_SEMANA, formatarDuracao } from '../../../../core/utils/datas-agenda';
import { HorarioFuncionamentoComponent } from '../../../atendimento/horario-funcionamento/horario-funcionamento.component';
import { SemanaAgendaComponent } from '../../../agenda/semana-agenda/semana-agenda.component';
import { DIA_PADRAO, Trecho, validarDia } from '../../../agenda/semana-agenda/semana-agenda';
import { formatarReal } from '../../../pedidos/textos-pedido';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../../shared/components/icone/icones';
import { EscolhaSegmentoComponent } from '../escolha-segmento.component';
import { CORES_MARCA, buscarCorMarca } from '../../../../core/constants/cores-marca';
import { CorMarca } from '../../../../core/models/perfil.model';
import { ConfiguracaoVitrine } from '../../../../core/models/vitrine.model';
import { UrlImagemPipe } from '../../../../core/imagens/url-imagem';
import { corDaLogo } from '../../../posts/motor/cor-da-logo';
import { arquivoDaCapa, desenharCapaDegrade } from '../../../galeria/seletor-cor-marca/capa-degrade';

type IdPasso = 'segmento' | 'catalogo' | 'horario' | 'pagamento' | 'marca' | 'saudacao' | 'exemplo';

interface Passo {
  id: IdPasso;
}

const CHAVE_PASSO = 'dizai:onboarding:passo:';
const LIMITE_SAUDACAO = 600;
const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024;
const EMOJIS = ['😊', '👋', '✨', '❤️', '🙏', '🎉', '📍', '🕘', '💳', '📦', '🎂', '💅'];
const SEMANA_PADRAO: PeriodoAtendimento[] = (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const).map(
  (diaSemana) => ({ diaSemana, inicio: '09:00', fim: '18:00' }),
);

@Component({
  selector: 'app-onboarding-inicial',
  imports: [IconeComponent, EscolhaSegmentoComponent, HorarioFuncionamentoComponent, SemanaAgendaComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './onboarding-inicial.component.html',
  styleUrls: ['./onboarding-inicial.component.css', './onboarding-inicial-passos.css'],
})
export class OnboardingInicialComponent {
  /** Fim dos passos: o painel conclui o onboarding e abre o teste automático. */
  readonly testar = output<void>();

  private readonly perfilService = inject(PerfilService);
  private readonly produtoService = inject(ProdutoService);
  private readonly agendaService = inject(AgendaService);
  private readonly armazenamento = inject(ArmazenamentoFotosService);
  private readonly toast = inject(ToastService);
  protected readonly segmentosDoRamo = inject(ConteudoRamoService).segmentosDoRamo;

  protected readonly perfil = this.perfilService.perfil;
  protected readonly servico = computed(() => ramoDeServico(this.perfil().ramo));
  protected readonly usaAgenda = computed(() => ramoUsaAgenda(this.perfil().ramo));

  protected readonly passos = computed<Passo[]>(() =>
    (['segmento', 'catalogo', 'horario', 'pagamento', 'marca', 'saudacao', 'exemplo'] as const).map((id) => ({ id })),
  );
  protected readonly indice = signal(lerPassoSalvo(this.perfil().id));
  protected readonly passo = computed(() => this.passos()[Math.min(this.indice(), this.passos().length - 1)]);
  protected readonly salvando = signal(false);
  protected readonly tentou = signal(false);

  protected readonly segmento = signal<SegmentoNegocio | null | undefined>(this.perfil().segmento ?? undefined);

  protected readonly arquivosCatalogo = signal<File[]>([]);
  protected readonly catalogoSalvo = computed(() => this.perfil().catalogoArquivos ?? []);
  protected readonly arrastando = signal(false);

  protected readonly horarios = signal<PeriodoAtendimento[]>(
    this.perfil().horariosFuncionamento?.length ? this.perfil().horariosFuncionamento : SEMANA_PADRAO,
  );
  protected readonly horarioLivre = signal(this.perfil().horarioLivre === true);
  /** Serviços com agenda: os períodos de cada dia (o mesmo editor de Agenda → Horários, com a pausa do almoço). */
  protected readonly periodosAgenda = signal<Record<DiaSemana, Trecho[]>>(semanaPadraoDaAgenda());
  protected readonly horarioInvalido = computed(() => {
    if (this.usaAgenda()) {
      const dias = Object.values(this.periodosAgenda());
      return dias.every((trechos) => trechos.length === 0) || dias.some((trechos) => validarDia(trechos) !== null);
    }
    return !this.horarioLivre() && (this.horarios().length === 0 || this.horarios().some((h) => h.fim <= h.inicio));
  });

  protected readonly formasPagamento = FORMAS_PAGAMENTO;
  protected readonly formasRecebimento: { valor: FormaRecebimento; rotulo: string; icone: NomeIcone; texto: string }[] = [
    { valor: 'ENTREGA', rotulo: 'Entrega', icone: 'local', texto: 'Você leva até o cliente' },
    { valor: 'RETIRADA', rotulo: 'Retirada', icone: 'sacola', texto: 'O cliente busca com você' },
  ];
  protected readonly pagamento = signal<FormaPagamento[]>(this.perfil().formasPagamento ?? []);
  protected readonly recebimento = signal<FormaRecebimento[]>(
    (this.perfil().formasRecebimento ?? []).filter((forma) => forma !== 'ATENDIMENTO_LOCAL'),
  );

  /** Passo da marca: a logo (vira a foto da vitrine) e a cor de destaque (opcional; sem escolher, a da logo). */
  protected readonly cores = CORES_MARCA;
  protected readonly arquivoLogo = signal<File | null>(null);
  protected readonly previaLogo = signal<string | null>(null);
  protected readonly logoSalva = computed(() => this.perfil().fotoPerfilUrl ?? null);
  /** A cor da paleta mais parecida com a da logo (null = logo sem cor marcante). */
  protected readonly corDaLogo = signal<CorMarca | null>(null);
  protected readonly corEscolhida = signal<CorMarca | null>(null);
  protected readonly corFinal = computed(() => this.corEscolhida() ?? this.corDaLogo());

  protected readonly saudacao = signal(this.perfil().saudacaoPersonalizada ?? '');
  protected readonly emojis = EMOJIS;
  protected readonly limiteSaudacao = LIMITE_SAUDACAO;
  private readonly campoSaudacao = viewChild<ElementRef<HTMLTextAreaElement>>('campoSaudacao');

  protected readonly exemplo = computed<Produto | undefined>(() => this.produtoService.produtos()[0]);

  protected readonly podeAvancar = computed(() => {
    switch (this.passo().id) {
      case 'segmento':
        return this.segmento() !== undefined;
      case 'horario':
        return !this.horarioInvalido();
      case 'pagamento':
        return this.pagamento().length > 0 && (this.servico() || this.recebimento().length > 0);
      case 'saudacao':
        return this.saudacao().trim().length > 0 && this.saudacao().length <= LIMITE_SAUDACAO;
      default:
        return true;
    }
  });

  protected voltar(): void {
    this.irPara(this.indice() - 1);
  }

  protected async avancar(): Promise<void> {
    this.tentou.set(true);
    if (!this.podeAvancar() || this.salvando()) return;
    this.salvando.set(true);
    try {
      await this.salvarPasso(this.passo().id);
      this.tentou.set(false);
      if (this.passo().id === 'exemplo') {
        gravarPasso(this.perfil().id, null);
        this.testar.emit();
      } else {
        this.irPara(this.indice() + 1);
      }
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  /** "Depois" da marca: segue sem logo e sem cor. */
  protected pularMarca(): void {
    this.arquivoLogo.set(null);
    this.previaLogo.set(null);
    this.corEscolhida.set(null);
    this.corDaLogo.set(null);
    this.irPara(this.indice() + 1);
  }

  /** "Depois" do catálogo: segue sem enviar. */
  protected pularCatalogo(): void {
    this.arquivosCatalogo.set([]);
    this.irPara(this.indice() + 1);
  }

  private irPara(indice: number): void {
    const novo = Math.max(0, Math.min(indice, this.passos().length - 1));
    this.indice.set(novo);
    gravarPasso(this.perfil().id, novo);
  }

  private async salvarPasso(id: IdPasso): Promise<void> {
    switch (id) {
      case 'segmento': {
        await this.perfilService.definirSegmento(this.segmento() ?? null);
        await this.produtoService.carregar();
        if (!this.produtoService.produtos().length) {
          await this.produtoService.criarExemplo();
        }
        this.saudacao.set(this.perfil().saudacaoPersonalizada ?? '');
        return;
      }
      case 'catalogo': {
        const arquivos = this.arquivosCatalogo();
        if (!arquivos.length) return;
        const referencias = await this.armazenamento.enviar(arquivos, { tipo: 'CATALOGO' });
        await this.perfilService.salvarConfiguracoes({
          ...configuracoesDoPerfil(this.perfil()),
          modoCatalogo: 'AO_PERGUNTAR',
          catalogoArquivos: referencias,
          catalogos: [{ assunto: '', contexto: '', arquivos: referencias }],
        });
        this.arquivosCatalogo.set([]);
        return;
      }
      case 'horario': {
        if (this.usaAgenda()) {
          await this.agendaService.carregarConfiguracao();
          const configuracao = this.agendaService.configuracao();
          if (configuracao) {
            const periodos: PeriodoAtendimento[] = DIAS_SEMANA.flatMap((dia) =>
              this.periodosAgenda()[dia.valor].map((trecho) => ({ diaSemana: dia.valor, ...trecho })),
            );
            await this.agendaService.salvarConfiguracao({ ...configuracao, periodos });
          }
          return;
        }
        await this.perfilService.atualizarDadosLoja({
          ...dadosLojaDoPerfil(this.perfil()),
          horariosFuncionamento: this.horarios(),
          horarioLivre: this.horarioLivre(),
        });
        return;
      }
      case 'pagamento': {
        const dados = dadosLojaDoPerfil(this.perfil());
        await this.perfilService.atualizarDadosLoja({
          ...dados,
          pagamentoEntrega: {
            ...dados.pagamentoEntrega,
            formasPagamento: this.pagamento(),
            formasRecebimento: this.servico() ? dados.pagamentoEntrega.formasRecebimento : this.recebimento(),
          },
        });
        return;
      }
      case 'marca': {
        await this.salvarMarca();
        return;
      }
      case 'saudacao': {
        await this.perfilService.salvarConfiguracoes({
          ...configuracoesDoPerfil(this.perfil()),
          saudacaoPersonalizada: this.saudacao().trim(),
        });
        return;
      }
      case 'exemplo':
        return;
    }
  }

  /** A logo sobe como a foto da vitrine; a cor (a escolhida ou a da logo) vira a cor de destaque e, sem capa, a capa em degradê dela. */
  private async salvarMarca(): Promise<void> {
    const logo = this.arquivoLogo();
    if (logo) {
      const [referencia] = await this.armazenamento.enviar([logo], { tipo: 'PERFIL' });
      if (referencia) await this.perfilService.atualizarFotoPerfil(referencia);
      this.arquivoLogo.set(null);
    }
    const cor = this.corFinal();
    if (!cor) return;
    const perfil = this.perfil();
    let capaUrl = perfil.capaUrl ?? null;
    if (!capaUrl) {
      const desenho = desenharCapaDegrade(buscarCorMarca(cor).hex);
      if (desenho) {
        const [referencia] = await this.armazenamento.enviar([await arquivoDaCapa(desenho)], { tipo: 'CAPA' });
        capaUrl = referencia ?? null;
      }
    }
    const configuracao: ConfiguracaoVitrine = {
      corMarca: cor,
      fonteGaleria: perfil.fonteGaleria ?? 'Poppins',
      corFundoGaleria: perfil.corFundoGaleria ?? cor,
      areaCorFundoGaleria: perfil.areaCorFundoGaleria ?? 'CABECALHO',
      estiloCor: perfil.estiloCor ?? 'NORMAL',
      estiloMenu: perfil.estiloMenu ?? 'ARREDONDADO',
      estiloAbas: perfil.estiloAbas ?? 'PILULA',
      layoutFotos: perfil.layoutFotos ?? 'GRADE',
      capaUrl,
    };
    await this.perfilService.atualizarConfiguracaoVitrine(configuracao);
  }

  protected async escolherLogo(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const arquivo = entrada.files?.[0];
    entrada.value = '';
    if (!arquivo) return;
    if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) {
      this.toast.mostrar('Envie a logo em JPG, PNG ou WEBP.');
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      this.toast.mostrar('A logo pode ter até 5 MB.');
      return;
    }
    const dataUrl = await new Promise<string>((resolver) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(String(leitor.result));
      leitor.readAsDataURL(arquivo);
    });
    this.arquivoLogo.set(arquivo);
    this.previaLogo.set(dataUrl);
    const hex = await corDaLogo(dataUrl).catch(() => null);
    this.corDaLogo.set(hex ? corMaisParecida(hex) : null);
  }

  /** Tocar na cor escolhida de novo volta para a da logo. */
  protected escolherCor(cor: CorMarca): void {
    this.corEscolhida.set(this.corEscolhida() === cor ? null : cor);
  }

  protected escolherArquivos(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    this.adicionarArquivos(Array.from(entrada.files ?? []));
    entrada.value = '';
  }

  protected soltarArquivos(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastando.set(false);
    this.adicionarArquivos(Array.from(evento.dataTransfer?.files ?? []));
  }

  protected removerArquivo(indice: number): void {
    this.arquivosCatalogo.update((lista) => lista.filter((_, i) => i !== indice));
  }

  // um PDF ou até duas imagens (JPG/PNG), como no "Catálogo na conversa"
  private adicionarArquivos(novos: File[]): void {
    const validos = novos.filter((arquivo) => /^(application\/pdf|image\/(jpeg|png))$/.test(arquivo.type));
    if (validos.length < novos.length) {
      this.toast.mostrar('Envie PDF, JPG ou PNG.');
    }
    if (validos.some((arquivo) => arquivo.size > TAMANHO_MAXIMO_ARQUIVO)) {
      this.toast.mostrar('Cada arquivo pode ter até 10 MB.');
      return;
    }
    const pdf = validos.find((arquivo) => arquivo.type === 'application/pdf');
    if (pdf) {
      this.arquivosCatalogo.set([pdf]);
      return;
    }
    const imagens = [...this.arquivosCatalogo().filter((a) => a.type !== 'application/pdf'), ...validos];
    if (imagens.length > 2) {
      this.toast.mostrar('Até 2 imagens, ou 1 PDF.');
    }
    this.arquivosCatalogo.set(imagens.slice(0, 2));
  }

  protected alternarPagamento(forma: FormaPagamento): void {
    this.pagamento.update((lista) => alternarItem(lista, forma));
  }

  protected alternarRecebimento(forma: FormaRecebimento): void {
    this.recebimento.update((lista) => alternarItem(lista, forma));
  }

  protected digitarSaudacao(evento: Event): void {
    this.saudacao.set((evento.target as HTMLTextAreaElement).value);
  }

  /** Põe o emoji onde está o cursor (ou no fim). */
  protected inserirEmoji(emoji: string): void {
    const campo = this.campoSaudacao()?.nativeElement;
    const texto = this.saudacao();
    const inicio = campo?.selectionStart ?? texto.length;
    const fim = campo?.selectionEnd ?? texto.length;
    this.saudacao.set(texto.slice(0, inicio) + emoji + texto.slice(fim));
    queueMicrotask(() => {
      campo?.focus();
      campo?.setSelectionRange(inicio + emoji.length, inicio + emoji.length);
    });
  }

  protected tamanhoArquivo(arquivo: File): string {
    const kb = arquivo.size / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(kb))} KB`;
  }

  protected preco(valor: number | null | undefined): string {
    return valor == null ? '' : formatarReal(valor);
  }

  protected duracao(minutos: number | null | undefined): string {
    return minutos ? formatarDuracao(minutos) : '';
  }

  protected antecedencia(minutos: number | null | undefined): string {
    if (!minutos) return '';
    if (minutos % 1440 === 0) return `${minutos / 1440} ${minutos === 1440 ? 'dia' : 'dias'} de antecedência`;
    if (minutos % 60 === 0) return `${minutos / 60} h de antecedência`;
    return `${minutos} min de antecedência`;
  }

  /** "O cliente escolhe até 2", "Adicional, se quiser"... */
  protected regra(atributo: AtributoProduto): string {
    const n = atributo.quantidadeEscolha ?? 1;
    switch (atributo.modoEscolha ?? 'EXATAMENTE') {
      case 'ADICIONAL':
        return 'Adicional: o assistente oferece, o cliente escolhe se quiser';
      case 'QUANTAS_QUISER':
        return 'O cliente escolhe quantas quiser';
      case 'ATE':
        return `O cliente escolhe até ${n}`;
      case 'MINIMO':
        return `O cliente escolhe pelo menos ${n}`;
      default:
        return n === 0 ? 'Opcional' : n === 1 ? 'O cliente escolhe 1' : `O cliente escolhe ${n}`;
    }
  }

  protected primeiroNome(): string {
    return this.perfil().nomeResponsavel?.trim().split(/\s+/)[0] ?? '';
  }
}

/** A cor da paleta mais perto da cor da logo (distância simples em RGB). */
function corMaisParecida(hex: string): CorMarca {
  const rgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
  const alvo = rgb(hex);
  let melhor = CORES_MARCA[0];
  let menor = Infinity;
  for (const opcao of CORES_MARCA) {
    const [r, g, b] = rgb(opcao.hex);
    const distancia = (r - alvo[0]) ** 2 + (g - alvo[1]) ** 2 + (b - alvo[2]) ** 2;
    if (distancia < menor) {
      menor = distancia;
      melhor = opcao;
    }
  }
  return melhor.valor;
}

// segunda a sábado com a pausa do almoço; domingo fechado
function semanaPadraoDaAgenda(): Record<DiaSemana, Trecho[]> {
  return Object.fromEntries(
    DIAS_SEMANA.map((dia) => [dia.valor, dia.valor === 'SUNDAY' ? [] : DIA_PADRAO.map((t) => ({ ...t }))]),
  ) as Record<DiaSemana, Trecho[]>;
}

function configuracoesDoPerfil(perfil: Perfil): ConfiguracoesAtendimento {
  return {
    modoPedido: perfil.modoPedido,
    camposPedido: perfil.camposPedido,
    modoFotos: perfil.modoFotos,
    linkPortfolioExterno: perfil.linkPortfolioExterno,
    saudacaoPersonalizada: perfil.saudacaoPersonalizada,
    instrucoesObrigatorias: perfil.instrucoesObrigatorias,
    modoCatalogo: perfil.modoCatalogo,
    catalogoArquivos: perfil.catalogoArquivos ?? [],
    catalogos: perfil.catalogos,
    confirmaQualquerHora: perfil.confirmaQualquerHora,
    linkAgendamentoExterno: perfil.linkAgendamentoExterno,
    mensagemRepasseNaHora: perfil.mensagemRepasseNaHora,
    mensagemRepassePedido: perfil.mensagemRepassePedido,
    mensagemSemResposta: perfil.mensagemSemResposta,
  };
}

function dadosLojaDoPerfil(perfil: Perfil): DadosLoja {
  return {
    dadosNegocio: {
      nomeResponsavel: perfil.nomeResponsavel,
      nomeLoja: perfil.nomeLoja,
      descricao: perfil.descricao,
      whatsapp: perfil.whatsapp,
    },
    ramo: perfil.ramo,
    pagamentoEntrega: {
      formasPagamento: perfil.formasPagamento ?? [],
      formasRecebimento: perfil.formasRecebimento ?? [],
      distanciaMaximaKm: perfil.distanciaMaximaKm,
      taxaEntrega: perfil.taxaEntrega,
      antecedenciaMinutos: perfil.antecedenciaMinutos ?? 0,
    },
    horariosFuncionamento: perfil.horariosFuncionamento,
    horarioLivre: perfil.horarioLivre,
    segmento: perfil.segmento ?? null,
  };
}

function lerPassoSalvo(perfilId: string): number {
  try {
    const valor = Number(localStorage.getItem(CHAVE_PASSO + perfilId));
    return Number.isInteger(valor) && valor > 0 ? valor : 0;
  } catch {
    return 0;
  }
}

function gravarPasso(perfilId: string, indice: number | null): void {
  try {
    if (indice === null) localStorage.removeItem(CHAVE_PASSO + perfilId);
    else localStorage.setItem(CHAVE_PASSO + perfilId, String(indice));
  } catch {
    // sem armazenamento: o onboarding recomeça do primeiro passo
  }
}
