import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';

import { AgendaPublica, DiaHorarios, ServicoAgenda } from '../../../core/models/agenda.model';
import { LojaPublicaService } from '../../../core/services/loja-publica.service';
import { alternarItem } from '../../../core/utils/colecao.utils';
import { diaPorExtenso, formatarDuracao } from '../../../core/utils/datas-agenda';
import { gerarLinkWhatsapp } from '../../../core/utils/texto.utils';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { FaixaDiasComponent, ItemFaixaDia } from '../../../shared/components/faixa-dias/faixa-dias.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

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
  imports: [IconeComponent, CarregandoComponent, FaixaDiasComponent],
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

  protected readonly servicosEscolhidos = computed(() =>
    (this.agenda()?.servicos ?? []).filter((s) => this.escolhidos().includes(s.id)),
  );
  protected readonly duracaoTotal = computed(() =>
    this.servicosEscolhidos().reduce((total, s) => total + s.duracaoMinutos, 0),
  );
  protected readonly textoServicos = computed(() => this.servicosEscolhidos().map((s) => s.nome).join(' + '));

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
    () => this.escolhidos().length > 0 && !!this.diaSelecionado() && !!this.horaSelecionada(),
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
    const linhas = [
      'Olá! Quero agendar pela agenda online:',
      `Serviço: ${this.textoServicos()}`,
      `Data: ${diaPorExtenso(dia)}`,
      `Horário: ${hora}`,
      `Nome: ${this.nome().trim()}`,
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
      const dias = await this.lojaPublicaService.buscarHorarios(this.slug(), ids);
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
