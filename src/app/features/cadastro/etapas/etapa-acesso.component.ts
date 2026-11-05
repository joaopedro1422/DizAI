import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { formatarTelefone } from '../../../core/utils/texto.utils';
import { campoComErro } from '../../../core/utils/validadores';
import { GrupoAcesso, TAMANHO_MINIMO_SENHA } from '../cadastro-formulario';

/** Passo 2: WhatsApp do negócio (também é o login) e senha de acesso com confirmação. */
@Component({
  selector: 'app-etapa-acesso',
  imports: [ReactiveFormsModule],
  templateUrl: './etapa-acesso.component.html',
  styleUrl: './etapa.css',
})
export class EtapaAcessoComponent {
  readonly grupo = input.required<GrupoAcesso>();

  protected readonly tamanhoMinimoSenha = TAMANHO_MINIMO_SENHA;
  protected readonly mostrarSenha = signal(false);

  protected temErro(campo: 'whatsapp' | 'senha' | 'confirmacaoSenha'): boolean {
    return campoComErro(this.grupo().controls[campo]);
  }

  /** A diferença entre as senhas só aparece depois que a confirmação foi preenchida. */
  protected senhasDiferentes(): boolean {
    const confirmacao = this.grupo().controls.confirmacaoSenha;
    return this.grupo().hasError('senhasDiferentes') && (confirmacao.touched || confirmacao.dirty);
  }

  protected formatarWhatsapp(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.grupo().controls.whatsapp.setValue(formatarTelefone(campo.value));
  }

  protected alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }
}
