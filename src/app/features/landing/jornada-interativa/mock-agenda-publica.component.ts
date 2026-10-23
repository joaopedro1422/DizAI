import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { RoteiroDemo } from './roteiro-demo';
import { TelefoneDemoComponent } from './telefone-demo.component';

/** Os serviços da página da Sálvia (camila-rocha), com as categorias, descrições, preços e durações cadastrados. */
const CATEGORIAS = [
  {
    nome: 'Combos',
    servicos: [
      { nome: 'Pé e mão', descricao: 'Manicure e pedicure tradicionais no mesmo horário.', preco: 'R$ 70,00', duracao: '1h30' },
      { nome: 'Pé e mão com gel nas mãos', descricao: 'Pedicure tradicional e esmaltação em gel nas mãos.', preco: 'R$ 105,00', duracao: '2h' },
    ],
  },
  {
    nome: 'Mãos',
    servicos: [
      { nome: 'Blindagem', descricao: 'Camada fina de gel que fortalece a unha natural e ajuda a crescer sem quebrar. Ideal para unhas fracas.', preco: 'R$ 90,00', duracao: '1h15' },
      { nome: 'Esmaltação em gel', descricao: 'Cutilagem e esmalte em gel na unha natural. Brilho e duração de até 21 dias, sem descascar.', preco: 'R$ 70,00', duracao: '1h' },
      { nome: 'Manicure Tradicional', descricao: 'Cutilagem, lixamento e esmaltação comum. Dura de 5 a 7 dias.', preco: 'R$ 35,00', duracao: '45 min' },
      { nome: 'Remoção de gel', descricao: 'Cutilagem, lixamento e esmaltação comum dos pés.', preco: 'R$ 40,00', duracao: '50 min' },
      { nome: 'manutenção de alongamento', descricao: 'Para quem já tem alongamento feito aqui, até 21 dias depois da aplicação.', preco: 'R$ 110,00', duracao: '30 min' },
    ],
  },
  { nome: 'Nail art', servicos: [{ nome: 'Nail art', descricao: 'Desenhos, adesivos ou pedrarias. Feita junto com outro serviço.', preco: 'Sob consulta', duracao: '15 min' }] },
  { nome: 'Pés', servicos: [{ nome: 'Pedicure tradicional', descricao: 'Cutilagem, lixamento e esmaltação comum dos pés.', preco: 'R$ 40,00', duracao: '50 min' }] },
];
const SERVICO_ESCOLHIDO = 'Esmaltação em gel';

/** A faixa de dias como a página mostra para a esmaltação (hoje lotado, domingo fechado). */
const DIAS = [
  { semana: 'Hoje', numero: '22', detalhe: 'Lotado', desativado: true },
  { semana: 'Amanhã', numero: '23', detalhe: '', desativado: false },
  { semana: 'Sáb', numero: '24', detalhe: '', desativado: false },
  { semana: 'Dom', numero: '25', detalhe: 'Fechado', desativado: true },
  { semana: 'Seg', numero: '26', detalhe: '', desativado: false },
  { semana: 'Ter', numero: '27', detalhe: '', desativado: false },
];

/** Os horários livres de amanhã para 1h de atendimento, separados em turnos. */
const TURNOS = [
  { nome: 'Manhã', horarios: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'] },
  { nome: 'Tarde', horarios: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'] },
];
const HORA_ESCOLHIDA = '14:00';
const NOME_CLIENTE = 'Mariana';

/** Logo e capa da Sálvia Nail Studio, as mesmas da página pública (Firebase Storage da loja). */
const LOGO =
  'https://firebasestorage.googleapis.com/v0/b/dizai-f78bd.firebasestorage.app/o/lojas%2Fcamila-rocha%2Fperfil%2F8b0a19ca-f3ed-44d0-ad61-47a0760dcfb1.png?alt=media';
const CAPA =
  'https://firebasestorage.googleapis.com/v0/b/dizai-f78bd.firebasestorage.app/o/lojas%2Fcamila-rocha%2Fcapa%2F68cc510b-785d-4af2-b80c-c0065180dfff.jpg?alt=media';

/**
 * A página de agendamento da Sálvia (/l/camila-rocha/agenda), no tamanho real: a cliente escolhe o serviço,
 * o dia e o horário, escreve o nome e toca em "Enviar pelo WhatsApp". A página rola sozinha a cada passo.
 */
@Component({
  selector: 'app-mock-agenda-publica-jornada',
  imports: [IconeComponent, TelefoneDemoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mock-agenda-publica.component.html',
  styleUrls: ['./tela-real.css', './mock-agenda-publica.component.css'],
})
export class MockAgendaPublicaJornadaComponent implements OnInit {
  private readonly roteiro = new RoteiroDemo(inject(DestroyRef));
  private readonly pagina = viewChild.required<ElementRef<HTMLElement>>('pagina');
  private readonly conteudo = viewChild.required<ElementRef<HTMLElement>>('conteudo');
  private readonly passoDia = viewChild<ElementRef<HTMLElement>>('passoDia');
  private readonly passoNome = viewChild<ElementRef<HTMLElement>>('passoNome');

  protected readonly logo = LOGO;
  protected readonly capa = CAPA;
  protected readonly categorias = CATEGORIAS;
  protected readonly dias = DIAS;
  protected readonly turnos = TURNOS;
  protected readonly servicoEscolhido = SERVICO_ESCOLHIDO;
  protected readonly horaEscolhida = HORA_ESCOLHIDA;

  protected readonly tocandoServico = signal(false);
  protected readonly comServico = signal(false);
  protected readonly comHora = signal(false);
  protected readonly nome = signal('');
  protected readonly enviando = signal(false);
  /** Quanto a página "rolou" (o conteúdo sobe com transform, como o dedo descendo a tela). */
  protected readonly rolagem = signal(0);

  /** O mesmo texto do botão fixo da página, conforme o que falta. */
  protected readonly textoBotao = computed(() => {
    if (!this.comServico()) return 'Escolha um serviço';
    if (!this.comHora()) return 'Escolha o dia e o horário';
    if (!this.nome().trim()) return 'Escreva o seu nome';
    return 'Enviar pelo WhatsApp';
  });
  protected readonly podeEnviar = computed(() => this.textoBotao() === 'Enviar pelo WhatsApp');

  ngOnInit(): void {
    if (this.roteiro.movimentoReduzido) {
      this.comServico.set(true);
      this.comHora.set(true);
      this.nome.set(NOME_CLIENTE);
      return;
    }
    const r = this.roteiro;
    r.em(900, () => this.rolar(560));
    r.em(1900, () => this.tocandoServico.set(true));
    r.em(2150, () => {
      this.tocandoServico.set(false);
      this.comServico.set(true);
    });
    r.em(2900, () => this.rolarAte(this.passoDia()));
    r.em(4400, () => this.comHora.set(true));
    r.em(5100, () => this.rolarAte(this.passoNome()));
    const fim = r.digitar(this.nome, NOME_CLIENTE, 6000, 90);
    r.em(fim + 700, () => this.enviando.set(true));
  }

  private rolar(topo: number): void {
    const maximo = this.conteudo().nativeElement.offsetHeight - this.pagina().nativeElement.clientHeight;
    this.rolagem.set(Math.max(0, Math.min(topo, maximo)));
  }

  /** Rola a página até o passo (um pouco acima dele, como quem desce com o dedo). */
  private rolarAte(passo: ElementRef<HTMLElement> | undefined): void {
    if (passo) {
      this.rolar(passo.nativeElement.offsetTop - 70);
    }
  }
}
