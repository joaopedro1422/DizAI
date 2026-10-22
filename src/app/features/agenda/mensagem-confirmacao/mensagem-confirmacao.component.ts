import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';

import { DIAS_SEMANA } from '../../../core/utils/datas-agenda';

/** As etiquetas que o backend troca pelos dados do agendamento (AgendaService.confirmacao). */
const VARIAVEIS = [
  { chave: 'servico', rotulo: 'Serviço', exemplo: 'Corte de cabelo' },
  { chave: 'data', rotulo: 'Data', exemplo: '' },
  { chave: 'horario', rotulo: 'Horário', exemplo: '11:00 às 11:45' },
  { chave: 'nome', rotulo: 'Nome do cliente', exemplo: 'Pedro' },
];

export const MAXIMO_CONFIRMACAO = 1000;

/**
 * Editor da mensagem que o cliente recebe quando o assistente marca o horário: campo de altura fixa, etiquetas
 * clicáveis que entram onde está o cursor e a prévia de como a mensagem chega no WhatsApp.
 * Também serve para o agradecimento depois do atendimento (só {nome} e {servico}, em `etiquetas`).
 */
@Component({
  selector: 'app-mensagem-confirmacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mensagem-confirmacao.component.html',
  styleUrl: './mensagem-confirmacao.component.css',
})
export class MensagemConfirmacaoComponent {
  readonly texto = input.required<string>();
  /** A mensagem padrão (vale quando a loja não escreve a sua). */
  readonly padrao = input.required<string>();
  /** Quais etiquetas a mensagem aceita (o backend só troca essas). */
  readonly etiquetas = input<string[]>(VARIAVEIS.map((v) => v.chave));
  readonly rotulo = input('Mensagem de confirmação do agendamento');
  /** O {horario} da prévia (no lembrete é só o início). */
  readonly exemploHorario = input('11:00 às 11:45');
  /** O {data} da prévia (no lembrete é "amanhã"); vazio = a data de amanhã por extenso. */
  readonly exemploData = input('');
  readonly mudou = output<string>();

  private readonly campo = viewChild.required<ElementRef<HTMLTextAreaElement>>('campo');

  protected readonly maximo = MAXIMO_CONFIRMACAO;
  protected readonly variaveis = computed(() =>
    VARIAVEIS.filter((v) => this.etiquetas().includes(v.chave)).map((v) => ({ ...v, marcador: `{${v.chave}}` })),
  );

  protected readonly ehPadrao = computed(() => this.texto().trim() === this.padrao().trim());

  /** Etiquetas digitadas que não existem: chegariam ao cliente do jeito que estão. */
  protected readonly desconhecidas = computed(() => {
    const conhecidas = new Set(this.etiquetas());
    const achadas = [...this.texto().matchAll(/\{([^{}\s]+)\}/g)].map((m) => m[1]);
    return [...new Set(achadas.filter((chave) => !conhecidas.has(chave)))].map((chave) => `{${chave}}`);
  });

  /** A mensagem com dados de exemplo (o agendamento de amanhã). */
  protected readonly previa = computed(() => {
    const exemplos: Record<string, string> = Object.fromEntries(VARIAVEIS.map((v) => [v.chave, v.exemplo]));
    exemplos['data'] = this.exemploData() || dataDeAmanha();
    exemplos['horario'] = this.exemploHorario();
    const texto = this.texto().trim() || this.padrao();
    return formatarComoWhatsapp(texto.replace(/\{(\w+)\}/g, (marcador, chave: string) => exemplos[chave] ?? marcador));
  });

  protected digitar(evento: Event): void {
    this.mudou.emit((evento.target as HTMLTextAreaElement).value);
  }

  /** Coloca a etiqueta onde está o cursor (ou no fim) e devolve o foco ao campo, logo depois dela. */
  protected inserir(marcador: string): void {
    const campo = this.campo().nativeElement;
    const texto = this.texto();
    const inicio = campo.selectionStart ?? texto.length;
    const fim = campo.selectionEnd ?? texto.length;
    const novo = (texto.slice(0, inicio) + marcador + texto.slice(fim)).slice(0, MAXIMO_CONFIRMACAO);
    this.mudou.emit(novo);
    const cursor = Math.min(inicio + marcador.length, novo.length);
    requestAnimationFrame(() => {
      campo.focus();
      campo.setSelectionRange(cursor, cursor);
    });
  }

  /** Negrito do WhatsApp: põe * em volta do trecho escolhido (sem seleção, deixa o cursor entre os dois *). */
  protected negrito(): void {
    const campo = this.campo().nativeElement;
    const texto = this.texto();
    const inicio = campo.selectionStart ?? texto.length;
    const fim = campo.selectionEnd ?? texto.length;
    const novo = (texto.slice(0, inicio) + '*' + texto.slice(inicio, fim) + '*' + texto.slice(fim)).slice(
      0,
      MAXIMO_CONFIRMACAO,
    );
    this.mudou.emit(novo);
    requestAnimationFrame(() => {
      campo.focus();
      campo.setSelectionRange(inicio + 1, fim + 1);
    });
  }

  protected restaurarPadrao(): void {
    this.mudou.emit(this.padrao());
  }
}

/**
 * A prévia como o WhatsApp mostra: *negrito*, _itálico_ e ~riscado~ (dentro de uma linha).
 * O texto é escapado antes, então só essas três marcas viram HTML.
 */
function formatarComoWhatsapp(texto: string): string {
  const escapado = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escapado
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
    .replace(/~([^~\n]+)~/g, '<s>$1</s>');
}

function dataDeAmanha(): string {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dia = DIAS_SEMANA[(amanha.getDay() + 6) % 7].nome;
  const dd = String(amanha.getDate()).padStart(2, '0');
  const mm = String(amanha.getMonth() + 1).padStart(2, '0');
  return `${dia}, ${dd}/${mm}`;
}
