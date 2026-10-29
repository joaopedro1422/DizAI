import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensagemDoErro } from '../../core/api/erro-api';
import { AutenticacaoService } from '../../core/auth/autenticacao.service';
import { formatarTelefone } from '../../core/utils/texto.utils';
import { campoComErro, telefoneValido } from '../../core/utils/validadores';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { PainelMarcaComponent } from '../../shared/components/painel-marca/painel-marca.component';
import { EsqueciSenhaComponent } from './esqueci-senha/esqueci-senha.component';

/** Login de quem já tem conta. */
@Component({
  selector: 'app-entrar-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconeComponent,
    LogoComponent,
    PainelMarcaComponent,
    CarregandoComponent,
    BottomSheetComponent,
    EsqueciSenhaComponent,
  ],
  templateUrl: './entrar-page.component.html',
  styleUrl: './entrar-page.component.css',
})
export class EntrarPageComponent {
  private readonly router = inject(Router);
  private readonly autenticacaoService = inject(AutenticacaoService);

  /** Vem da URL (/entrar?sessaoExpirada=1) quando o token venceu no meio do uso. */
  readonly sessaoExpirada = input<string>();

  protected readonly entrando = signal(false);
  /** Erro do login (senha errada, sem conexão...), mostrado acima do botão. */
  protected readonly erroLogin = signal<string | null>(null);
  /** Janela do "Esqueci minha senha". */
  protected readonly esqueciSenha = signal(false);

  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    whatsapp: ['', [Validators.required, telefoneValido]],
    senha: ['', Validators.required],
  });

  protected temErro(campo: 'whatsapp' | 'senha'): boolean {
    return campoComErro(this.formulario.controls[campo]);
  }

  protected formatarWhatsapp(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.formulario.controls.whatsapp.setValue(formatarTelefone(campo.value));
  }

  protected async entrar(): Promise<void> {
    if (this.entrando()) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.entrando.set(true);
    this.erroLogin.set(null);
    try {
      const { whatsapp, senha } = this.formulario.getRawValue();
      const caminhoPainel = await this.autenticacaoService.entrar(whatsapp, senha);
      await this.router.navigateByUrl(caminhoPainel);
    } catch (erro) {
      this.erroLogin.set(mensagemDoErro(erro, 'Não foi possível entrar. Tente de novo.'));
    } finally {
      this.entrando.set(false);
    }
  }
}
