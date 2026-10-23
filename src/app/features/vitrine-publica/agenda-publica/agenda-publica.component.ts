import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { AgendaPublica, DiaHorarios, ProdutoAgendaPublica, ServicoAgenda } from '../../../core/models/agenda.model';
import { LojaPublicaService } from '../../../core/services/loja-publica.service';
import { alternarItem } from '../../../core/utils/colecao.utils';
import { diaPorExtenso, formatarDuracao } from '../../../core/utils/datas-agenda';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { FaixaDiasComponent, ItemFaixaDia } from '../../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { formatarReal } from '../../pedidos/textos-pedido';

/** Horários do dia em grupos, para a lista não virar um muro de botões. */
const TURNOS = [
  { nome: 'Manhã', ate: '12:00' },
  { nome: 'Tarde', ate: '18:00' },
  { nome: 'Noite', ate: '24:00' },
];

/**
 * Aba "Agenda" da página pública: o cliente escolhe o serviço, o dia e o horário livre e envia
 * tudo pronto pelo WhatsApp. Nada é marcado aqui: o assistente confere a agenda e confirma na conversa
 * (assim um horário que alguém pegou no meio do caminho nunca é confirmado duas vezes).
 */
@Component({
  selector: 'app-agenda-publica',
  imports: [IconeComponent, CarregandoComponent, FaixaDiasComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agenda-publica.component.html',
  styleUrl: './agenda-publica.component.css',
})
export class AgendaPublicaComponent implements OnInit {
  readonly slug = input.required<string>();
  readonly numeroWhatsapp = input.required<string>();

  private readonly lojaPublicaService = inject(LojaPublicaService);

  protected readonly situacao = signal<'carregando' | 'pronta' | 'erro'>('carregando');
  private readonly agenda = signal<AgendaPublica | null>(null);
  protected readonly escolhidos = signal<number[]>([]);
  protected readonly dias = signal<DiaHorarios[]>([]);
  protected readonly carregandoHorarios = signal(false);
  protected readonly diaSelecionado = signal<string | null>(null);
  protected readonly horaSelecionada = signal<string | null>(null);
  protected readonly nome = signal('');
  /** Produtos à venda reservados no passo opcional "Também temos" (ids). */
  protected readonly reservados = signal<number[]>([]);
  /**
   * Com 2+ profissionais: quem o cliente escolheu ("qualquer" = sem preferência; null = ainda não escolheu).
   * Com um só, o passo "Com quem?" não aparece e tudo fica como sempre.
   */
  protected readonly profissionalEscolhido = signal<string | null>(null);
  /** Ignora respostas antigas quando o cliente troca de serviço rápido. */
  private buscaAtual = 0;

  /** Serviços agrupados pela categoria do cadastro. */
  protected readonly categorias = computed(() => {
    const grupos = new Map<string, ServicoAgenda[]>();
    for (const servico of this.agenda()?.servicos ?? []) {
      grupos.set(servico.categoria, [...(grupos.get(servico.categoria) ?? []), servico]);
    }
    return [...grupos.entries()].map(([nome, servicos]) => ({ nome, servicos }));
  });

  protected readonly profissionais = computed(() => this.agenda()?.profissionais ?? []);
  protected readonly produtos = computed(() => this.agenda()?.produtos ?? []);
  protected readonly produtosReservados = computed(() =>
    this.produtos().filter((produto) => this.reservados().includes(produto.id)),
  );
  protected readonly comProfissionais = computed(() => this.profissionais().length > 1);
  /** Os passos do dia e do horário só aparecem depois de escolher com quem (com 2+ profissionais). */
  protected readonly podeVerDias = computed(
    () => this.escolhidos().length > 0 && (!this.comProfissionais() || this.profissionalEscolhido() !== null),
  );
  protected readonly nomeProfissional = computed(() => {
    const escolhido = this.profissionalEscolhido();
    return escolhido === 'qualquer' ? 'qualquer um' : this.profissionais().find((p) => p.id === escolhido)?.nome ?? '';
  });
  /** Número dos passos depois do "Com quem?" (que só existe com 2+ profissionais). */
  protected readonly passoExtra = computed(() => (this.comProfissionais() ? 1 : 0));

  protected readonly servicosEscolhidos = computed(() =>
    (this.agenda()?.servicos ?? []).filter((s) => this.escolhidos().includes(s.id)),
  );
  protected readonly duracaoTotal = computed(() =>
    this.servicosEscolhidos().reduce((total, s) => total + s.duracaoMinutos, 0),
  );
  protected readonly textoServicos = computed(() => this.servicosEscolhidos().map((s) => s.nome).join(' + '));
  /** Soma dos preços escolhidos; null quando algum é sob consulta (aí o total não aparece). */
  protected readonly totalPreco = computed(() => {
    const escolhidos = this.servicosEscolhidos();
    if (escolhidos.length === 0 || escolhidos.some((s) => s.preco == null)) return null;
    return escolhidos.reduce((total, s) => total + Number(s.preco), 0);
  });
  protected readonly aPartirDe = computed(() => this.servicosEscolhidos().some((s) => s.precoAPartirDe));
  /** Linha da barra de baixo: "Pé e mão · 1h30 · R$ 80,00" ou "2 serviços · 2h · R$ 120,00". */
  protected readonly resumoBarra = computed(() => {
    const escolhidos = this.servicosEscolhidos();
    if (escolhidos.length === 0) return '';
    const total = this.totalPreco();
    return [
      escolhidos.length === 1 ? escolhidos[0].nome : `${escolhidos.length} serviços`,
      formatarDuracao(this.duracaoTotal()),
      ...(total !== null ? [(this.aPartirDe() ? 'a partir de ' : '') + formatarReal(total)] : []),
    ].join(' · ');
  });

  protected readonly itensFaixa = computed<ItemFaixaDia[]>(() =>
    this.dias().map((dia) => ({
      data: dia.data,
      desativado: dia.horarios.length === 0,
      detalhe: !dia.aberto ? 'Fechado' : dia.horarios.length === 0 ? 'Lotado' : '',
    })),
  );

  protected readonly turnos = computed(() => {
    const horarios = this.dias().find((d) => d.data === this.diaSelecionado())?.horarios ?? [];
    let desde = '00:00';
    return TURNOS.map((turno) => {
      const doTurno = horarios.filter((h) => h >= desde && h < turno.ate);
      desde = turno.ate;
      return { nome: turno.nome, horarios: doTurno };
    }).filter((turno) => turno.horarios.length > 0);
  });

  protected readonly semHorarioNoMes = computed(
    () => this.escolhidos().length > 0 && !this.carregandoHorarios() && this.dias().every((d) => d.horarios.length === 0),
  );

  protected readonly pronto = computed(
    () => this.podeVerDias() && !!this.diaSelecionado() && !!this.horaSelecionada(),
  );

  protected readonly resumoEscolha = computed(() => {
    const dia = this.diaSelecionado();
    const hora = this.horaSelecionada();
    if (!this.pronto() || !dia || !hora) {
      return null;
    }
    return { servicos: this.textoServicos(), quando: `${diaPorExtenso(dia)} às ${hora}`, duracao: formatarDuracao(this.duracaoTotal()) };
  });

  /** O nome é obrigatório: é como o horário aparece na agenda do lojista. */
  protected readonly faltaNome = computed(() => this.nome().trim().length === 0);

  /** A mesma mensagem que o assistente sabe ler (ver a seção AGENDAMENTO do prompt). */
  protected readonly linkEnviar = computed(() => {
    const dia = this.diaSelecionado();
    const hora = this.horaSelecionada();
    if (!this.pronto() || !dia || !hora || this.faltaNome()) {
      return null;
    }
    // blocos separados por linha em branco e rótulos em negrito (o WhatsApp mostra *texto* em negrito)
    const reservados = this.produtosReservados();
    const linhas = [
      'Olá! Quero agendar pela agenda online:',
      '',
      `*Serviço:* ${this.textoServicos()}`,
      // só com 2+ profissionais (a IA lê e marca com quem foi escolhido)
      ...(this.comProfissionais() ? [`*Profissional:* ${this.nomeProfissional()}`] : []),
      `*Data:* ${diaPorExtenso(dia)}`,
      `*Horário:* ${hora}`,
      `*Nome:* ${this.nome().trim()}`,
      // passo "Também temos" (o sistema guarda no agendamento; não é uma venda): um só na mesma linha, vários em lista
      ...(reservados.length === 1 ? ['', `*Também desejo:* ${reservados[0].nome}`] : []),
      ...(reservados.length > 1 ? ['', '*Também desejo:*', ...reservados.map((produto) => `• ${produto.nome}`)] : []),
    ];
    return `${gerarLinkWhatsapp(this.numeroWhatsapp())}?text=${encodeURIComponent(linhas.join('\n'))}`;
  });

  ngOnInit(): void {
    void this.carregar();
  }

  protected recarregar(): void {
    this.situacao.set('carregando');
    void this.carregar();
  }

  protected duracao(minutos: number): string {
    return formatarDuracao(minutos);
  }

  protected alternarServico(servico: ServicoAgenda): void {
    this.escolhidos.update((ids) => alternarItem(ids, servico.id));
    this.horaSelecionada.set(null);
    void this.buscarHorarios();
  }

  /** Setinhas do "Também temos": desligadas nas pontas da rolagem. */
  protected readonly noInicioProdutos = signal(true);
  protected readonly noFimProdutos = signal(false);

  /** Passa 2 produtos (uma tela do trilho) para um lado. */
  protected passarProdutos(trilho: HTMLElement, direcao: 1 | -1): void {
    trilho.scrollBy({ left: direcao * trilho.clientWidth, behavior: 'smooth' });
  }

  protected aoRolarProdutos(trilho: HTMLElement): void {
    this.noInicioProdutos.set(trilho.scrollLeft <= 4);
    this.noFimProdutos.set(trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4);
  }

  protected alternarReserva(produto: ProdutoAgendaPublica): void {
    this.reservados.update((ids) => alternarItem(ids, produto.id));
  }

  protected precoDoProduto(produto: ProdutoAgendaPublica): string {
    if (produto.preco === null) {
      return '';
    }
    return (produto.precoAPartirDe ? 'a partir de ' : '') + formatarReal(Number(produto.preco));
  }

  /** "R$ 40,00", "a partir de R$ 40,00" ou "Sob consulta". */
  protected precoServico(servico: ServicoAgenda): string {
    if (servico.preco == null) return 'Sob consulta';
    return (servico.precoAPartirDe ? 'a partir de ' : '') + formatarReal(Number(servico.preco));
  }

  protected real(valor: number): string {
    return formatarReal(valor);
  }

  /** "Lucas Silva" -> "LS" (quando o profissional não tem foto). */
  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  protected escolherProfissional(id: string): void {
    this.profissionalEscolhido.set(id);
    this.horaSelecionada.set(null);
    void this.buscarHorarios();
  }

  protected escolherDia(data: string): void {
    this.diaSelecionado.set(data);
    this.horaSelecionada.set(null);
  }

  protected escolherHora(hora: string): void {
    this.horaSelecionada.set(hora);
  }

  protected digitarNome(evento: Event): void {
    this.nome.set((evento.target as HTMLInputElement).value.slice(0, 60));
  }

  private async carregar(): Promise<void> {
    try {
      this.agenda.set(await this.lojaPublicaService.buscarAgenda(this.slug()));
      this.situacao.set('pronta');
    } catch {
      this.situacao.set('erro');
    }
  }

  /** Mudou o serviço (e a duração): busca de novo os horários em que ele cabe. */
  private async buscarHorarios(): Promise<void> {
    const ids = this.escolhidos();
    const busca = ++this.buscaAtual;
    if (ids.length === 0) {
      this.dias.set([]);
      this.diaSelecionado.set(null);
      return;
    }
    this.carregandoHorarios.set(true);
    try {
      const escolhido = this.profissionalEscolhido();
      const profissional = this.comProfissionais() && escolhido !== 'qualquer' ? escolhido : null;
      const dias = await this.lojaPublicaService.buscarHorarios(this.slug(), ids, profissional);
      if (busca !== this.buscaAtual) {
        return;
      }
      this.dias.set(dias);
      // mantém o dia escolhido se ainda tiver vaga; senão vai para o primeiro dia livre
      const atual = dias.find((d) => d.data === this.diaSelecionado() && d.horarios.length > 0);
      this.diaSelecionado.set(atual?.data ?? dias.find((d) => d.horarios.length > 0)?.data ?? null);
    } catch {
      if (busca === this.buscaAtual) {
        this.dias.set([]);
        this.diaSelecionado.set(null);
      }
    } finally {
      if (busca === this.buscaAtual) {
        this.carregandoHorarios.set(false);
      }
    }
  }
}
