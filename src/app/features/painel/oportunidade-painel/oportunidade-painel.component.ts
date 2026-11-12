import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { ContatoSugerido, ICONE_DO_TIPO, Oportunidade } from '../../../core/models/campanha.model';
import { CampanhaService } from '../../../core/services/campanha.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { ContatoIndividualComponent } from '../../campanhas/contato-individual/contato-individual.component';

/**
 * A oportunidade mais forte que o DizAI encontrou agora (horários livres amanhã, uma data especial chegando...), em
 * destaque no painel. Uma por vez; "Agora não" some com ela. Sem campanha para sugerir, uma cliente para chamar uma a
 * uma (contato individual; abre no celular do lojista, então funciona mesmo sem o WhatsApp conectado).
 */
@Component({
  selector: 'app-oportunidade-painel',
  imports: [RouterLink, IconeComponent, ContatoIndividualComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (oportunidade(); as op) {
      <article class="oportunidade" aria-label="Oportunidade">
        <span class="oportunidade__icone"><app-icone [nome]="icones[op.tipo]" [tamanho]="22" [espessura]="2" /></span>
        <div class="oportunidade__textos">
          <span class="oportunidade__selo">{{ demonstracao() ? 'Oportunidade · exemplo' : 'Oportunidade' }}</span>
          <h2 class="oportunidade__titulo">{{ op.titulo }}</h2>
          <p class="oportunidade__descricao">{{ op.descricao }}</p>
          <div class="oportunidade__acoes">
            <a class="btn btn--primario btn--pequeno oportunidade__ver" [routerLink]="rota()" [queryParams]="{ oportunidade: op.chave }">
              Ver campanha
            </a>
            <button type="button" class="oportunidade__depois" (click)="dispensar(op)">Agora não</button>
          </div>
        </div>
      </article>
    } @else if (contato()) {
      <!-- sem campanha para sugerir: uma cliente para chamar com a mensagem pronta -->
      <app-contato-individual class="oportunidade-contato" [contato]="contato()!" [escuro]="true"
        (chamado)="contato.set(null)" (dispensado)="contato.set(null)" />
    }
  `,
  styles: `
    .oportunidade {
      display: flex;
      gap: 14px;
      padding: 18px;
      border-radius: var(--raio-grande);
      background: var(--fundo-marca);
      color: #ffffff;
      box-shadow: var(--sombra-card);
    }
    .oportunidade__icone {
      display: grid;
      flex: none;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.12);
      color: var(--cor-gema);
    }
    .oportunidade__textos { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .oportunidade__selo {
      align-self: flex-start;
      padding: 2px 9px;
      border-radius: var(--raio-pilula);
      background: var(--cor-gema);
      color: var(--cor-noite);
      font-size: 11px;
      font-weight: 800;
    }
    .oportunidade__titulo { margin: 0; font-family: var(--fonte-titulo); font-size: 19px; font-weight: 700; line-height: 1.25; }
    .oportunidade__descricao { margin: 0; color: rgba(255, 255, 255, 0.86); font-size: 14px; line-height: 1.45; }
    .oportunidade__acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 8px; }
    .oportunidade__ver { background: #ffffff; color: var(--cor-noite); }
    .oportunidade__ver:hover { background: var(--cor-gema-clara); }
    .oportunidade__depois {
      padding: 6px 2px;
      border: 0;
      background: none;
      color: rgba(255, 255, 255, 0.8);
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .oportunidade__depois:hover { color: #ffffff; text-decoration: underline; }
  `,
})
export class OportunidadePainelComponent implements OnInit {
  private readonly campanhaService = inject(CampanhaService);
  private readonly perfil = inject(PerfilService).perfil;
  private readonly rotas = inject(SessaoService).rotasDoPainel;

  protected readonly oportunidade = signal<Oportunidade | null>(null);
  protected readonly contato = signal<ContatoSugerido | null>(null);
  protected readonly rota = computed(() => this.rotas().campanhas);
  protected readonly icones = ICONE_DO_TIPO;
  protected readonly demonstracao = this.campanhaService.demonstracao;

  ngOnInit(): void {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    const lista = this.perfil().whatsappConectado || this.demonstracao()
      ? await this.campanhaService.oportunidades().catch(() => [] as Oportunidade[])
      : [];
    if (lista.length > 0) {
      this.oportunidade.set(lista[0]);
      return;
    }
    const individuais = await this.campanhaService.individuais().catch(() => null);
    this.contato.set(individuais?.sugeridos[0] ?? null);
  }

  protected dispensar(op: Oportunidade): void {
    this.oportunidade.set(null);
    void this.campanhaService.dispensar(op.chave).catch(() => undefined);
  }
}
