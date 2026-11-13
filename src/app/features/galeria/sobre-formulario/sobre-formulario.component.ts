import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';

import { mensagemDoErro } from '../../../core/api/erro-api';
import { buscarCorMarca } from '../../../core/constants/cores-marca';
import { Album, EstiloSobre, Sobre } from '../../../core/models/galeria.model';
import { fonteComFamilia } from '../../../core/models/vitrine.model';
import { ArmazenamentoFotosService } from '../../../core/services/armazenamento-fotos.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { UrlImagemPipe } from '../../../core/imagens/url-imagem';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SobreVitrineComponent } from '../../../shared/components/sobre-vitrine/sobre-vitrine.component';

/** O que o formulário entrega: o nome do tópico (o rótulo e o item do menu) e o conteúdo. */
export interface SobreSalvo {
  nome: string;
  sobre: Sobre;
}

const ESTILOS: { valor: EstiloSobre; nome: string; descricao: string }[] = [
  { valor: 'CLASSICO', nome: 'Clássico', descricao: 'Foto em cima e assinatura' },
  { valor: 'JANELA', nome: 'Janela com selo', descricao: 'Foto em arco e o ano' },
  { valor: 'CAPA', nome: 'Capa com cartão', descricao: 'Foto cheia e destaques' },
];

const MAX_TEXTO = 1000;

/**
 * Tópico "Sobre" (criar e editar): os 3 estilos com a prévia na cor e na fonte da vitrine, título, texto, a foto
 * principal (sobe na hora para lojas/{slug}/sobre) e o extra do estilo escolhido.
 */
@Component({
  selector: 'app-sobre-formulario',
  imports: [CarregandoComponent, IconeComponent, SobreVitrineComponent, UrlImagemPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="formulario" (submit)="$event.preventDefault(); salvar()" novalidate>
      <div class="campo">
        <span class="campo__rotulo">Estilo da seção</span>
        <div class="estilos" role="radiogroup" aria-label="Estilo da seção Sobre">
          @for (opcao of estilos; track opcao.valor) {
            @let ativo = estilo() === opcao.valor;
            <button type="button" role="radio" class="estilo" [class.estilo--ativo]="ativo" [attr.aria-checked]="ativo" (click)="estilo.set(opcao.valor)">
              <span class="estilo__previa" aria-hidden="true" [style.--vitrine-destaque]="corDaLoja()" [style.--vitrine-fonte]="fonteDaLoja()">
                <span class="estilo__escala">
                  <app-sobre-vitrine [sobre]="previa(opcao.valor)" [rotulo]="nome() || 'Sobre nós'" [reservarFoto]="true" />
                </span>
              </span>
              <span class="estilo__textos">
                <strong>{{ opcao.nome }}</strong>
                <span>{{ opcao.descricao }}</span>
              </span>
            </button>
          }
        </div>
      </div>

      <div class="campo">
        <label for="sobre-nome" class="campo__rotulo">Nome do tópico</label>
        <input id="sobre-nome" class="campo__entrada" type="text" maxlength="60" placeholder="Sobre nós" [value]="nome()" (input)="nome.set($any($event.target).value)">
        <span class="campo__dica">Aparece pequeno em cima do título e no menu da vitrine.</span>
        @if (tentou() && !nome().trim()) {
          <span class="campo__erro" role="alert">Dê um nome para o tópico.</span>
        }
      </div>

      <div class="campo">
        <label for="sobre-titulo" class="campo__rotulo">Título</label>
        <input id="sobre-titulo" class="campo__entrada" type="text" maxlength="100" placeholder="Ex.: Feito com amor desde 2019" [value]="titulo()" (input)="titulo.set($any($event.target).value)">
        @if (tentou() && !titulo().trim()) {
          <span class="campo__erro" role="alert">Escreva o título da seção.</span>
        }
      </div>

      <div class="campo">
        <label for="sobre-texto" class="campo__rotulo">Texto</label>
        <textarea id="sobre-texto" class="campo__entrada" rows="6" [attr.maxlength]="maxTexto" placeholder="Conte a história do seu negócio, o que você faz de especial e por que os clientes voltam." [value]="texto()" (input)="texto.set($any($event.target).value)"></textarea>
        <span class="campo__dica contador">{{ texto().length }}/{{ maxTexto }}</span>
        @if (tentou() && !texto().trim()) {
          <span class="campo__erro" role="alert">Escreva o texto da seção.</span>
        }
      </div>

      <div class="campo">
        <span class="campo__rotulo">Foto principal <span class="campo__rotulo-opcional">(opcional)</span></span>
        @if (foto(); as ref) {
          <div class="foto-escolhida">
            <img [src]="ref | urlImagem" alt="Foto principal da seção">
            <div class="foto-escolhida__acoes">
              <label class="btn btn--secundario btn--pequeno">
                Trocar
                <input type="file" accept="image/*" hidden (change)="escolherFoto($event)">
              </label>
              <button type="button" class="btn btn--secundario btn--pequeno" (click)="foto.set(null)">Tirar</button>
            </div>
          </div>
        } @else {
          <label class="area-foto" [class.area-foto--enviando]="enviandoFoto()">
            @if (enviandoFoto()) {
              <app-carregando modo="inline" [tamanho]="20" /> Enviando a foto…
            } @else {
              <app-icone nome="camera" [tamanho]="20" />
              <span><strong>Escolher foto</strong><small>Você, a equipe, o espaço ou um trabalho</small></span>
            }
            <input type="file" accept="image/*" hidden [disabled]="enviandoFoto()" (change)="escolherFoto($event)">
          </label>
        }
      </div>

      @switch (estilo()) {
        @case ('CLASSICO') {
          <div class="campo">
            <label for="sobre-assinatura" class="campo__rotulo">Assinatura <span class="campo__rotulo-opcional">(opcional)</span></label>
            <input id="sobre-assinatura" class="campo__entrada" type="text" maxlength="60" placeholder="Ex.: Camila Rocha" [value]="assinatura()" (input)="assinatura.set($any($event.target).value)">
          </div>
        }
        @case ('JANELA') {
          <div class="campo">
            <label for="sobre-desde" class="campo__rotulo">Desde (o ano do selo) <span class="campo__rotulo-opcional">(opcional)</span></label>
            <input id="sobre-desde" class="campo__entrada campo-ano" type="text" inputmode="numeric" maxlength="4" placeholder="2019" [value]="desde()" (input)="desde.set($any($event.target).value)">
            @if (tentou() && anoInvalido()) {
              <span class="campo__erro" role="alert">Informe o ano com 4 números, por exemplo 2019.</span>
            }
          </div>
        }
        @case ('CAPA') {
          <div class="campo">
            <span class="campo__rotulo">Destaques <span class="campo__rotulo-opcional">(opcional, até 2)</span></span>
            <div class="destaques">
              <input class="campo__entrada" type="text" maxlength="30" placeholder="Ex.: +2 mil bolos" aria-label="Primeiro destaque" [value]="destaque1()" (input)="destaque1.set($any($event.target).value)">
              <input class="campo__entrada" type="text" maxlength="30" placeholder="Ex.: Receitas da família" aria-label="Segundo destaque" [value]="destaque2()" (input)="destaque2.set($any($event.target).value)">
            </div>
          </div>
        }
      }

      @if (erro()) {
        <span class="campo__erro" role="alert">{{ erro() }}</span>
      }

      <button type="submit" class="btn btn--primario btn--grande btn--bloco" [disabled]="salvando() || enviandoFoto()" [attr.aria-busy]="salvando()">
        @if (salvando()) {
          <app-carregando modo="inline" variante="claro" [tamanho]="22" />
          Salvando…
        } @else {
          {{ album() ? 'Salvar alterações' : 'Criar seção Sobre' }}
        }
      </button>
    </form>
  `,
  styleUrl: './sobre-formulario.component.css',
})
export class SobreFormularioComponent implements OnInit {
  private readonly armazenamento = inject(ArmazenamentoFotosService);
  private readonly perfil = inject(PerfilService).perfil;

  /** Editando: o tópico com o conteúdo atual; null = novo. */
  readonly album = input<Album | null>(null);
  readonly salvando = input(false);
  readonly salvo = output<SobreSalvo>();

  protected readonly estilos = ESTILOS;
  protected readonly maxTexto = MAX_TEXTO;

  protected readonly estilo = signal<EstiloSobre>('CLASSICO');
  protected readonly nome = signal('Sobre nós');
  protected readonly titulo = signal('');
  protected readonly texto = signal('');
  protected readonly foto = signal<string | null>(null);
  protected readonly assinatura = signal('');
  protected readonly desde = signal('');
  protected readonly destaque1 = signal('');
  protected readonly destaque2 = signal('');
  protected readonly enviandoFoto = signal(false);
  protected readonly tentou = signal(false);
  protected readonly erro = signal('');

  protected readonly corDaLoja = computed(() => buscarCorMarca(this.perfil().corMarca).hex);
  protected readonly fonteDaLoja = computed(() => fonteComFamilia(this.perfil().fonteGaleria ?? 'Poppins'));
  protected readonly anoInvalido = computed(() => !!this.desde().trim() && !/^(19|20|21)\d{2}$/.test(this.desde().trim()));

  ngOnInit(): void {
    const album = this.album();
    const sobre = album?.sobre;
    if (!album || !sobre) return;
    this.nome.set(album.nome);
    this.estilo.set(sobre.estilo);
    this.titulo.set(sobre.titulo);
    this.texto.set(sobre.texto);
    this.foto.set(sobre.foto);
    this.assinatura.set(sobre.assinatura ?? '');
    this.desde.set(sobre.desde ? String(sobre.desde) : '');
    this.destaque1.set(sobre.destaques[0] ?? '');
    this.destaque2.set(sobre.destaques[1] ?? '');
  }

  /** A prévia de cada estilo com o que o lojista já escreveu (ou um exemplo). */
  protected previa(estilo: EstiloSobre): Sobre {
    const destaques = [this.destaque1(), this.destaque2()].map((d) => d.trim()).filter(Boolean);
    return {
      estilo,
      titulo: this.titulo().trim() || 'Feito com amor',
      texto: this.texto().trim() || 'Conte aqui a história do seu negócio e o que ele tem de especial para os clientes.',
      foto: this.foto(),
      assinatura: this.assinatura().trim() || 'Seu nome',
      desde: Number(this.desde()) || new Date().getFullYear() - 3,
      destaques: destaques.length ? destaques : ['Destaque 1', 'Destaque 2'],
    };
  }

  protected async escolherFoto(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    campo.value = '';
    if (!arquivo || this.enviandoFoto()) return;
    this.enviandoFoto.set(true);
    this.erro.set('');
    try {
      const [referencia] = await this.armazenamento.enviar([arquivo], { tipo: 'SOBRE' });
      this.foto.set(referencia ?? null);
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível enviar a foto. Tente de novo.'));
    } finally {
      this.enviandoFoto.set(false);
    }
  }

  protected salvar(): void {
    if (this.salvando() || this.enviandoFoto()) return;
    this.tentou.set(true);
    if (!this.nome().trim() || !this.titulo().trim() || !this.texto().trim() || this.anoInvalido()) return;
    const estilo = this.estilo();
    this.salvo.emit({
      nome: this.nome().trim(),
      sobre: {
        estilo,
        titulo: this.titulo().trim(),
        texto: this.texto().trim(),
        foto: this.foto(),
        // os extras dos outros estilos ficam guardados: trocar de estilo não apaga o que foi escrito
        assinatura: this.assinatura().trim() || null,
        desde: this.desde().trim() ? Number(this.desde().trim()) : null,
        destaques: [this.destaque1(), this.destaque2()].map((d) => d.trim()).filter(Boolean),
      },
    });
  }
}
