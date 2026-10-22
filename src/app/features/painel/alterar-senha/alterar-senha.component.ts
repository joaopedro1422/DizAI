import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { PerfilService } from '../../../core/services/perfil.service';
import { campoComErro } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

/** A nova senha e a confirmação precisam ser iguais. */
function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  const nova = grupo.get('novaSenha')?.value;
  const confirmacao = grupo.get('confirmacao')?.value;
  return nova && confirmacao && nova !== confirmacao ? { senhasDiferentes: true } : null;
}

/**
 * "Alterar senha" do painel (menu da conta). Quem entrou com a senha temporária do "Esqueci minha senha"
 * usa ela como senha atual e cria a sua.
 */
@Component({
  selector: 'app-alterar-senha',
  imports: [ReactiveFormsModule, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alterar-senha.component.html',
  styleUrl: './alterar-senha.component.css',
})
export class AlterarSenhaComponent {
  readonly salvo = output<void>();

  private readonly perfilService = inject(PerfilService);

  protected readonly temporaria = this.perfilService.perfil().senhaTemporaria ?? false;
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly formulario = inject(FormBuilder).nonNullable.group(
    {
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacao: ['', Validators.required],
    },
    { validators: senhasIguais },
  );

  protected temErro(campo: 'senhaAtual' | 'novaSenha' | 'confirmacao'): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected confirmacaoDiferente(): boolean {
    return this.formulario.hasError('senhasDiferentes') && this.formulario.controls.confirmacao.touched;
  }

  protected async salvar(): Promise<void> {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);
    try {
      const { senhaAtual, novaSenha } = this.formulario.getRawValue();
      await this.perfilService.alterarSenha(senhaAtual, novaSenha);
      this.salvo.emit();
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível alterar a senha. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
