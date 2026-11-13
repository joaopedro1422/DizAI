import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CORES_MARCA } from '../../../../core/constants/cores-marca';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { CelularMockComponent } from '../../celular-mock.component';
import { CenaVitrine, LojaExemplo } from './conteudo-recurso-vitrine';

/**
 * O painel do DizAI dentro do celular, cena por cena, para o "Do cadastro ao resultado" da página da vitrine: a tela
 * da Galeria (o mesmo cabeçalho, os mesmos cartões de tópico) com a folha de baixo de cada ação (Personalizar vitrine,
 * Adicionar fotos, Novo tópico com o CEP, Novo feedback) ou os Horários da agenda. Cópia fiel das telas reais
 * (galeria-page, seletor-cor-marca, fotos-formulario, topico-formulario, endereco-formulario, semana-agenda): ao mudar
 * essas telas, atualize aqui. Cada cena é recriada ao ficar ativa, e as animações (CSS, por atraso) começam de novo.
 */
@Component({
  selector: 'app-painel-vitrine-mock',
  imports: [NgTemplateOutlet, CelularMockComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './painel-vitrine-mock.component.html',
  styleUrls: ['./painel-vitrine-mock.css', './painel-vitrine-cenas.css'],
})
export class PainelVitrineMockComponent {
  readonly cena = input.required<CenaVitrine>();
  readonly loja = input.required<LojaExemplo>();

  /** As cores de destaque do "Personalizar vitrine", na ordem da tela (a lista real do painel). */
  protected readonly cores = CORES_MARCA.map((cor) => cor.hex.toUpperCase());
  /** A cor da loja na grade (a que o lojista toca). */
  protected readonly indiceCor = computed(() => Math.max(0, this.cores.indexOf(this.loja().cor.toUpperCase())));
  protected readonly palavrasFeedback = computed(() => this.loja().feedback.texto.split(' '));
  protected readonly nomeDaFonte = computed(() => this.loja().fonte.split(',')[0].replace(/'/g, ''));
  protected readonly link = computed(() => `dizai.com/l/${this.loja().slug}`);
  protected readonly dias = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
}
