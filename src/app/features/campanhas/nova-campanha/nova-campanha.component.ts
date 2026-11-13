import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { mensagemDoErro } from '../../../core/api/erro-api';
import {
  DiaLivre,
  Oportunidade,
  PreviaCampanha,
  PublicoCampanha,
  RascunhoCampanha,
  ResumoCampanha,
  SituacaoCampanhas,
  TipoCampanha,
} from '../../../core/models/campanha.model';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { CampanhaService } from '../../../core/services/campanha.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { DiaLivre as DiaDaArte, TipoPost } from '../../posts/motor/tipos-post';
import { ArteCampanhaComponent } from '../arte-campanha/arte-campanha.component';

type Passo = 1 | 2 | 3;

const PERIODOS_ENCOMENDA = ['para esta semana', 'para este fim de semana', 'para o próximo mês'];

/**
 * Nova campanha em 3 passos: a mensagem (o que divulgar e a arte), quem recebe (com a lista para desmarcar) e a
 * revisão (a prévia no WhatsApp, o custo e o envio). Vinda de uma oportunidade, já abre preenchida.
 */
@Component({
  selector: 'app-nova-campanha',
  imports: [BottomSheetComponent, IconeComponent, ArteCampanhaComponent, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nova-campanha.component.html',
  styleUrl: './nova-campanha.component.css',
})
export class NovaCampanhaComponent implements OnInit {
  private readonly campanhaService = inject(CampanhaService);
  private readonly armazenamento = inject(ArmazenamentoFotosService);
  private readonly produtoService = inject(ProdutoService);

  readonly tipo = input.required<TipoCampanha>();
  readonly situacao = input.required<SituacaoCampanhas>();
  readonly oportunidade = input<Oportunidade | null>(null);
  readonly fechar = output<void>();
  readonly enviada = output<ResumoCampanha>();

  private readonly arte = viewChild(ArteCampanhaComponent);
  /** A revisão só aparece com a arte pronta (sem arte, na hora). */
  protected readonly revisaoPronta = computed(() => !this.comArte() || (this.arte()?.pronta() ?? false));

  protected readonly passo = signal<Passo>(1);
  protected readonly erro = signal('');

  // ---------------------------------------------------------------- a mensagem
  protected readonly destaque = signal('');
  protected readonly detalhe = signal('');
  protected readonly dataReferencia = signal<string | null>(null);
  /** Convite dos serviços para a semana toda ("Temos horários livres para esta semana"). */
  protected readonly semana = signal(false);
  protected readonly dataEspecialId = signal<string | null>(null);
  protected readonly outraData = signal('');
  protected readonly produtoId = signal<number | null>(null);
  protected readonly comArte = signal(true);
  /** Foto enviada pelo lojista só para esta arte (data URL já reduzida); null = a do cadastro e as da galeria. */
  protected readonly fotoPropria = signal<string | null>(null);
  /** A foto principal da arte: a enviada agora ou a do produto/serviço escolhido. */
  protected readonly fotoDaArte = computed(() => this.fotoPropria() ?? this.produtoEscolhido()?.fotoUrl ?? null);
  protected readonly sementeArte = signal((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  protected readonly diasLivres = signal<DiaLivre[]>([]);
  protected readonly carregandoDias = signal(false);
  protected readonly periodos = PERIODOS_ENCOMENDA;

  // ---------------------------------------------------------------- quem recebe
  protected readonly publico = signal<PublicoCampanha>('TODOS');
  protected readonly diasAusencia = signal(30);
  protected readonly item = signal('');
  protected readonly previa = signal<PreviaCampanha | null>(null);
  protected readonly carregandoPrevia = signal(false);
  protected readonly marcados = signal<Set<string>>(new Set());
  protected readonly enviando = signal(false);

  protected readonly servico = computed(() => this.situacao().servico);
  /** O que impede o envio (o resto da campanha pode ser montado para ver como fica); null = pode enviar. */
  protected readonly bloqueioDoEnvio = computed(() => {
    const s = this.situacao();
    if (this.campanhaService.demonstracao()) return null;
    if (!s.conectado) return 'Para enviar, conecte o WhatsApp da loja.';
    if (!s.liberada) return `Para enviar, a loja precisa de pelo menos ${s.minimo} clientes (hoje: ${s.aptos}).`;
    return null;
  });
  protected readonly conviteComAgenda = computed(() => this.tipo() === 'CONVITE' && this.servico());
  /** Público montado pela estratégia do DizAI (não dá para trocar). */
  protected readonly publicoFixo = computed(
    () => this.tipo() === 'RECUPERAR' || this.tipo() === 'REPETIR_PEDIDO' || this.publico() === 'NO_CICLO',
  );
  protected readonly produtos = computed(() =>
    this.produtoService.produtos().filter((p) => p.disponivel !== false && (!this.servico() || !p.produtoAVenda)),
  );
  protected readonly produtoEscolhido = computed(() => this.produtos().find((p) => p.id === this.produtoId()) ?? null);
  protected readonly dataEscolhida = computed(() => this.situacao().datas.find((d) => d.id === this.dataEspecialId()) ?? null);
  protected readonly diaEscolhido = computed(() => this.diasLivres().find((d) => d.data === this.dataReferencia()) ?? null);
  protected readonly quantosMarcados = computed(() => this.marcados().size);
  protected readonly custoMarcado = computed(() => {
    const previa = this.previa();
    if (!previa) return 0;
    const pagos = previa.clientes.filter((c) => !c.semCusto && this.marcados().has(c.id)).length;
    return previa.pagos === 0 ? 0 : (previa.custoEstimado / previa.pagos) * pagos;
  });
  protected readonly gratisMarcados = computed(
    () => this.previa()?.clientes.filter((c) => c.semCusto && this.marcados().has(c.id)).length ?? 0,
  );

  protected readonly titulo = computed(() => {
    switch (this.tipo()) {
      case 'PROMOCAO':
        return 'Promoção';
      case 'NOVIDADE':
        return 'Novidade';
      case 'CONVITE':
        return this.servico() ? 'Horários livres' : 'Encomendas abertas';
      case 'DATA_ESPECIAL':
        return 'Data especial';
      case 'RECUPERAR':
        return 'Trazer de volta quem sumiu';
      case 'REPETIR_PEDIDO':
        return 'Encomendas do ano passado';
    }
  });

  /** Os textos da arte (o motor dos posts desenha com a cara da loja). */
  protected readonly arteTipo = computed<TipoPost>(() => {
    switch (this.tipo()) {
      case 'PROMOCAO':
        return 'PROMOCAO';
      case 'NOVIDADE':
        return 'NOVIDADE';
      case 'CONVITE':
        return this.servico() ? 'AGENDA' : 'CONVITE';
      default:
        return 'CONVITE';
    }
  });
  protected readonly arteTitulo = computed(() => {
    switch (this.tipo()) {
      case 'PROMOCAO':
      case 'NOVIDADE':
        return this.destaque().trim() || this.titulo();
      case 'CONVITE':
        return this.servico() ? 'Horários livres' : 'Encomendas abertas';
      case 'DATA_ESPECIAL':
        return this.dataEscolhida()?.nome ?? (primeiraMaiuscula(this.outraData().trim()) || 'Data especial');
      case 'RECUPERAR':
        return 'Sentimos a sua falta';
      case 'REPETIR_PEDIDO':
        return 'Garanta a sua encomenda';
    }
  });
  protected readonly arteApoio = computed(() => {
    switch (this.tipo()) {
      case 'PROMOCAO':
        return this.detalhe().trim() || 'Por tempo limitado';
      case 'NOVIDADE':
        return this.detalhe().trim();
      case 'CONVITE':
        if (this.servico()) return this.semana() ? 'Esta semana' : (this.diaEscolhido()?.rotulo ?? '');
        return primeiraMaiuscula(this.destaque().trim());
      case 'DATA_ESPECIAL':
        return this.servico() ? 'Agenda aberta' : 'Encomendas abertas';
      case 'RECUPERAR':
        return this.detalhe().trim() || 'Volte para nos ver';
      case 'REPETIR_PEDIDO':
        return 'Encomendas abertas';
    }
  });
  protected readonly arteHorarios = computed<DiaDaArte[]>(() => {
    if (!this.conviteComAgenda()) return [];
    const dias = this.semana() ? this.diasLivres().slice(0, 3) : [this.diaEscolhido()].filter((d): d is DiaLivre => !!d);
    return dias.map((dia) => ({
      dia: dia.rotulo,
      horas: dia.horarios
        .split(/, | ou /)
        .map((parte) => parte.replace(/^entre (\d\d:\d\d) e (\d\d:\d\d)$/, '$1 às $2').replace(/^às /, '')),
    }));
  });

  /** O que falta no passo 1 (vazio = pode continuar). */
  protected readonly falta = computed(() => {
    switch (this.tipo()) {
      case 'PROMOCAO':
        return this.destaque().trim().length < 3 ? 'Escreva qual é a promoção.' : '';
      case 'NOVIDADE':
        return this.destaque().trim().length < 3 ? 'Escreva qual é a novidade.' : '';
      case 'CONVITE':
        if (this.servico()) return this.semana() || this.dataReferencia() ? '' : 'Escolha o dia dos horários.';
        return this.destaque().trim().length < 3 ? 'Escolha para quando são as encomendas.' : '';
      case 'DATA_ESPECIAL':
        if (this.dataEspecialId() === 'OUTRA') return this.outraData().trim().length < 3 ? 'Escreva qual é a data.' : '';
        return this.dataEspecialId() ? '' : 'Escolha a data.';
      default:
        return '';
    }
  });

  ngOnInit(): void {
    const rascunho = this.oportunidade()?.rascunho;
    if (rascunho) {
      this.publico.set(rascunho.publico ?? 'TODOS');
      this.dataReferencia.set(rascunho.dataReferencia ?? null);
      this.dataEspecialId.set(rascunho.dataEspecialId ?? null);
      if (rascunho.dataEspecialId) this.detalhe.set(this.dataEscolhida()?.detalhe ?? '');
    } else if (this.tipo() === 'CONVITE' && this.servico()) {
      this.publico.set('AUSENTES');
    }
    if (this.produtoService.produtos().length === 0) void this.produtoService.carregar().catch(() => undefined);
    if (this.conviteComAgenda()) void this.carregarDias();
  }

  // ---------------------------------------------------------------- passo 1
  protected escolherDia(data: string | null): void {
    this.semana.set(data === null);
    this.dataReferencia.set(data);
  }

  /** "Usar uma foto minha": reduz no navegador (até 1600 px, JPEG) e põe como foto principal da arte. */
  protected async escolherFotoPropria(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    campo.value = '';
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      this.erro.set('Escolha uma imagem (JPG, PNG ou WEBP).');
      return;
    }
    try {
      this.fotoPropria.set(await reduzirImagem(arquivo, 1600));
      this.erro.set('');
    } catch {
      this.erro.set('Não foi possível abrir esta imagem. Tente outra.');
    }
  }

  protected trocarArte(): void {
    this.sementeArte.set((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  }

  protected texto(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }

  protected escolherData(id: string): void {
    this.dataEspecialId.set(id);
    const data = this.situacao().datas.find((d) => d.id === id);
    this.detalhe.set(data?.detalhe ?? '');
  }

  protected escolherProduto(evento: Event): void {
    const id = Number((evento.target as HTMLSelectElement).value) || null;
    this.produtoId.set(id);
    const produto = this.produtos().find((p) => p.id === id);
    if (produto && !this.destaque().trim()) this.destaque.set(produto.nome);
  }

  private async carregarDias(): Promise<void> {
    this.carregandoDias.set(true);
    try {
      const dias = await this.campanhaService.diasLivres();
      this.diasLivres.set(dias);
      if (!this.dataReferencia() && dias.length > 0) this.dataReferencia.set(dias[0].data);
    } catch {
      this.diasLivres.set([]);
    } finally {
      this.carregandoDias.set(false);
    }
  }

  // ---------------------------------------------------------------- navegação
  protected async avancar(): Promise<void> {
    this.erro.set('');
    if (this.passo() === 1) {
      if (this.falta()) {
        this.erro.set(this.falta());
        return;
      }
      this.passo.set(2);
      await this.atualizarPrevia();
    } else if (this.passo() === 2) {
      // sem poder enviar, segue mesmo sem clientes: o lojista vê como a mensagem chega
      if (this.quantosMarcados() === 0 && !this.bloqueioDoEnvio()) {
        this.erro.set('Marque pelo menos um cliente para receber.');
        return;
      }
      this.passo.set(3);
    }
  }

  protected voltar(): void {
    this.erro.set('');
    if (this.passo() > 1) this.passo.set((this.passo() - 1) as Passo);
  }

  // ---------------------------------------------------------------- passo 2
  protected async escolherPublico(publico: PublicoCampanha): Promise<void> {
    this.publico.set(publico);
    await this.atualizarPrevia();
  }

  protected async mudarDias(evento: Event): Promise<void> {
    const valor = Math.max(1, Math.min(365, Number((evento.target as HTMLInputElement).value) || 30));
    this.diasAusencia.set(valor);
    if (this.publico() === 'AUSENTES') await this.atualizarPrevia();
  }

  protected async mudarItem(evento: Event): Promise<void> {
    this.item.set((evento.target as HTMLSelectElement).value);
    await this.atualizarPrevia();
  }

  protected alternar(id: string): void {
    this.marcados.update((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  protected marcarTodos(marcar: boolean): void {
    this.marcados.set(marcar ? new Set(this.previa()?.clientes.map((c) => c.id) ?? []) : new Set());
  }

  private async atualizarPrevia(): Promise<void> {
    this.carregandoPrevia.set(true);
    try {
      const previa = await this.campanhaService.previa(this.rascunho());
      this.previa.set(previa);
      this.marcados.set(new Set(previa.clientes.map((c) => c.id)));
    } catch (erro) {
      this.previa.set(null);
      this.erro.set(mensagemDoErro(erro, 'Não foi possível montar a lista de clientes. Tente de novo.'));
    } finally {
      this.carregandoPrevia.set(false);
    }
  }

  // ---------------------------------------------------------------- passo 3
  protected async enviar(): Promise<void> {
    if (this.enviando() || this.bloqueioDoEnvio()) return;
    this.erro.set('');
    this.enviando.set(true);
    try {
      let imagem: string | null = null;
      if (this.comArte() && !this.campanhaService.demonstracao()) {
        const arquivo = await this.arte()?.gerarArquivo();
        if (arquivo) [imagem] = await this.armazenamento.enviar([arquivo], { tipo: 'CAMPANHAS' });
      }
      const resumo = await this.campanhaService.criar({ ...this.rascunho(), imagem, clientes: [...this.marcados()] });
      this.enviada.emit(resumo);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível enviar a campanha. Tente de novo.'));
    } finally {
      this.enviando.set(false);
    }
  }

  private rascunho(): RascunhoCampanha {
    const tipo = this.tipo();
    const outra = this.dataEspecialId() === 'OUTRA';
    return {
      tipo,
      publico: this.publico(),
      diasAusencia: this.publico() === 'AUSENTES' ? this.diasAusencia() : null,
      item: this.item() || null,
      destaque: tipo === 'DATA_ESPECIAL' ? (outra ? this.outraData().trim() : null) : this.destaque().trim() || null,
      detalhe: this.detalhe().trim() || null,
      dataReferencia: this.conviteComAgenda() && !this.semana() ? this.dataReferencia() : null,
      semana: this.conviteComAgenda() && this.semana(),
      dataEspecialId: tipo === 'DATA_ESPECIAL' ? this.dataEspecialId() : null,
      oportunidadeChave: this.oportunidade()?.chave ?? null,
    };
  }

  /** A mensagem com quebras de linha onde o WhatsApp mostra (a prévia). */
  protected readonly paragrafos = computed(() => (this.previa()?.texto ?? '').split('\n'));
}

/** A imagem como data URL JPEG com o lado maior em até `maximo` px (fotos de celular chegam com 4000 px). */
async function reduzirImagem(arquivo: File, maximo: number): Promise<string> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, maximo / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.88);
}

function primeiraMaiuscula(texto: string): string {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}
