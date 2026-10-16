import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { MOTIVOS_ESPERA } from '../../../core/constants/opcoes-conversa';
import { ContatoIgnoradoService } from '../../../core/services/contato-ignorado.service';
import { ConversaService } from '../../../core/services/conversa.service';
import { GaleriaService } from '../../../core/services/galeria.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { PerguntaFrequenteService } from '../../../core/services/pergunta-frequente.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { pluralizar } from '../../../core/utils/colecao.utils';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { AlvoTourDirective } from '../onboarding/alvo-tour.directive';

/** Cabem duas fotos e o "+N" no canto do card quadrado. */
const MINIATURAS_GALERIA = 2;

/** Cards de navegação do painel: Produtos, Perguntas, Galeria, Contatos a ignorar e Chats. */
@Component({
  selector: 'app-atalhos-secoes',
  imports: [RouterLink, IconeComponent, AvatarComponent, AlvoTourDirective, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './atalhos-secoes.component.html',
  styleUrl: './atalhos-secoes.component.css',
})
export class AtalhosSecoesComponent {
  private readonly conversaService = inject(ConversaService);
  private readonly produtoService = inject(ProdutoService);
  private readonly perguntaService = inject(PerguntaFrequenteService);
  private readonly galeriaService = inject(GaleriaService);
  private readonly contatoIgnoradoService = inject(ContatoIgnoradoService);

  protected readonly rotas = inject(SessaoService).rotasDoPainel;

  /** Só as contas de DIZAI_ADMIN_NUMEROS veem o atalho do gerenciamento. */
  private readonly perfil = inject(PerfilService).perfil;
  protected readonly ehAdmin = computed(() => this.perfil().admin === true);

  protected readonly quantidadeAguardando = computed(() => this.conversaService.aguardandoDono().length);

  protected readonly resumoChats = computed(() => {
    const total = this.conversaService.totalConversas();
    return total === 0 ? 'Nenhuma conversa ainda' : pluralizar(total, 'conversa', 'conversas');
  });

  /** Conversa mais antiga esperando o dono, mostrada como prévia no card. */
  protected readonly conversaMaisUrgente = computed(() => {
    const conversa = this.conversaService.aguardandoDono()[0];
    if (!conversa) {
      return null;
    }
    return {
      nome: conversa.nomeCliente || conversa.whatsapp,
      motivo: conversa.motivoEspera ? MOTIVOS_ESPERA[conversa.motivoEspera].rotulo.toLowerCase() : '',
      mensagem: conversa.ultimaMensagem,
    };
  });

  protected readonly resumoProdutos = computed(() => {
    const total = this.produtoService.produtos().length;
    return total === 0 ? 'Nenhum ainda' : pluralizar(total, 'cadastrado', 'cadastrados');
  });

  protected readonly resumoPerguntas = computed(() => {
    const total = this.perguntaService.perguntas().length;
    return total === 0 ? 'Nenhuma ainda' : pluralizar(total, 'pergunta', 'perguntas');
  });

  protected readonly resumoContatosIgnorados = computed(() => {
    const total = this.contatoIgnoradoService.contatos().length;
    return total === 0 ? 'Nenhum ainda' : pluralizar(total, 'contato', 'contatos');
  });

  protected readonly resumoGaleria = computed(() => {
    const albuns = this.galeriaService.albuns().length;
    if (albuns === 0) {
      return 'Nenhum álbum';
    }
    return pluralizar(this.galeriaService.totalFotos(), 'foto', 'fotos');
  });

  protected readonly miniaturasGaleria = computed(() =>
    this.galeriaService
      .albuns()
      .flatMap((album) => album.fotos)
      .slice(0, MINIATURAS_GALERIA),
  );

  protected readonly fotosRestantes = computed(() =>
    Math.max(0, this.galeriaService.totalFotos() - MINIATURAS_GALERIA),
  );
}
