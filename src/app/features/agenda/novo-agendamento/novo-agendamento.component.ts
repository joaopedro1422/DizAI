import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NovoAgendamento } from '../../../core/models/agenda.model';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { alternarItem } from '../../../core/utils/colecao.utils';
import { formatarDuracao, hojeIso } from '../../../core/utils/datas-agenda';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

/**
 * Agendamento que o lojista cadastra à mão (cliente do Instagram, do balcão…).
 * Escolher os serviços preenche a duração; o WhatsApp é opcional, mas com ele o cliente
 * pode remarcar ou cancelar falando com o assistente.
 */
@Component({
  selector: 'app-novo-agendamento',
  imports: [ReactiveFormsModule, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="formulario" [formGroup]="formulario" (ngSubmit)="salvar()" novalidate>
      <div class="campo">
        <span class="campo__rotulo">Serviço</span>
        @if (servicos().length > 0) {
          <div class="grupo-chips" role="group" aria-label="Serviços">
            @for (servico of servicos(); track servico.id) {
              @let escolhido = escolhidos().includes(servico.id);
              <button type="button" class="chip" [class.chip--ativo]="escolhido" [attr.aria-pressed]="escolhido" (click)="alternarServico(servico)">
                {{ servico.nome }} <span class="chip__duracao">{{ duracao(servico.duracaoMinutos!) }}</span>
              </button>
            }
          </div>
        }
        <input class="campo__entrada" type="text" formControlName="servicos" placeholder="Ou escreva o serviço" aria-label="Serviço">
        @if (temErro('servicos')) {
          <span class="campo__erro" role="alert">Escolha ou escreva o serviço.</span>
        }
      </div>

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
        <label for="agendamento-nome" class="campo__rotulo">Nome do cliente</label>
        <input id="agendamento-nome" class="campo__entrada" type="text" formControlName="nomeCliente" placeholder="Ex.: Maria Souza">
        @if (temErro('nomeCliente')) {
          <span class="campo__erro" role="alert">Informe o nome do cliente.</span>
        }
      </div>

      <div class="campo">
        <label for="agendamento-whatsapp" class="campo__rotulo">WhatsApp do cliente <span class="campo__rotulo-opcional">(opcional)</span></label>
        <input id="agendamento-whatsapp" class="campo__entrada" type="tel" inputmode="tel" formControlName="whatsapp" placeholder="(83) 99999-0000">
        <span class="campo__dica">Com o número, o cliente pode remarcar ou cancelar falando com o assistente.</span>
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

    .chip__duracao {
      margin-left: 4px;
      font-size: 11px;
      opacity: 0.75;
    }

    .linha-duracao {
      max-width: 160px;
    }
  `,
})
export class NovoAgendamentoComponent implements OnInit {
  /** Dia que estava aberto na agenda. */
  readonly dataInicial = input(hojeIso());
  readonly salvando = input(false);
  readonly salvo = output<NovoAgendamento>();

  private readonly fb = inject(FormBuilder);
  private readonly produtos = inject(ProdutoService).produtos;

  protected readonly hoje = hojeIso();
  protected readonly servicos = computed(() =>
    this.produtos().filter((p) => p.disponivel && p.duracaoMinutos),
  );
  protected readonly escolhidos = signal<number[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    servicos: ['', [Validators.required, Validators.maxLength(300)]],
    data: ['', Validators.required],
    hora: ['', Validators.required],
    duracaoMinutos: ['60', [Validators.required, Validators.pattern(/^\d{1,3}$/), Validators.min(5), Validators.max(720)]],
    nomeCliente: ['', [Validators.required, Validators.maxLength(100)]],
    whatsapp: [''],
  });

  ngOnInit(): void {
    this.formulario.controls.data.setValue(this.dataInicial());
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
    this.formulario.patchValue({
      servicos: escolhidos.map((s) => s.nome).join(' + '),
      duracaoMinutos: String(escolhidos.reduce((total, s) => total + (s.duracaoMinutos ?? 0), 0)),
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
    });
  }
}
