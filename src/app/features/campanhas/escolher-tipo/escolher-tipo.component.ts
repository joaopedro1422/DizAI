import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TipoCampanha, TipoDisponivel } from '../../../core/models/campanha.model';

/** O recado de exemplo de cada tipo e quando usar, por ramo (o lojista escolhe vendo a mensagem, não uma descrição). */
const EXEMPLOS: Record<'servico' | 'produto', Partial<Record<TipoCampanha, { recado: string; quando: string }>>> = {
  servico: {
    CONVITE: { recado: 'Abriram horários para amanhã, entre 14:00 e 17:30. Quer garantir o seu?', quando: 'Para a agenda com buracos' },
    PROMOCAO: { recado: 'Temos uma condição especial: 15% na manutenção do gel.', quando: 'Para movimentar um dia fraco' },
    NOVIDADE: { recado: 'Temos novidade por aqui: o novo spa dos pés.', quando: 'Serviço, técnica ou espaço novo' },
    DATA_ESPECIAL: { recado: 'Estamos nos preparando para o Natal e a agenda já está aberta.', quando: 'Fim de ano, Carnaval, São João' },
  },
  produto: {
    PROMOCAO: { recado: 'Temos uma condição especial: cento de salgados por R$ 75.', quando: 'Para girar o estoque ou a semana' },
    NOVIDADE: { recado: 'Temos novidade por aqui: o bolo de pistache.', quando: 'Sabor, peça ou coleção nova' },
    CONVITE: { recado: 'Estamos com encomendas abertas para este fim de semana.', quando: 'Para encher a produção' },
    DATA_ESPECIAL: { recado: 'Estamos nos preparando para a Páscoa e já aceitamos encomendas.', quando: 'Páscoa, Mães, Natal' },
  },
};

/**
 * "Nova campanha": os tipos como o recado que chega no WhatsApp do cliente (balão sobre os pontinhos da marca), com
 * o número em gema e o nome em Bricolage. Indisponível mostra o motivo no lugar do "quando usar".
 */
@Component({
  selector: 'app-escolher-tipo',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escolher-tipo.component.html',
  styleUrl: './escolher-tipo.component.css',
})
export class EscolherTipoComponent {
  readonly tipos = input.required<TipoDisponivel[]>();
  readonly servico = input.required<boolean>();
  /** O que impede todos (sem WhatsApp, poucos clientes); null = liberado. */
  readonly bloqueio = input<string | null>(null);
  /** Para onde o aviso leva (ex.: conectar o WhatsApp); null = sem link. */
  readonly rotaBloqueio = input<string | null>(null);
  readonly escolher = output<TipoDisponivel>();

  protected readonly cartoes = computed(() => {
    const exemplos = EXEMPLOS[this.servico() ? 'servico' : 'produto'];
    // Data especial sempre primeiro (é a que o lojista mais procura); os outros na ordem de sempre
    const ordenados = [...this.tipos()].sort(
      (a, b) => Number(b.tipo === 'DATA_ESPECIAL') - Number(a.tipo === 'DATA_ESPECIAL'),
    );
    return ordenados.map((tipo, i) => ({
      tipo,
      numero: String(i + 1).padStart(2, '0'),
      recado: exemplos[tipo.tipo]?.recado ?? tipo.descricao,
      quando: tipo.disponivel ? (exemplos[tipo.tipo]?.quando ?? '') : (tipo.motivo ?? ''),
      livre: tipo.disponivel && !this.bloqueio(),
    }));
  });
}
