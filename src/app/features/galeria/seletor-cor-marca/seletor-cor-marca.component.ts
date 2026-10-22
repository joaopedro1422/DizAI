import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { CORES_MARCA, buscarCorMarca } from '../../../core/constants/cores-marca';
import { CorMarca } from '../../../core/models/perfil.model';
import {
  AreaCorFundoVitrine,
  ConfiguracaoVitrine,
  CorFundoVitrine,
  FONTES_VITRINE,
  FonteVitrine,
} from '../../../core/models/vitrine.model';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { arquivoDaCapa, desenharCapaDegrade } from './capa-degrade';

const TAMANHO_MAXIMO_CAPA_BYTES = 5 * 1024 * 1024;

/**
 * Configura cor, fonte, fundo e capa da página pública da loja.
 */
@Component({
  selector: 'app-seletor-cor-marca',
  imports: [IconeComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seletor-cor-marca.component.html',
  styleUrl: './seletor-cor-marca.component.css',
})
export class SeletorCorMarcaComponent {
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly armazenamentoFotos = inject(ArmazenamentoFotosService);

  readonly salvo = output<void>();
  protected readonly cores = CORES_MARCA;
  protected readonly opcoesFundo: { valor: CorFundoVitrine; nome: string }[] = [
    ...CORES_MARCA.map((cor) => ({ valor: cor.valor, nome: `${cor.nome} claro` })),
    { valor: 'BRANCO', nome: 'Branco' },
    { valor: 'SEM_COR', nome: 'Sem cor de fundo' },
  ];
  protected readonly corAtual = signal<CorMarca>(this.perfilService.perfil().corMarca);
  protected readonly fonteAtual = signal<FonteVitrine>(
    this.perfilService.perfil().fonteGaleria ?? 'Poppins',
  );
  protected readonly fundoAtual = signal<CorFundoVitrine>(
    this.perfilService.perfil().corFundoGaleria ?? this.perfilService.perfil().corMarca,
  );
  protected readonly areaFundoAtual = signal<AreaCorFundoVitrine>(
    this.perfilService.perfil().areaCorFundoGaleria ?? 'CABECALHO',
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
  protected readonly fonteCss = computed(() => {
    const fonte = this.fonteAtual();
    const serifadas: FonteVitrine[] = ['Playfair Display', 'Cormorant Garamond', 'Lora'];
    const manuscritas: FonteVitrine[] = ['Dancing Script', 'Pacifico', 'Caveat'];
    const familia = serifadas.includes(fonte) ? 'serif' : manuscritas.includes(fonte) ? 'cursive' : 'sans-serif';
    return `'${fonte}', ${familia}`;
  });

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

  protected alterarFundo(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    const opcao = this.opcoesFundo.find((item) => item.valor === valor);
    if (opcao) {
      this.fundoAtual.set(opcao.valor);
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
