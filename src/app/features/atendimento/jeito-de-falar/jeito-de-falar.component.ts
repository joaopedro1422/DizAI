import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TomAtendimento } from '../../../core/models/perfil.model';
import { InterruptorComponent } from '../../../shared/components/interruptor/interruptor.component';
import { OpcaoCardComponent } from '../../../shared/components/opcao-card/opcao-card.component';
import { FormularioConfiguracoes } from '../../painel/painel-formulario';

/** Os emojis que a loja pode escolher (até 6): os que mais aparecem no atendimento de pequenos negócios. */
const SUGESTOES = [
  '😊', '🥰', '😍', '🤩', '😉', '✨', '💖', '💙', '🌸', '🙌',
  '👋', '🙏', '🎉', '🔥', '😋', '💅', '💇‍♀️', '💇‍♂️', '🧔', '💈',
  '✂️', '💪', '🎂', '🧁', '🍓', '🍰', '🌹', '🎁',
];
const MAXIMO = 6;

const TONS: { valor: TomAtendimento; titulo: string; descricao: string }[] = [
  { valor: 'NEUTRO', titulo: 'Neutro', descricao: 'Como hoje: cordial, sem marcas de gênero.' },
  { valor: 'FEMININO', titulo: 'Feminino', descricao: '"Obrigada" e, de vez em quando, expressões mais voltadas para o feminino.' },
  { valor: 'MASCULINO', titulo: 'Masculino', descricao: '"Obrigado" e, de vez em quando, expressões mais voltadas para o masculino.' },
];

/**
 * "Jeito de falar" (Como o assistente atende): o tom da voz do assistente e os emojis da loja. Tudo com moderação
 * e por código no backend (JeitoDeFalar): o tom muda só a concordância e um toque leve de vez em quando; os emojis
 * entram um por vez, em rodízio, no máximo um a cada 3 respostas. A prévia mostra o balão no tom escolhido.
 */
@Component({
  selector: 'app-jeito-de-falar',
  imports: [OpcaoCardComponent, InterruptorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jeito-de-falar.component.html',
  styleUrl: './jeito-de-falar.component.css',
})
export class JeitoDeFalarComponent implements OnInit {
  readonly formulario = input.required<FormularioConfiguracoes>();
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tons = TONS;
  protected readonly sugestoes = SUGESTOES;
  protected readonly maximo = MAXIMO;

  protected readonly tom = signal<TomAtendimento>('NEUTRO');
  protected readonly emojis = signal<string[]>([]);
  protected readonly usarEmojis = signal(true);
  protected readonly emojiCumprimento = signal('');

  /** O emoji que vai no cumprimento: o escolhido, senão o primeiro da loja, senão o 😊. */
  protected readonly emojiDoCumprimento = computed(() => this.emojiCumprimento() || this.emojis()[0] || '😊');

  /** O balão de exemplo: o cumprimento fixo da primeira resposta ("Olá"/"Opa") e uma resposta no tom escolhido. */
  protected readonly previa = computed(() => {
    const fim = this.usarEmojis() ? ` ${this.emojiDoCumprimento()}` : '';
    switch (this.tom()) {
      case 'FEMININO':
        return `Olá Camila, boa tarde!${fim}\nTemos simm! Horário amanhã às 14:00 e às 16:30. Qual fica melhor para você?`;
      case 'MASCULINO':
        return `Opa João, boa tarde!${fim}\nTemos sim! Horário amanhã às 14:00 e às 16:30. Qual fica melhor para você?`;
      default:
        return `Olá Camila, boa tarde!${fim}\nTemos horário amanhã às 14:00 e às 16:30. Qual fica melhor para você?`;
    }
  });

  ngOnInit(): void {
    const valores = this.formulario().getRawValue();
    this.tom.set(valores.tomAtendimento);
    this.emojis.set(valores.emojis);
    this.usarEmojis.set(valores.usarEmojis);
    this.emojiCumprimento.set(valores.emojiCumprimento);
    // descartar/recarregar o formulário volta os valores salvos
    this.formulario().valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const atual = this.formulario().getRawValue();
      this.tom.set(atual.tomAtendimento);
      this.emojis.set(atual.emojis);
      this.usarEmojis.set(atual.usarEmojis);
      this.emojiCumprimento.set(atual.emojiCumprimento);
    });
  }

  protected escolherTom(tom: TomAtendimento): void {
    this.atualizar('tomAtendimento', tom);
  }

  protected alternarUsar(ligado: boolean): void {
    this.atualizar('usarEmojis', ligado);
  }

  /** Um emoji só (o que o lojista digitar ou colar); vazio volta ao padrão. */
  protected definirEmojiCumprimento(valor: string): void {
    const emoji = [...new Intl.Segmenter().segment(valor.trim())].map((s) => s.segment).find((s) => /\p{Extended_Pictographic}/u.test(s)) ?? '';
    this.atualizar('emojiCumprimento', emoji);
  }

  protected alternarEmoji(emoji: string): void {
    const atuais = this.emojis();
    if (atuais.includes(emoji)) {
      this.atualizar('emojis', atuais.filter((e) => e !== emoji));
    } else if (atuais.length < MAXIMO) {
      this.atualizar('emojis', [...atuais, emoji]);
    }
  }

  private atualizar<K extends 'tomAtendimento' | 'emojis' | 'usarEmojis' | 'emojiCumprimento'>(campo: K, valor: ReturnType<FormularioConfiguracoes['getRawValue']>[K]): void {
    const controle = this.formulario().controls[campo];
    controle.setValue(valor as never);
    controle.markAsDirty();
  }
}
