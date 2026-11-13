import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';

import { DisponibilidadeProfissional, NovoAgendamento, Profissional } from '../../../core/models/agenda.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { alternarItem } from '../../../core/utils/colecao.utils';
import { formatarDuracao, hojeIso } from '../../../core/utils/datas-agenda';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { SeletorServicoComponent } from '../seletor-servico/seletor-servico.component';
import { SeletorClienteComponent } from '../../../shared/components/seletor-cliente/seletor-cliente.component';

@Component({
  selector: 'app-novo-agendamento',
  imports: [ReactiveFormsModule, CarregandoComponent, SeletorServicoComponent, SeletorClienteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="formulario" [formGroup]="formulario" (ngSubmit)="salvar()" novalidate>
      <div class="campo">
        <span class="campo__rotulo">Serviço</span>
        @if (servicos().length > 0) {
          <!-- um seletor só (com muitos serviços os chips não cabiam); dá para marcar mais de um -->
          <app-seletor-servico [servicos]="servicos()" [escolhidos]="escolhidos()" [multiplo]="true" (escolher)="alternarServico($event)" />
        }
        <input class="campo__entrada" type="text" formControlName="servicos" placeholder="Ou escreva o serviço" aria-label="Serviço">
        @if (temErro('servicos')) {
          <span class="campo__erro" role="alert">Escolha ou escreva o serviço.</span>
        }
      </div>

      @if (profissionais().length > 1) {
        <div class="campo">
          <span class="campo__rotulo">Com quem</span>
          <div class="grupo-chips" role="radiogroup" aria-label="Profissional">
            @for (profissional of profissionais(); track profissional.id) {
              @let ativo = profissionalId() === profissional.id;
              @let situacao = situacaoDe(profissional.id);
              <button
                type="button"
                role="radio"
                class="chip chip--profissional"
                [class.chip--ativo]="ativo"
                [class.chip--indisponivel]="!!situacao && situacao.situacao !== 'LIVRE'"
                [attr.aria-checked]="ativo"
                (click)="profissionalId.set(profissional.id)"
              >
                @if (situacao) {
                  <span class="chip__ponto" [class.chip__ponto--livre]="situacao.situacao === 'LIVRE'" aria-hidden="true"></span>
                }
                {{ profissional.nome }}
                @if (situacao && situacao.situacao !== 'LIVRE') {
                  <span class="chip__situacao">{{ textoSituacao(situacao) }}</span>
                }
              </button>
            }
          </div>
          @if (disponibilidade().length > 0) {
            <span class="campo__dica">Verde: livre</span>
          }
        </div>
      }

      <div class="linha">
        <div class="campo">
          <label for="agendamento-data" class="campo__rotulo">Dia</label>
          <input id="agendamento-data" class="campo__entrada" type="date" formControlName="data" [min]="hoje">
        </div>
        <div class="campo">
          <label for="agendamento-hora" class="campo__rotulo">Horário</label>
          <input id="agendamento-hora" class="campo__entrada" type="time" step="300" formControlName="hora">
        </div>
      </div>
      @if (temErro('data') || temErro('hora')) {
        <span class="campo__erro" role="alert">Escolha o dia e o horário.</span>
      }

      <div class="campo">
        <label for="agendamento-duracao" class="campo__rotulo">Duração</label>
        <span class="campo-prefixado linha-duracao" [class.campo-prefixado--erro]="temErro('duracaoMinutos')">
          <input id="agendamento-duracao" type="text" inputmode="numeric" formControlName="duracaoMinutos">
          <span class="campo-prefixado__prefixo">min</span>
        </span>
        @if (temErro('duracaoMinutos')) {
          <span class="campo__erro" role="alert">Informe a duração em minutos (de 5 a 720).</span>
        }
      </div>

      <div class="campo">
        <label for="agendamento-valor" class="campo__rotulo">Valor <span class="campo__rotulo-opcional">(opcional)</span></label>
        <span class="campo-prefixado linha-duracao" [class.campo-prefixado--erro]="temErro('valor')">
          <span class="campo-prefixado__prefixo">R$</span>
          <input id="agendamento-valor" type="text" inputmode="decimal" formControlName="valor" placeholder="0,00">
        </span>
        @if (temErro('valor')) {
          <span class="campo__erro" role="alert">Use só números, por exemplo 70 ou 70,50.</span>
        } @else {
          <span class="campo__dica">Vem com os preços dos serviços escolhidos. Entra nos números da agenda.</span>
        }
      </div>

      <div class="campo">
        <span class="campo__rotulo">Cliente</span>
        <app-seletor-cliente
          dica="Com o número, o cliente pode remarcar ou cancelar falando com o assistente."
          [erro]="temErro('nomeCliente')"
          (mudou)="formulario.patchValue({ nomeCliente: $event.nome, whatsapp: $event.whatsapp })"
        />
      </div>

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
          <app-carregando modo="inline" variante="claro" [tamanho]="22" />
          Agendando…
        } @else {
          Agendar
        }
      </button>
    </form>
  `,
  styles: `
    .formulario {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .linha {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .chip--profissional {
      gap: 6px;
    }

    .chip--indisponivel:not(.chip--ativo) {
      opacity: 0.6;
    }

    .chip__ponto {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cor-borda-forte);
    }

    .chip__ponto--livre {
      background: var(--cor-sucesso);
    }

    .chip__situacao {
      font-size: 11px;
      font-weight: 600;
      opacity: 0.85;
    }

    .linha-duracao {
      max-width: 160px;
    }
  `,
})
export class NovoAgendamentoComponent implements OnInit {
  readonly dataInicial = input(hojeIso());
  readonly salvando = input(false);
  /** Com 2+ profissionais, o lojista escolhe com quem (começa no filtrado na agenda ou no primeiro). */
  readonly profissionais = input<Profissional[]>([]);
  readonly profissionalInicial = input<string | null>(null);
  /** Vindo do "Quem está livre?": o horário e o serviço já escolhidos lá. */
  readonly horaInicial = input<string | null>(null);
  readonly servicoInicialId = input<number | null>(null);
  readonly salvo = output<NovoAgendamento>();

  protected readonly profissionalId = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);
  private readonly destroyRef = inject(DestroyRef);
  /** 2+ profissionais: livre/ocupado de cada um no dia, hora e duração escolhidos (para os chips de "Com quem"). */
  protected readonly disponibilidade = signal<DisponibilidadeProfissional[]>([]);
  private buscaAtual = 0;
  private readonly produtos = inject(ProdutoService).produtos;

  protected readonly hoje = hojeIso();
  protected readonly servicos = computed(() =>
    this.produtos().filter((p) => p.disponivel && !p.produtoAVenda && p.duracaoMinutos),
  );
  protected readonly escolhidos = signal<number[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    servicos: ['', [Validators.required, Validators.maxLength(300)]],
    data: ['', Validators.required],
    hora: ['', Validators.required],
    duracaoMinutos: ['60', [Validators.required, Validators.pattern(/^\d{1,3}$/), Validators.min(5), Validators.max(720)]],
    nomeCliente: ['', [Validators.required, Validators.maxLength(100)]],
    whatsapp: [''],
    valor: ['', Validators.pattern(/^\d{1,7}([.,]\d{1,2})?$/)],
  });

  ngOnInit(): void {
    this.formulario.controls.data.setValue(this.dataInicial());
    this.profissionalId.set(this.profissionalInicial() ?? this.profissionais()[0]?.id ?? null);
    if (this.horaInicial()) {
      this.formulario.controls.hora.setValue(this.horaInicial()!);
    }
    const servicoInicial = this.servicos().find((s) => s.id === this.servicoInicialId());
    if (servicoInicial) {
      this.alternarServico(servicoInicial);
    }
    // com 2+ profissionais, ao mudar dia, hora ou duração os chips mostram quem está livre
    if (this.profissionais().length > 1) {
      this.formulario.valueChanges
        .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => void this.conferirDisponibilidade());
      void this.conferirDisponibilidade();
    }
  }

  protected situacaoDe(profissionalId: string): DisponibilidadeProfissional | undefined {
    return this.disponibilidade().find((d) => d.profissionalId === profissionalId);
  }

  protected textoSituacao(d: DisponibilidadeProfissional): string {
    if (d.situacao === 'OCUPADO') return d.ocupadoAte ? `ocupado até ${d.ocupadoAte}` : 'ocupado';
    if (d.situacao === 'FOLGA') return 'folga';
    return 'fora do horário';
  }

  private async conferirDisponibilidade(): Promise<void> {
    const { data, hora, duracaoMinutos } = this.formulario.getRawValue();
    const minutos = Number(duracaoMinutos);
    if (!data || !/^\d{2}:\d{2}/.test(hora) || !(minutos >= 5)) {
      this.disponibilidade.set([]);
      return;
    }
    const busca = ++this.buscaAtual;
    try {
      const resultado = await this.agendaService.disponibilidade(data, hora.slice(0, 5), minutos);
      if (busca === this.buscaAtual) this.disponibilidade.set(resultado);
    } catch {
      if (busca === this.buscaAtual) this.disponibilidade.set([]);
    }
  }

  protected duracao(minutos: number): string {
    return formatarDuracao(minutos);
  }

  /** Os serviços escolhidos viram o texto ("Manicure + Pedicure") e a duração somada. */
  protected alternarServico(servico: Produto): void {
    this.escolhidos.update((ids) => alternarItem(ids, servico.id));
    const escolhidos = this.servicos().filter((s) => this.escolhidos().includes(s.id));
    if (escolhidos.length === 0) {
      return;
    }
    const comPreco = escolhidos.every((s) => s.preco !== null);
    this.formulario.patchValue({
      servicos: escolhidos.map((s) => s.nome).join(' + '),
      duracaoMinutos: String(escolhidos.reduce((total, s) => total + (s.duracaoMinutos ?? 0), 0)),
      valor: comPreco ? escolhidos.reduce((total, s) => total + Number(s.preco), 0).toFixed(2).replace('.', ',') : '',
    });
  }

  protected temErro(campo: keyof typeof this.formulario.controls): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected salvar(): void {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    this.salvo.emit({
      nomeCliente: valores.nomeCliente.trim(),
      whatsapp: valores.whatsapp.trim(),
      servicos: valores.servicos.trim(),
      data: valores.data,
      hora: valores.hora.slice(0, 5),
      duracaoMinutos: Number(valores.duracaoMinutos),
      profissionalId: this.profissionais().length > 1 ? this.profissionalId() : null,
      valor: valores.valor.trim() === '' ? null : Number(valores.valor.trim().replace(',', '.')),
    });
  }
}
