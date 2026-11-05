import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { AutenticacaoService } from '../../../core/auth/autenticacao.service';
import { formatarTelefone } from '../../../core/utils/texto.utils';
import { campoComErro, telefoneValido } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

@Component({
  selector: 'app-esqueci-senha',
  imports: [ReactiveFormsModule, CarregandoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.css',
})
export class EsqueciSenhaComponent implements OnInit {
  /** O número que já estava digitado no login. */
  readonly whatsappInicial = input('');
  readonly fechar = output<void>();

  private readonly autenticacaoService = inject(AutenticacaoService);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    whatsapp: ['', [Validators.required, telefoneValido]],
    nome: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.formulario.controls.whatsapp.setValue(this.whatsappInicial());
  }

  protected temErro(campo: 'whatsapp' | 'nome'): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected formatarWhatsapp(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.formulario.controls.whatsapp.setValue(formatarTelefone(campo.value));
  }

  protected async enviar(): Promise<void> {
    if (this.enviando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set(null);
    try {
      const { whatsapp, nome } = this.formulario.getRawValue();
      await this.autenticacaoService.pedirNovaSenha(whatsapp, nome.trim());
      this.enviado.set(true);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível enviar o pedido. Tente de novo.'));
    } finally {
      this.enviando.set(false);
    }
  }
}
