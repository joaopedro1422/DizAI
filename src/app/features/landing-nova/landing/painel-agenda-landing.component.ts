import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Largura em que a tela do computador é desenhada; ela é reduzida para caber no card (sem aumentar a altura dele). */
const LARGURA_TELA = 900;
const INICIO_DIA = 8 * 60;
const PIXELS_POR_MINUTO = 0.7;

interface BlocoAgenda {
  inicio: string;
  fim: string;
  nome: string;
  servico: string;
  valor: string;
  assistente?: boolean;
  confirmada?: boolean;
}

/** Um dia cheio de um estúdio com 2 profissionais (uma coluna por profissional, como a agenda no computador). */
const COLUNAS: { nome: string; blocos: BlocoAgenda[] }[] = [
  {
    nome: 'Bella',
    blocos: [
      { inicio: '08:00', fim: '09:15', nome: 'Aline Costa', servico: 'Esmaltação em gel', valor: 'R$ 60,00', assistente: true, confirmada: true },
      { inicio: '09:30', fim: '10:15', nome: 'Júlia Martins', servico: 'Manicure', valor: 'R$ 30,00' },
      { inicio: '10:30', fim: '12:00', nome: 'Paula Ribeiro', servico: 'Manicure + Pedicure', valor: 'R$ 55,00', assistente: true },
      { inicio: '13:30', fim: '15:00', nome: 'Renata Alves', servico: 'Alongamento em fibra', valor: 'R$ 150,00', assistente: true, confirmada: true },
      { inicio: '15:15', fim: '16:30', nome: 'Fernanda Melo', servico: 'Esmaltação em gel', valor: 'R$ 60,00', assistente: true },
    ],
  },
  {
    nome: 'Carla',
    blocos: [
      { inicio: '08:30', fim: '09:15', nome: 'Beatriz Lima', servico: 'Manicure', valor: 'R$ 30,00', confirmada: true },
      { inicio: '09:30', fim: '10:45', nome: 'Camila Rocha', servico: 'Esmaltação em gel', valor: 'R$ 60,00', assistente: true },
      { inicio: '11:00', fim: '11:45', nome: 'Larissa Gomes', servico: 'Pedicure', valor: 'R$ 35,00', assistente: true },
      { inicio: '13:00', fim: '14:15', nome: 'Marina Souza', servico: 'Esmaltação em gel', valor: 'R$ 60,00' },
      { inicio: '14:30', fim: '16:00', nome: 'Patrícia Nunes', servico: 'Manicure + Pedicure', valor: 'R$ 55,00', assistente: true },
    ],
  },
];

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * "A sua agenda" nos Recursos da agenda: a tela Agendamentos como ela é no computador (menu lateral, o dia no topo
 * com os botões, a visualização completa com uma coluna por profissional), desenhada em 900 px e reduzida para a
 * largura do card. A altura é a que sobra no card: o que não couber fica cortado embaixo, como numa janela.
 */
@Component({
  selector: 'app-painel-agenda-landing',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tela" [style.--escala]="escala()" aria-hidden="true">
      <div class="janela">
        <span class="janela__pontos"><i></i><i></i><i></i></span>
        <span class="janela__url">dizai.com/painel/agenda</span>
      </div>
      <div class="painel">
        <aside class="menu">
          <div class="menu__topo"><small>Minha Agenda</small><b>Studio Bella</b></div>
          <span class="menu__item menu__item--ativo"><app-icone nome="calendario" [tamanho]="15" />Agendamentos</span>
          <span class="menu__item"><app-icone nome="grafico" [tamanho]="15" />Números</span>
          <span class="menu__grupo">Configurações</span>
          <span class="menu__item"><app-icone nome="relogio" [tamanho]="15" />Horários</span>
          <span class="menu__item"><app-icone nome="pessoas" [tamanho]="15" />Equipe</span>
          <span class="menu__item"><app-icone nome="sino" [tamanho]="15" />Lembretes e mensagens</span>
          <span class="menu__item"><app-icone nome="listaRepetida" [tamanho]="15" />Lista de espera</span>
          <div class="menu__online"><b>Agenda online</b><small>dizai.com/l/studio-bella</small></div>
        </aside>
        <main class="dia">
          <div class="dia__topo">
            <span class="dia__titulo">Quinta, 24/10 <span class="dia__cal"><app-icone nome="calendario" [tamanho]="13" /></span></span>
            <span class="dia__botoes">
              <span class="botao botao--forte"><app-icone nome="mais" [tamanho]="13" [espessura]="2.4" />Agendar</span>
              <span class="botao">Registrar venda</span>
              <span class="botao">Não atendo neste dia</span>
            </span>
          </div>
          <div class="dia__resumo"><span>10 clientes</span><span class="dia__vis">Visualização: <b>Completa</b> ▾</span></div>
          <div class="grade">
            <div class="grade__cab"><span></span>
              @for (coluna of colunas; track coluna.nome) {
                <span class="grade__prof"><i>{{ coluna.nome[0] }}</i>{{ coluna.nome }}</span>
              }
            </div>
            <div class="grade__corpo">
              <div class="grade__horas">
                @for (hora of horas; track hora) {
                  <span [style.top.px]="(hora - 8) * 60 * ppm">{{ hora < 10 ? '0' + hora : hora }}:00</span>
                }
              </div>
              @for (coluna of colunas; track coluna.nome) {
                <div class="grade__coluna">
                  @for (bloco of coluna.blocos; track bloco.inicio) {
                    <div class="bloco" [style.top.px]="topo(bloco)" [style.height.px]="altura(bloco)">
                      <span class="bloco__linha">
                        <small>{{ bloco.inicio }} – {{ bloco.fim }}</small>
                        @if (bloco.confirmada) {
                          <i class="bloco__ok"><app-icone nome="check" [tamanho]="8" [espessura]="3.4" /></i>
                        }
                        @if (bloco.assistente) {
                          <span class="bloco__ia"><app-icone nome="brilho" [tamanho]="10" [espessura]="2" /></span>
                        }
                        <small class="bloco__valor">{{ bloco.valor }}</small>
                      </span>
                      <b>{{ bloco.nome }}</b>
                      <small>{{ bloco.servico }}</small>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: `
    /* ocupa o que sobra no card (sem aumentar a altura dele); a tela reduzida fica presa no topo e cortada embaixo */
    :host {
      position: relative;
      display: block;
      flex: 1 1 auto;
      min-height: 190px;
      margin-top: 4px;
      overflow: hidden;
      border: 1px solid var(--linha, #e4e8f1);
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 14px 30px -24px rgba(19, 32, 74, 0.5);
    }

    .tela {
      position: absolute;
      top: 0;
      left: 0;
      width: ${LARGURA_TELA}px;
      color: #1f2430;
      font-size: 13px;
      text-align: left;
      transform: scale(var(--escala, 0.4));
      transform-origin: 0 0;
    }

    .janela {
      display: flex;
      align-items: center;
      gap: 16px;
      height: 34px;
      padding: 0 14px;
      border-bottom: 1px solid #e8ebf2;
      background: #f3f5fa;
    }

    .janela__pontos { display: flex; gap: 6px; }
    .janela__pontos i { width: 10px; height: 10px; border-radius: 50%; background: #d5dae6; }

    .janela__url {
      padding: 4px 14px;
      border-radius: 999px;
      background: #ffffff;
      color: #667085;
      font-size: 12px;
    }

    .painel { display: grid; grid-template-columns: 210px minmax(0, 1fr); }

    .menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-height: 560px;
      padding-bottom: 14px;
      border-right: 2px solid #eef0f5;
    }

    .menu__topo {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
      padding: 16px 16px 14px;
      background: #13204a;
      color: #ffffff;
    }

    .menu__topo small { color: #ffc83d; font-size: 11px; font-weight: 700; }
    .menu__topo b { font-size: 16px; }

    .menu__item {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0 8px;
      padding: 8px 10px;
      border-radius: 10px;
      color: #475066;
      font-size: 13px;
      font-weight: 600;
    }

    .menu__item--ativo {
      background: #fff4d6;
      box-shadow: inset 3px 0 0 #ffc83d;
      color: #13204a;
    }

    .menu__grupo {
      margin: 12px 18px 4px;
      color: #8a93a5;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .menu__online {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 14px 10px 0;
      padding: 12px;
      border-radius: 12px;
      background: #13204a;
      color: #ffffff;
    }

    .menu__online small { color: #c9d1e6; font-size: 11px; }

    .dia { padding: 16px 20px 0; }

    .dia__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

    .dia__titulo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #13204a;
      font-size: 21px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .dia__cal {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border: 1px solid #e1e5ee;
      border-radius: 8px;
      color: #1e3a72;
    }

    .dia__botoes { display: flex; gap: 6px; }

    .botao {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 7px 11px;
      border: 1px solid #d9deea;
      border-radius: 10px;
      color: #13204a;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .botao--forte { border-color: #13204a; border-radius: 10px 10px 10px 4px; background: #13204a; color: #ffffff; }

    .dia__resumo {
      display: flex;
      justify-content: space-between;
      margin: 6px 0 12px;
      color: #667085;
      font-size: 12.5px;
    }

    .dia__vis b { color: #13204a; }

    .grade { border: 2px solid #eef0f5; border-radius: 14px; overflow: hidden; }

    .grade__cab,
    .grade__corpo {
      display: grid;
      grid-template-columns: 52px repeat(2, minmax(0, 1fr));
    }

    .grade__cab { border-bottom: 1px solid #eef0f5; background: #fafbfd; }

    .grade__prof {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      color: #13204a;
      font-size: 13px;
      font-weight: 700;
    }

    .grade__prof i {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e8eefa;
      color: #1e3a72;
      font-size: 11px;
      font-style: normal;
    }

    .grade__corpo { position: relative; height: 470px; }

    .grade__horas { position: relative; border-right: 1px solid #eef0f5; }

    .grade__horas span {
      position: absolute;
      left: 8px;
      color: #8a93a5;
      font-size: 11px;
      transform: translateY(2px);
    }

    .grade__coluna {
      position: relative;
      border-right: 1px solid #eef0f5;
      background: repeating-linear-gradient(to bottom, transparent 0 41px, #f1f3f8 41px 42px);
    }

    .bloco {
      position: absolute;
      right: 6px;
      left: 6px;
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
      padding: 5px 9px;
      border-left: 3px solid #1e3a72;
      border-radius: 8px;
      background: #eef3fb;
      font-size: 11.5px;
      line-height: 1.25;
    }

    .bloco b { color: #13204a; font-size: 12.5px; }
    .bloco small { color: #667085; font-size: 11px; }

    .bloco__linha { display: flex; align-items: center; gap: 5px; }
    .bloco__valor { margin-left: auto; color: #13204a !important; font-weight: 700; }

    .bloco__ok {
      display: grid;
      place-items: center;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #1a9b71;
      color: #ffffff;
    }

    .bloco__ia { display: inline-flex; color: #1a9b71; }
  `,
})
export class PainelAgendaLandingComponent {
  protected readonly colunas = COLUNAS;
  protected readonly horas = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  protected readonly ppm = PIXELS_POR_MINUTO;
  protected readonly escala = signal(0.4);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observador: ResizeObserver | undefined;
    inject(DestroyRef).onDestroy(() => observador?.disconnect());
    afterNextRender(() => {
      const medir = () => this.escala.set(elemento.clientWidth / LARGURA_TELA || 0.4);
      medir();
      observador = new ResizeObserver(medir);
      observador.observe(elemento);
    });
  }

  protected topo(bloco: BlocoAgenda): number {
    return (minutos(bloco.inicio) - INICIO_DIA) * PIXELS_POR_MINUTO + 2;
  }

  protected altura(bloco: BlocoAgenda): number {
    return (minutos(bloco.fim) - minutos(bloco.inicio)) * PIXELS_POR_MINUTO - 4;
  }
}
