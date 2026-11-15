import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { AgendaLotadaService, PeriodoLotado } from '../../../core/services/agenda-lotada.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AlvoTourDirective } from '../../painel/onboarding/alvo-tour.directive';

interface DiaCalendario {
  iso: string;
  numero: number;
  passado: boolean;
  hoje: boolean;
}

interface MesCalendario {
  chave: string;
  titulo: string;
  /** Os dias, com null nos espaços antes do dia 1 (a semana começa no domingo). */
  dias: (DiaCalendario | null)[];
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "AAAA-MM-DD" na hora local (o toISOString passaria para UTC). */
function iso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function deIso(texto: string): Date {
  const [a, m, d] = texto.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function curta(texto: string): string {
  const [, m, d] = texto.split('-');
  return `${d}/${m}`;
}

function diasEntre(inicio: string, fim: string): number {
  return Math.round((deIso(fim).getTime() - deIso(inicio).getTime()) / 86_400_000) + 1;
}

/** "Dezembro inteiro", "Sábado, 21/11", "20/11 a 23/11" (o mesmo jeito que o assistente fala). */
export function descreverPeriodo(p: { inicio: string; fim: string }): string {
  const inicio = deIso(p.inicio);
  const fim = deIso(p.fim);
  const ultimoDoMes = new Date(fim.getFullYear(), fim.getMonth() + 1, 0).getDate();
  if (inicio.getDate() === 1 && fim.getDate() === ultimoDoMes) {
    const meses: string[] = [];
    for (let m = new Date(inicio); m <= fim; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) meses.push(MESES[m.getMonth()]);
    const nomes = meses.length === 1 ? meses[0] : `${meses.slice(0, -1).join(', ')} e ${meses[meses.length - 1]}`;
    return `${nomes[0].toUpperCase()}${nomes.slice(1)} ${meses.length === 1 ? 'inteiro' : 'inteiros'}`;
  }
  if (p.inicio === p.fim) {
    const dia = DIAS_SEMANA[inicio.getDay()];
    return `${dia[0].toUpperCase()}${dia.slice(1)}, ${curta(p.inicio)}`;
  }
  return `${curta(p.inicio)} a ${curta(p.fim)}`;
}

/**
 * Pedidos → "Restringir agenda": um calendário grande para marcar o início e o fim de cada período em que a loja não
 * aceita mais pedidos (dois meses lado a lado no computador), atalhos de mês inteiro e a lista dos períodos. O assistente
 * continua atendendo; só quando a data do pedido cai num período ele avisa que a agenda está lotada.
 */
@Component({
  selector: 'app-restringir-agenda',
  imports: [IconeComponent, CarregandoComponent, AlvoTourDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './restringir-agenda.component.html',
  styleUrl: './restringir-agenda.component.css',
})
export class RestringirAgendaComponent implements OnInit {
  private readonly servico = inject(AgendaLotadaService);
  private readonly toast = inject(ToastService);

  protected readonly diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly periodos = signal<PeriodoLotado[]>([]);

  private readonly hoje = iso(new Date());
  /** O primeiro mês à vista (no computador aparecem ele e o seguinte). */
  protected readonly mesBase = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  protected readonly inicio = signal<string | null>(null);
  protected readonly fim = signal<string | null>(null);
  protected readonly passando = signal<string | null>(null);

  protected readonly podeVoltar = computed(() => {
    const agora = new Date();
    return this.mesBase() > new Date(agora.getFullYear(), agora.getMonth(), 1);
  });

  protected readonly meses = computed<MesCalendario[]>(() => [0, 1].map((n) => this.montarMes(n)));

  /** Os próximos 6 meses para o atalho "mês inteiro" (o atual, de hoje até o fim). */
  protected readonly atalhosMeses = computed(() => {
    const agora = new Date();
    return Array.from({ length: 6 }, (_, n) => {
      const primeiro = new Date(agora.getFullYear(), agora.getMonth() + n, 1);
      const ultimo = new Date(agora.getFullYear(), agora.getMonth() + n + 1, 0);
      const inicio = n === 0 ? this.hoje : iso(primeiro);
      const fim = iso(ultimo);
      const nome = MESES[primeiro.getMonth()];
      const restringido = this.periodos().some((p) => p.inicio <= inicio && p.fim >= fim);
      return { chave: fim, rotulo: `${nome[0].toUpperCase()}${nome.slice(1)}`, inicio, fim, restringido };
    });
  });

  /** O que está selecionado agora, para a barra de baixo. */
  protected readonly selecao = computed(() => {
    const inicio = this.inicio();
    if (!inicio) return null;
    const fim = this.fim() ?? inicio;
    return { inicio, fim, texto: descreverPeriodo({ inicio, fim }), dias: diasEntre(inicio, fim) };
  });

  protected readonly lista = computed(() =>
    this.periodos().map((p) => ({ ...p, texto: descreverPeriodo(p), datas: `${curta(p.inicio)} a ${curta(p.fim)}`, dias: diasEntre(p.inicio, p.fim) })),
  );

  async ngOnInit(): Promise<void> {
    try {
      this.periodos.set(await this.servico.listar());
    } catch {
      this.erro.set(ERRO_AO_CARREGAR);
    } finally {
      this.carregando.set(false);
    }
  }

  protected mudarMes(passo: number): void {
    const base = this.mesBase();
    this.mesBase.set(new Date(base.getFullYear(), base.getMonth() + passo, 1));
  }

  /** 1º toque: o início; 2º: o fim (antes do início, vira o novo início); com os dois marcados, recomeça. */
  protected tocar(dia: DiaCalendario): void {
    if (dia.passado) return;
    const inicio = this.inicio();
    if (!inicio || this.fim()) {
      this.inicio.set(dia.iso);
      this.fim.set(null);
    } else if (dia.iso < inicio) {
      this.inicio.set(dia.iso);
    } else {
      this.fim.set(dia.iso);
    }
  }

  protected escolherMes(atalho: { inicio: string; fim: string }): void {
    this.inicio.set(atalho.inicio);
    this.fim.set(atalho.fim);
    const [a, m] = atalho.inicio.split('-').map(Number);
    this.mesBase.set(new Date(a, m - 1, 1));
  }

  protected limpar(): void {
    this.inicio.set(null);
    this.fim.set(null);
  }

  protected lotado(diaIso: string): boolean {
    return this.periodos().some((p) => p.inicio <= diaIso && p.fim >= diaIso);
  }

  /** Dentro da seleção (com o fim provisório onde o mouse está, antes do 2º toque). */
  protected selecionado(diaIso: string): boolean {
    const inicio = this.inicio();
    if (!inicio) return false;
    const fim = this.fim() ?? (this.passando() && this.passando()! > inicio ? this.passando()! : inicio);
    return diaIso >= inicio && diaIso <= fim;
  }

  protected ponta(diaIso: string): boolean {
    return diaIso === this.inicio() || diaIso === (this.fim() ?? this.inicio());
  }

  protected async restringir(): Promise<void> {
    const selecao = this.selecao();
    if (!selecao || this.salvando()) return;
    this.salvando.set(true);
    try {
      this.periodos.set(await this.servico.restringir(selecao.inicio, selecao.fim));
      this.limpar();
      this.toast.mostrar(`Agenda restringida: ${selecao.texto}`);
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro));
    } finally {
      this.salvando.set(false);
    }
  }

  protected async liberar(periodo: PeriodoLotado): Promise<void> {
    try {
      this.periodos.set(await this.servico.liberar(periodo.id));
      this.toast.mostrar('Período liberado');
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro));
    }
  }

  private montarMes(deslocamento: number): MesCalendario {
    const base = this.mesBase();
    const primeiro = new Date(base.getFullYear(), base.getMonth() + deslocamento, 1);
    const total = new Date(primeiro.getFullYear(), primeiro.getMonth() + 1, 0).getDate();
    const dias: (DiaCalendario | null)[] = Array.from({ length: primeiro.getDay() }, () => null);
    for (let d = 1; d <= total; d++) {
      const diaIso = iso(new Date(primeiro.getFullYear(), primeiro.getMonth(), d));
      dias.push({ iso: diaIso, numero: d, passado: diaIso < this.hoje, hoje: diaIso === this.hoje });
    }
    const nome = MESES[primeiro.getMonth()];
    return { chave: iso(primeiro), titulo: `${nome[0].toUpperCase()}${nome.slice(1)} de ${primeiro.getFullYear()}`, dias };
  }
}
