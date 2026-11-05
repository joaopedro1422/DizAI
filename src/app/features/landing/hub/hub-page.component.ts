import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CHAVE_TIPO_VISTO, ROTA_LANDING, TipoLanding } from '../conteudo-landing';

/** Uma cena do carrossel de um mundo: a foto, a mensagem do cliente, o cartão do resultado e o aviso que chega. */
interface Cena {
  id: string;
  /** Rótulo da capa provisória enquanto a foto não existe ("Salgados"). */
  rotulo: string;
  foto: string;
  pergunta: string;
  /** Vendas: o resumo do pedido. */
  pedido?: { total: string; linhas: { rotulo: string; valor: string }[] };
  /** Agendamentos: o dia com o horário novo em destaque. */
  agenda?: { dia: string; livres: string; blocos: { hora: string; texto: string; novo?: boolean }[] };
  aviso: { titulo: string; texto: string };
}

/** Um dos dois "mundos" da primeira dobra: o público, a promessa e as cenas que mostram o resultado. */
interface Mundo {
  tipo: TipoLanding;
  rota: string;
  icone: NomeIcone;
  sobretitulo: string;
  titulo: string;
  texto: string;
  negocios: string[];
  chamada: string;
  cenas: Cena[];
}

const MUNDOS: Mundo[] = [
  {
    tipo: 'produtos',
    rota: ROTA_LANDING.produtos,
    icone: 'caixa',
    sobretitulo: 'Para quem vende',
    titulo: 'Vendas',
    texto: 'Catálogo, orçamentos na hora e pedidos anotados. A confirmação e o pagamento continuam com você.',
    negocios: ['Confeitaria', 'Salgados', 'Cestas', 'Flores', 'Roupas'],
    chamada: 'Conhecer',
    cenas: [
      {
        id: 'bolo',
        rotulo: 'Bolos',
        foto: '/landing/galeria/bolos/02.webp',
        pergunta: 'Faz bolo para sábado? É para 20 pessoas',
        pedido: {
          total: 'R$ 150,00',
          linhas: [
            { rotulo: 'Bolo M', valor: '20 pessoas' },
            { rotulo: 'Recheio', valor: 'Ninho e morango' },
            { rotulo: 'Retirada', valor: 'Sábado, 15:00' },
          ],
        },
        aviso: { titulo: 'Pedido para fechar', texto: 'Você confirma com um toque' },
      },
      {
        id: 'salgados',
        rotulo: 'Salgados',
        foto: '/landing/hub/salgados.webp',
        pergunta: 'Quanto fica o cento de salgados? É para domingo',
        pedido: {
          total: 'R$ 90,00',
          linhas: [
            { rotulo: 'Salgados', valor: '100 unidades' },
            { rotulo: 'Sabores', valor: 'Coxinha e kibe' },
            { rotulo: 'Entrega', valor: 'Domingo, 11:00' },
          ],
        },
        aviso: { titulo: 'Pedido para fechar', texto: '100 salgados · você confirma' },
      },
      {
        id: 'flores',
        rotulo: 'Flores',
        foto: '/landing/hub/flores.webp',
        pergunta: 'Vocês entregam um buquê de rosas hoje?',
        pedido: {
          total: 'R$ 129,90',
          linhas: [
            { rotulo: 'Buquê', valor: '12 rosas vermelhas' },
            { rotulo: 'Cartão', valor: 'Com mensagem' },
            { rotulo: 'Entrega', valor: 'Hoje, 18:00' },
          ],
        },
        aviso: { titulo: 'Pedido para fechar', texto: 'Entrega hoje · você confirma' },
      },
    ],
  },
  {
    tipo: 'servicos',
    rota: ROTA_LANDING.servicos,
    icone: 'calendario',
    sobretitulo: 'Para quem agenda',
    titulo: 'Agendamentos',
    texto: 'O assistente marca horários na sua agenda, lembra o cliente antes, confirma a presença e diminui as faltas.',
    negocios: ['Manicure', 'Barbearia', 'Salão', 'Estética', 'Pet'],
    chamada: 'Conhecer',
    cenas: [
      {
        id: 'manicure',
        rotulo: 'Manicure',
        foto: '/landing/galeria/unhas/01.webp',
        pergunta: 'Tem horário amanhã à tarde para pé e mão?',
        agenda: {
          dia: 'Amanhã',
          livres: '3 livres',
          blocos: [
            { hora: '13:00', texto: 'Manicure · Ana' },
            { hora: '14:00', texto: 'Pé e mão · Maria', novo: true },
            { hora: '16:00', texto: 'Gel · Júlia' },
          ],
        },
        aviso: { titulo: 'Novo horário na agenda', texto: 'Pé e mão · amanhã, 14:00' },
      },
      {
        id: 'barbearia',
        rotulo: 'Barbearia',
        foto: '/landing/hub/barbearia.webp',
        pergunta: 'Tem horário hoje à noite para corte e barba?',
        agenda: {
          dia: 'Hoje',
          livres: '2 livres',
          blocos: [
            { hora: '18:00', texto: 'Corte · Lucas' },
            { hora: '19:00', texto: 'Corte + barba · Pedro', novo: true },
            { hora: '20:00', texto: 'Barba · Rafael' },
          ],
        },
        aviso: { titulo: 'Novo horário na agenda', texto: 'Corte + barba · hoje, 19:00' },
      },
      {
        id: 'estetica',
        rotulo: 'Estética',
        foto: '/landing/hub/estetica.webp',
        pergunta: 'Quero marcar uma limpeza de pele no sábado',
        agenda: {
          dia: 'Sábado',
          livres: '4 livres',
          blocos: [
            { hora: '09:00', texto: 'Massagem · Carla' },
            { hora: '10:00', texto: 'Limpeza de pele · Júlia', novo: true },
            { hora: '11:30', texto: 'Sobrancelha · Bia' },
          ],
        },
        aviso: { titulo: 'Novo horário na agenda', texto: 'Limpeza de pele · sáb, 10:00' },
      },
    ],
  },
];

/** Quanto cada cena fica à vista; o segundo mundo troca no meio do tempo do primeiro (não mudam juntos). */
const TEMPO_POR_CENA_MS = 4000;

/** Ondas da nota de voz no cartão do áudio (altura em %). */
const ONDAS = [28, 52, 78, 44, 92, 60, 34, 70, 48, 86, 40, 64, 30, 54, 74, 38, 24, 46, 66, 36];

/**
 * Hub da raiz (`/`): não é uma landing. Uma tela escura com dois "mundos" na primeira dobra, Vendas (`/vendas`) e
 * Agendamentos (`/agendamentos`), cada um com a sua cor e um carrossel de cenas (foto, mensagem do cliente, o cartão do
 * resultado e o aviso que chega) que desliza a cada 4 s e pausa com o mouse em cima; o mundo escolhido cresce.
 * Embaixo, cartões de vidro com o que vale para os dois e as portas de novo. Sem "Entrar"/"Testar grátis" no topo.
 */
@Component({
  selector: 'app-hub-page',
  imports: [RouterLink, IconeComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hub-page.component.html',
  styleUrl: './hub-page.component.css',
  host: { '[class.tema-claro]': "tema() !== 'escuro'" },
})
export class HubPageComponent {
  /** O claro é o padrão (o mesmo das landings); `/?tema=escuro` abre a versão escura. */
  readonly tema = input<string | undefined>(undefined);
  protected readonly anoAtual = new Date().getFullYear();
  protected readonly mundos = MUNDOS;
  protected readonly rotaVendas = ROTA_LANDING.produtos;
  protected readonly rotaAgenda = ROTA_LANDING.servicos;
  protected readonly ondas = ONDAS;
  protected readonly ultimoVisto = lerUltimoVisto();
  /** O mundo com o mouse em cima (cresce, o outro recua, e o carrossel dele pausa). */
  protected readonly emFoco = signal<TipoLanding | null>(null);
  /** A cena à vista em cada mundo. */
  protected readonly cenaAtual = signal<Record<TipoLanding, number>>({ produtos: 0, servicos: 0 });
  /** Fotos que ainda não existem em public/: a cena mostra a capa com o ícone no lugar. */
  protected readonly semFoto = signal<ReadonlySet<string>>(new Set());

  constructor() {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const temporizadores = MUNDOS.map((mundo, i) => {
      let intervalo: ReturnType<typeof setInterval> | undefined;
      const atraso = setTimeout(() => {
        intervalo = setInterval(() => this.avancar(mundo), TEMPO_POR_CENA_MS);
      }, i * (TEMPO_POR_CENA_MS / 2));
      return () => {
        clearTimeout(atraso);
        clearInterval(intervalo);
      };
    });
    inject(DestroyRef).onDestroy(() => temporizadores.forEach((parar) => parar()));
  }

  /** Pontinho tocado: vai direto à cena. */
  protected irPara(mundo: Mundo, indice: number, evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.cenaAtual.update((atual) => ({ ...atual, [mundo.tipo]: indice }));
  }

  protected aoFalharFoto(cena: Cena): void {
    this.semFoto.update((ids) => new Set(ids).add(cena.id));
  }

  private avancar(mundo: Mundo): void {
    if (this.emFoco() === mundo.tipo || document.hidden) {
      return;
    }
    this.cenaAtual.update((atual) => ({ ...atual, [mundo.tipo]: (atual[mundo.tipo] + 1) % mundo.cenas.length }));
  }
}

function lerUltimoVisto(): TipoLanding | null {
  try {
    const valor = localStorage.getItem(CHAVE_TIPO_VISTO);
    return valor === 'produtos' || valor === 'servicos' ? valor : null;
  } catch {
    return null;
  }
}
