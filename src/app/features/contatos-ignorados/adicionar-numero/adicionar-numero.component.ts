import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NovoContatoIgnorado } from '../../../core/models/contato.model';
import { ContatoIgnoradoService } from '../../../core/services/contato-ignorado.service';
import { ToastService } from '../../../core/services/toast.service';
import { agendaDoCelularDisponivel, escolherContatosDaAgenda } from '../../../core/utils/agenda-celular';
import { normalizarTelefoneBrasil } from '../../../core/utils/telefone.utils';
import { formatarTelefone } from '../../../core/utils/texto.utils';
import { campoComErro, telefoneValido } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Modal "Adicionar número": digitar à mão ou, no Android, escolher da agenda do celular. */
@Component({
  selector: 'app-adicionar-numero',
  imports: [ReactiveFormsModule, IconeComponent, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './adicionar-numero.component.html',
  styleUrl: './adicionar-numero.component.css',
})
export class AdicionarNumeroComponent {
  readonly salvando = input(false);
  readonly confirmar = output<NovoContatoIgnorado[]>();

  private readonly contatoIgnoradoService = inject(ContatoIgnoradoService);
  private readonly toastService = inject(ToastService);

  protected readonly agendaDisponivel = agendaDoCelularDisponivel();
  protected readonly jaNaLista = signal(false);

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    whatsapp: ['', [Validators.required, telefoneValido]],
    nome: ['', Validators.maxLength(60)],
  });

  protected whatsappComErro(): boolean {
    return campoComErro(this.formulario.controls.whatsapp);
  }

  protected formatarWhatsapp(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.formulario.controls.whatsapp.setValue(formatarTelefone(campo.value));
    this.jaNaLista.set(false);
  }

  protected salvar(): void {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { whatsapp, nome } = this.formulario.getRawValue();
    const numero = normalizarTelefoneBrasil(whatsapp) ?? whatsapp;
    if (this.contatoIgnoradoService.estaIgnorado(numero)) {
      this.jaNaLista.set(true);
      return;
    }
    this.confirmar.emit([{ nome, whatsapp: numero, origem: 'MANUAL' }]);
  }

  protected async escolherDaAgenda(): Promise<void> {
    try {
      const escolhidos = await escolherContatosDaAgenda();
      if (escolhidos.length === 0) {
        this.toastService.mostrar('Nenhum dos contatos escolhidos tinha um número com DDD.');
        return;
      }
      this.confirmar.emit(escolhidos.map((contato) => ({ ...contato, origem: 'AGENDA_CELULAR' as const })));
    } catch {
      // A pessoa fechou a agenda sem escolher: nada a fazer.
    }
  }
}
