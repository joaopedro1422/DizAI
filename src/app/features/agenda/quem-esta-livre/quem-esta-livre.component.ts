import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';

import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { DisponibilidadeProfissional } from '../../../core/models/agenda.model';
import { Produto } from '../../../core/models/produto.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { deIso, diaPorExtenso, minutosDoDia } from '../../../core/utils/datas-agenda';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { SeletorServicoComponent } from '../seletor-servico/seletor-servico.component';

/** Sem serviço escolhido, a consulta usa o intervalo da agenda (ou 30 min). */
const DURACAO_PADRAO = 30;
const DIAS_SEMANA = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/** O que o "Agendar com…" leva para o "Agendar horário". */
export interface EscolhaQuemEstaLivre {
  hora: string;
  profissionalId: string;
  servicoId: number | null;
}

@Component({
  selector: 'app-quem-esta-livre',
  imports: [CarregandoComponent, SeletorServicoComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="consulta">
      <p class="consulta__dia">{{ diaTexto() }}</p>

      <div class="campo">
        <span class="campo__rotulo">Horário</span>
        @if (horarios().length > 0) {
          <div class="horas" role="radiogroup" aria-label="Horário">
            @for (h of horarios(); track h) {
              <button type="button" role="radio" class="hora" [class.hora--ativa]="hora() === h" [attr.aria-checked]="hora() === h" (click)="escolherHora(h)">{{ h }}</button>
            }
          </div>
        } @else {
          <p class="consulta__aviso">Você não atende neste dia. Escolha outro dia na agenda.</p>
        }
      </div>

      <div class="campo">
        <span class="campo__rotulo">Serviço <span class="campo__rotulo-opcional">(opcional, define a duração)</span></span>
        <app-seletor-servico
          [servicos]="servicos()"
          [escolhidos]="servico() ? [servico()!.id] : []"
          textoVazio="Qualquer serviço (30 min)"
          (escolher)="escolherServico($event)"
        />
      </div>

      @if (carregando()) {
        <app-carregando modo="inline" [tamanho]="22" />
      } @else if (resultado().length > 0) {
        <ul class="resultado" aria-live="polite">
          @for (item of resultado(); track item.profissionalId) {
            <li class="pessoa" [class.pessoa--livre]="item.situacao === 'LIVRE'">
              @if (item.fotoUrl) {
                <img class="pessoa__foto" [src]="item.fotoUrl | urlImagem" alt="">
              } @else {
                <span class="pessoa__foto pessoa__foto--iniciais" aria-hidden="true">{{ iniciais(item.nome) }}</span>
              }
              <span class="pessoa__textos">
                <span class="pessoa__nome">{{ item.nome }}</span>
                <span class="pessoa__situacao" [class]="'pessoa__situacao pessoa__situacao--' + item.situacao.toLowerCase()">{{ textoSituacao(item) }}</span>
              </span>
              @if (item.situacao === 'LIVRE') {
                <button type="button" class="btn btn--primario btn--pequeno" (click)="agendar(item)">Agendar</button>
              }
            </li>
          }
        </ul>
      } @else if (hora()) {
        <p class="consulta__aviso">Nenhum profissional cadastrado.</p>
      } @else if (horarios().length > 0) {
        <p class="consulta__aviso">Escolha um horário para ver quem está livre.</p>
      }
    </div>
  `,
  styles: `
    .consulta {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .consulta__dia {
      font-size: 14px;
      font-weight: 700;
      color: var(--cor-texto-secundario);
    }

    .consulta__dia::first-letter {
      text-transform: uppercase;
    }

    .consulta__aviso {
      font-size: 13.5px;
      color: var(--cor-texto-suave);
    }

    .horas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
      gap: 6px;
      max-height: 168px;
      overflow-y: auto;
    }

    .hora {
      min-height: 40px;
      border: 1.5px solid var(--cor-borda);
      border-radius: 11px;
      background: var(--cor-fundo);
      color: var(--cor-texto);
      font: inherit;
      font-size: 14px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
    }

    .hora--ativa {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria);
      color: #ffffff;
    }

    .resultado {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pessoa {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border: 1.5px solid var(--cor-borda-suave);
      border-radius: 14px;
      background: var(--cor-fundo-suave);
    }

    .pessoa--livre {
      border-color: #bfe3cc;
      background: #eef8f2;
    }

    .pessoa__foto {
      flex: none;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
    }

    .pessoa__foto--iniciais {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--cor-primaria-clara);
      color: var(--cor-primaria);
      font-size: 14px;
      font-weight: 800;
    }

    .pessoa__textos {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .pessoa__nome {
      font-size: 15px;
      font-weight: 700;
    }

    .pessoa__situacao {
      font-size: 13px;
      color: var(--cor-texto-suave);
    }

    .pessoa__situacao--livre {
      font-weight: 700;
      color: var(--cor-ativo);
    }

    .pessoa__situacao--ocupado {
      color: var(--cor-erro);
    }
  `,
})
export class QuemEstaLivreComponent {
  private readonly agendaService = inject(AgendaService);
  private readonly produtos = inject(ProdutoService).produtos;

  /** Dia aberto na agenda ("AAAA-MM-DD"). */
  readonly data = input.required<string>();
  readonly escolhido = output<EscolhaQuemEstaLivre>();

  protected readonly hora = signal<string | null>(null);
  protected readonly servico = signal<Produto | null>(null);
  protected readonly resultado = signal<DisponibilidadeProfissional[]>([]);
  protected readonly carregando = signal(false);
  private buscaAtual = 0;

  protected readonly servicos = computed(() =>
    this.produtos().filter((p) => p.disponivel && !p.produtoAVenda && p.duracaoMinutos),
  );
  protected readonly diaTexto = computed(() => diaPorExtenso(this.data()));

  /** Os horários do dia: do começo de cada período até o fim, de intervalo em intervalo (como na página pública). */
  protected readonly horarios = computed(() => {
    const config = this.agendaService.configuracao();
    if (!config || config.diasBloqueados.includes(this.data())) return [];
    const dia = DIAS_SEMANA[deIso(this.data()).getDay()];
    const passo = config.intervaloMinutos || DURACAO_PADRAO;
    const horas: string[] = [];
    for (const periodo of config.periodos.filter((p) => p.diaSemana === dia)) {
      for (let m = minutosDoDia(periodo.inicio); m < minutosDoDia(periodo.fim); m += passo) {
        horas.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
      }
    }
    return [...new Set(horas)].sort();
  });

  protected escolherHora(hora: string): void {
    this.hora.set(hora);
    void this.consultar();
  }

  protected escolherServico(servico: Produto): void {
    this.servico.update((atual) => (atual?.id === servico.id ? null : servico));
    void this.consultar();
  }

  protected agendar(item: DisponibilidadeProfissional): void {
    const hora = this.hora();
    if (hora) {
      this.escolhido.emit({ hora, profissionalId: item.profissionalId, servicoId: this.servico()?.id ?? null });
    }
  }

  protected textoSituacao(item: DisponibilidadeProfissional): string {
    switch (item.situacao) {
      case 'LIVRE':
        return 'Livre';
      case 'OCUPADO':
        return `Ocupado${item.ocupadoCom ? ' com ' + item.ocupadoCom : ''}${item.ocupadoAte ? ' até ' + item.ocupadoAte : ''}`;
      case 'FOLGA':
        return 'Folga neste dia';
      default:
        return 'Fora do horário de atendimento';
    }
  }

  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  private async consultar(): Promise<void> {
    const hora = this.hora();
    if (!hora) return;
    const duracao = this.servico()?.duracaoMinutos ?? (this.agendaService.configuracao()?.intervaloMinutos || DURACAO_PADRAO);
    const busca = ++this.buscaAtual;
    this.carregando.set(true);
    try {
      const resultado = await this.agendaService.disponibilidade(this.data(), hora, duracao);
      if (busca === this.buscaAtual) this.resultado.set(resultado);
    } catch {
      if (busca === this.buscaAtual) this.resultado.set([]);
    } finally {
      if (busca === this.buscaAtual) this.carregando.set(false);
    }
  }
}
