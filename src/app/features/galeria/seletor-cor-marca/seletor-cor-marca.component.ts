import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { CORES_MARCA, buscarCorMarca } from '../../../core/constants/cores-marca';
import { CorMarca, ramoUsaAgenda } from '../../../core/models/perfil.model';
import {
  AreaCorFundoVitrine,
  ConfiguracaoVitrine,
  CorFundoVitrine,
  EstiloCor,
  EstiloAbas,
  EstiloMenu,
  LayoutFotos,
  FONTES_VITRINE,
  GRUPOS_FONTES,
  fonteComFamilia,
  FonteVitrine,
} from '../../../core/models/vitrine.model';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { arquivoDaCapa, desenharCapaDegrade } from './capa-degrade';
import { OPCOES_FUNDO, SeletorFundoComponent } from './seletor-fundo.component';
import { SeletorEstiloCorComponent } from './seletor-estilo-cor.component';
import { fundoDoDestaque } from '../../../core/constants/estilos-cor';

const TAMANHO_MAXIMO_CAPA_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-seletor-cor-marca',
  imports: [IconeComponent, UrlImagemPipe, SeletorFundoComponent, SeletorEstiloCorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seletor-cor-marca.component.html',
  styleUrls: ['./seletor-cor-marca.component.css', './layout-fotos.css', './abas-previa.css'],
})
export class SeletorCorMarcaComponent {
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);

  readonly salvo = output<void>();
  /** O fundo escolhido, pronto para o `background` do modal (null = sem cor): o modal fica com ele, como prévia. */
  readonly corFundo = output<string | null>();
  protected readonly cores = CORES_MARCA;
  protected readonly corAtual = signal<CorMarca>(this.perfilService.perfil().corMarca);
  protected readonly fonteAtual = signal<FonteVitrine>(
    this.perfilService.perfil().fonteGaleria ?? 'Poppins',
  );
  protected readonly fundoAtual = signal<CorFundoVitrine>(
    this.perfilService.perfil().corFundoGaleria ?? this.perfilService.perfil().corMarca,
  );
  /** Normal, metálico, degradê ou vidro: muda como a cor pinta os botões e as etiquetas da vitrine. */
  protected readonly estiloAtual = signal<EstiloCor>(this.perfilService.perfil().estiloCor ?? 'NORMAL');
  /** Menu das categorias na vitrine: etiquetas arredondadas ou só o texto com a barra embaixo. */
  protected readonly menuAtual = signal<EstiloMenu>(this.perfilService.perfil().estiloMenu ?? 'ARREDONDADO');
  protected readonly estilosMenu: { valor: EstiloMenu; nome: string }[] = [
    { valor: 'ARREDONDADO', nome: 'Arredondado' },
    { valor: 'MINIMALISTA', nome: 'Minimalista' },
  ];
  /** Abas da página pública (Vitrine | Agendar horário): só aparecem nas lojas com agenda. */
  protected readonly abasAtual = signal<EstiloAbas>(this.perfilService.perfil().estiloAbas ?? 'PILULA');
  protected readonly estilosAbas: { valor: EstiloAbas; nome: string }[] = [
    { valor: 'PILULA', nome: 'Pílula' },
    { valor: 'SUBLINHADO', nome: 'Sublinhado' },
    { valor: 'CONTORNO', nome: 'Contorno' },
  ];
  protected readonly temAbas = computed(() => ramoUsaAgenda(this.perfilService.perfil().ramo));
  /** Como as fotos de cada tópico aparecem na vitrine. */
  protected readonly layoutAtual = signal<LayoutFotos>(this.perfilService.perfil().layoutFotos ?? 'GRADE');
  protected readonly layoutsFotos: { valor: LayoutFotos; nome: string; descricao: string }[] = [
    { valor: 'GRADE', nome: 'Grade', descricao: 'Quadrados, 3 por linha' },
    { valor: 'MOSAICO', nome: 'Mosaico', descricao: 'Alturas diferentes' },
    { valor: 'DESTAQUE', nome: 'Destaque', descricao: 'A 1ª foto grande' },
    { valor: 'CARROSSEL', nome: 'Carrossel', descricao: 'Rola para o lado' },
  ];
  protected readonly hexAtual = computed(() => buscarCorMarca(this.corAtual()).hex);
  protected readonly areaFundoAtual = signal<AreaCorFundoVitrine>(
    this.perfilService.perfil().areaCorFundoGaleria ?? 'CABECALHO',
  );
  /** A opção de fundo escolhida, com o nome e a cor (para o aviso embaixo do seletor). */
  protected readonly fundoEscolhido = computed(
    () => OPCOES_FUNDO.find((opcao) => opcao.valor === this.fundoAtual()) ?? OPCOES_FUNDO[0],
  );
  protected readonly capaAtual = computed(() => this.perfilService.perfil().capaUrl ?? null);
  protected readonly arquivoCapa = signal<File | null>(null);
  protected readonly removerCapa = signal(false);
  /** "Criar capa com a minha cor": degradê com a cor de destaque escolhida (acompanha a troca de cor). */
  protected readonly capaPronta = signal(false);
  protected readonly previaCapaPronta = computed(() =>
    this.capaPronta() ? desenharCapaDegrade(buscarCorMarca(this.corAtual()).hex) : null,
  );
  protected readonly salvando = signal(false);
  protected readonly nomeCorAtual = computed(() => buscarCorMarca(this.corAtual()).nome);
  protected readonly fonteCss = computed(() => fonteComFamilia(this.fonteAtual()));
  protected readonly gruposFontes = GRUPOS_FONTES;

  constructor() {
    // os fundos têm um pouco de transparência: sobre o branco, o que está atrás do modal não aparece
    effect(() => {
      // tema escuro: a janela continua clara (o texto do painel é escuro); o aviso embaixo explica como fica
      const cor = this.fundoAtual() === 'ESCURO' ? null : this.fundoEscolhido().cor;
      this.corFundo.emit(cor ? `linear-gradient(${cor}, ${cor}), #ffffff` : null);
    });
  }

  /** As bolinhas de cor já aparecem no estilo escolhido. */
  protected pintura(hex: string): string {
    return fundoDoDestaque(hex, this.estiloAtual());
  }

  protected escolherCor(cor: CorMarca): void {
    this.corAtual.set(cor);
  }

  protected alterarFonte(evento: Event): void {
    const fonte = (evento.target as HTMLSelectElement).value;
    const fontePermitida = FONTES_VITRINE.find((opcao) => opcao === fonte);
    if (fontePermitida) {
      this.fonteAtual.set(fontePermitida);
    }
  }

  protected alterarAreaFundo(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (valor === 'PAGINA' || valor === 'CABECALHO') {
      this.areaFundoAtual.set(valor);
    }
  }

  protected aoEscolherCapa(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0] ?? null;
    campo.value = '';
    if (!arquivo) {
      return;
    }
    if (!arquivo.type.startsWith('image/')) {
      this.toastService.mostrar('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_CAPA_BYTES) {
      this.toastService.mostrar('A imagem é muito grande. Use uma de até 5 MB.');
      return;
    }
    this.arquivoCapa.set(arquivo);
    this.removerCapa.set(false);
    this.capaPronta.set(false);
  }

  protected criarCapaPronta(): void {
    this.capaPronta.set(true);
    this.arquivoCapa.set(null);
    this.removerCapa.set(false);
  }

  protected limparCapa(): void {
    this.arquivoCapa.set(null);
    this.capaPronta.set(false);
    this.removerCapa.set(true);
  }

  protected manterCapa(): void {
    this.removerCapa.set(false);
  }

  protected async salvar(): Promise<void> {
    if (this.salvando()) {
      return;
    }
    this.salvando.set(true);
    try {
      let capaUrl = this.removerCapa() ? null : this.capaAtual();
      const previaPronta = this.previaCapaPronta();
      const arquivo = previaPronta ? await arquivoDaCapa(previaPronta) : this.arquivoCapa();
      if (arquivo) {
        const [referencia] = await this.armazenamentoFotos.enviar([arquivo], { tipo: 'CAPA' });
        if (!referencia) {
          throw new Error('O armazenamento não retornou a referência da capa.');
        }
        capaUrl = referencia;
      }
      const configuracao: ConfiguracaoVitrine = {
        corMarca: this.corAtual(),
        fonteGaleria: this.fonteAtual(),
        corFundoGaleria: this.fundoAtual(),
        areaCorFundoGaleria: this.areaFundoAtual(),
        estiloCor: this.estiloAtual(),
        estiloMenu: this.menuAtual(),
        estiloAbas: this.abasAtual(),
        layoutFotos: this.layoutAtual(),
        capaUrl,
      };
      await this.perfilService.atualizarConfiguracaoVitrine(configuracao);
      this.toastService.mostrar('Vitrine atualizada');
      this.salvo.emit();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar a vitrine. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }
}
