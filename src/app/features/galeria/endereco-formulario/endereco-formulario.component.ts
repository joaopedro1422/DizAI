import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';

/** Resposta do ViaCEP (https://viacep.com.br/ws/{cep}/json/); erro = CEP que não existe. */
interface RespostaViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

@Component({
  selector: 'app-endereco-formulario',
  imports: [ReactiveFormsModule, CarregandoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="endereco" [formGroup]="formulario">
      <div class="linha linha--cep">
        <div class="campo">
          <label for="endereco-cep" class="campo__rotulo">CEP</label>
          <input id="endereco-cep" class="campo__entrada" inputmode="numeric" maxlength="9" placeholder="00000-000" formControlName="cep" (input)="aoDigitarCep($event)">
        </div>
        @if (buscando()) {
          <app-carregando modo="inline" [tamanho]="20" />
        }
      </div>
      @if (erroCep()) {
        <span class="campo__erro" role="alert">{{ erroCep() }}</span>
      }

      <div class="campo">
        <label for="endereco-rua" class="campo__rotulo">Rua</label>
        <input id="endereco-rua" class="campo__entrada" formControlName="rua" placeholder="Ex.: Rua das Flores">
      </div>
      <div class="linha">
        <div class="campo">
          <label for="endereco-numero" class="campo__rotulo">Número</label>
          <input id="endereco-numero" class="campo__entrada" formControlName="numero" placeholder="Ex.: 123">
        </div>
        <div class="campo">
          <label for="endereco-complemento" class="campo__rotulo">Complemento <span class="campo__rotulo-opcional">(opcional)</span></label>
          <input id="endereco-complemento" class="campo__entrada" formControlName="complemento" placeholder="Ex.: Sala 2">
        </div>
      </div>
      <div class="campo">
        <label for="endereco-bairro" class="campo__rotulo">Bairro</label>
        <input id="endereco-bairro" class="campo__entrada" formControlName="bairro">
      </div>
      <div class="linha linha--cidade">
        <div class="campo">
          <label for="endereco-cidade" class="campo__rotulo">Cidade</label>
          <input id="endereco-cidade" class="campo__entrada" formControlName="cidade">
        </div>
        <div class="campo">
          <label for="endereco-uf" class="campo__rotulo">UF</label>
          <input id="endereco-uf" class="campo__entrada" maxlength="2" formControlName="uf">
        </div>
      </div>
    </div>
  `,
  styles: `
    .endereco {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .linha {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px;
      align-items: end;
    }

    .linha--cep {
      grid-template-columns: 160px auto;
      justify-content: start;
    }

    .linha--cidade {
      grid-template-columns: minmax(0, 1fr) 72px;
    }
  `,
})
export class EnderecoFormularioComponent {
  protected readonly formulario = inject(FormBuilder).nonNullable.group({
    cep: [''],
    rua: ['', Validators.required],
    numero: ['', Validators.required],
    complemento: [''],
    bairro: [''],
    cidade: ['', Validators.required],
    uf: [''],
  });
  protected readonly buscando = signal(false);
  protected readonly erroCep = signal<string | null>(null);

  /** O endereço no formato que o Google Maps entende melhor; null enquanto faltar rua, número ou cidade. */
  enderecoCompleto(): string | null {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      return null;
    }
    const { cep, rua, numero, complemento, bairro, cidade, uf } = this.formulario.getRawValue();
    const ruaENumero = `${rua.trim()}, ${numero.trim()}${complemento.trim() ? ' - ' + complemento.trim() : ''}`;
    const local = [bairro.trim(), [cidade.trim(), uf.trim().toUpperCase()].filter(Boolean).join(' - ')].filter(Boolean);
    return [ruaENumero, ...local, cep.trim()].filter(Boolean).join(', ');
  }

  protected aoDigitarCep(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const digitos = entrada.value.replace(/\D/g, '').slice(0, 8);
    const formatado = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
    this.formulario.controls.cep.setValue(formatado, { emitEvent: false });
    entrada.value = formatado;
    this.erroCep.set(null);
    if (digitos.length === 8) {
      void this.buscarCep(digitos);
    }
  }

  private async buscarCep(cep: string): Promise<void> {
    this.buscando.set(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = (await resposta.json()) as RespostaViaCep;
      if (!resposta.ok || dados.erro) {
        this.erroCep.set('CEP não encontrado. Confira ou preencha o endereço à mão.');
        return;
      }
      this.formulario.patchValue({
        rua: dados.logradouro ?? '',
        bairro: dados.bairro ?? '',
        cidade: dados.localidade ?? '',
        uf: dados.uf ?? '',
      });
    } catch {
      this.erroCep.set('Não foi possível buscar o CEP agora. Preencha o endereço à mão.');
    } finally {
      this.buscando.set(false);
    }
  }
}
