import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../../shared/components/icone/icones';
import type { TipoLanding } from '../../../landing/conteudo-landing';
import { ArtePostComponent } from '../../../posts/arte-post/arte-post.component';
import { TIPOS_POST } from '../../../posts/motor/textos-post';
import { CelularMockComponent } from '../../celular-mock.component';
import { CenaPosts, ExemploPosts } from './conteudo-recurso-posts';

/**
 * O gerador de posts do painel dentro do celular, cena por cena, para o topo da página de posts: o que divulgar e o
 * conteúdo, o formato e o "Criar artes", as 4 artes (o próprio ArtePostComponent), a folha "Seu post" com o
 * compartilhar e, no fim, o post publicado no feed. Cópia fiel da tela real (posts-page, regras de celular): ao mudar
 * a tela, atualize aqui. Cada cena é recriada ao ficar ativa, e as animações (CSS, por atraso) começam de novo.
 */
@Component({
  selector: 'app-painel-posts-mock',
  imports: [NgTemplateOutlet, CelularMockComponent, IconeComponent, ArtePostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './painel-posts-mock.component.html',
  styleUrls: ['../vitrine/painel-vitrine-mock.css', './painel-posts-mock.css', './painel-posts-cenas.css'],
})
export class PainelPostsMockComponent {
  readonly cena = input.required<CenaPosts>();
  readonly tipo = input.required<TipoLanding>();
  readonly exemplo = input.required<ExemploPosts>();

  /** Os tipos que a loja do exemplo tem (a agenda aberta é dos serviços; a tabela de preços, dos produtos). */
  protected readonly tipos = computed(() =>
    TIPOS_POST.filter(({ tipo }) => (this.tipo() === 'servicos' ? tipo !== 'CARDAPIO' : tipo !== 'AGENDA') && tipo !== 'CONVITE'),
  );
  protected readonly escolhido = computed(() => this.exemplo().estilos[1]);
  protected readonly primeiraLinha = computed(() => this.exemplo().legenda.split('\n')[0]);
  protected readonly icone = (nome: string) => nome as NomeIcone;
  protected readonly formatos = [
    { valor: 'feed', rotulo: 'Feed', detalhe: '4:5' },
    { valor: 'quadrado', rotulo: 'Quadrado', detalhe: '1:1' },
    { valor: 'story', rotulo: 'Story', detalhe: '9:16' },
  ];
  protected readonly destinos = [
    { nome: 'Instagram', cor: 'linear-gradient(45deg, #f9b234, #e1306c 55%, #833ab4)' },
    { nome: 'WhatsApp', cor: '#25d366' },
    { nome: 'Mensagens', cor: '#34aadc' },
    { nome: 'Salvar imagem', cor: '#8e8e93' },
  ];
}
