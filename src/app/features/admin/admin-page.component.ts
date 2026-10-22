import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { LojaAdmin, SenhaTemporaria, SolicitacaoSenha } from '../../core/models/admin.model';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { pluralizar } from '../../core/utils/colecao.utils';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { TempoDecorridoPipe } from '../../shared/pipes/tempo-decorrido.pipe';
import { CabecalhoPaginaComponent } from '../../shared/components/cabecalho-pagina/cabecalho-pagina.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';

type FiltroLoja = 'todas' | 'conectadas' | 'sem-whatsapp' | 'ia-ligada' | 'sem-atividade';
type OrdemLojas = 'recentes' | 'ativas' | 'custo';

/** A senha temporária que acabou de ser gerada (só existe nesta tela, até fechar). */
interface SenhaGerada extends SenhaTemporaria {
  nome: string;
}

interface Metrica {
  rotulo: string;
  valor: string;
  detalhe: string;
}

const FILTROS: { valor: FiltroLoja; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'conectadas', rotulo: 'WhatsApp conectado' },
  { valor: 'sem-whatsapp', rotulo: 'Sem WhatsApp' },
  { valor: 'ia-ligada', rotulo: 'Assistente ligado' },
  { valor: 'sem-atividade', rotulo: 'Sem conversas (30 dias)' },
];

const DOLAR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });
const INTEIRO = new Intl.NumberFormat('pt-BR');

/** Gerenciamento da plataforma: só para as contas marcadas como admin (adminGuard + 403 na API). */
@Component({
  selector: 'app-admin-page',
  imports: [CabecalhoPaginaComponent, CarregandoComponent, EstadoVazioComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-page.component.html',
  styleUrls: ['../../shared/estilos-listagem.css', './admin-page.component.css'],
})
export class AdminPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly tempoDecorrido = new TempoDecorridoPipe();

  protected readonly painel = this.adminService.painel;
  protected readonly carregando = this.adminService.carregando;
  protected readonly filtros = FILTROS;
  protected readonly filtroAtual = signal<FiltroLoja>('todas');
  protected readonly busca = signal('');
  protected readonly ordem = signal<OrdemLojas>('recentes');

  /** "Esqueci minha senha" ainda abertos. */
  protected readonly solicitacoesSenha = this.adminService.solicitacoesSenha;
  protected readonly senhaGerada = signal<SenhaGerada | null>(null);
  /** O pedido com uma ação em andamento (gerar ou descartar). */
  protected readonly atendendo = signal<string | null>(null);

  protected readonly subtitulo = computed(() => {
    const painel = this.painel();
    if (!painel) {
      return 'Lojas, conexões e uso da plataforma';
    }
    const hora = new Date(painel.geradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Atualizado às ${hora}`;
  });

  protected readonly metricas = computed<Metrica[]>(() => {
    const resumo = this.painel()?.resumo;
    if (!resumo) {
      return [];
    }
    return [
      {
        rotulo: 'Lojas cadastradas',
        valor: INTEIRO.format(resumo.totalLojas),
        detalhe: `+${resumo.lojasNovas7Dias} em 7 dias · +${resumo.lojasNovas30Dias} em 30`,
      },
      {
        rotulo: 'WhatsApp conectado',
        valor: INTEIRO.format(resumo.whatsappConectado),
        detalhe: `${porcentagem(resumo.whatsappConectado, resumo.totalLojas)} das lojas`,
      },
      {
        rotulo: 'Assistente ligado',
        valor: INTEIRO.format(resumo.iaAtiva),
        detalhe: `${porcentagem(resumo.iaAtiva, resumo.totalLojas)} das lojas`,
      },
      {
        rotulo: 'Lojas ativas',
        valor: INTEIRO.format(resumo.lojasAtivas7Dias),
        detalhe: 'com mensagens em 7 dias',
      },
      {
        rotulo: 'Mensagens de clientes',
        valor: INTEIRO.format(resumo.mensagensClientes7Dias),
        detalhe: `${INTEIRO.format(resumo.mensagensAssistente7Dias)} respostas do assistente · 7 dias`,
      },
      {
        rotulo: 'Aguardando o dono',
        valor: INTEIRO.format(resumo.conversasAguardandoDono),
        detalhe: 'conversas transferidas agora',
      },
      {
        rotulo: 'Custo da IA no mês',
        valor: DOLAR.format(resumo.custoIaMesUsd),
        detalhe: `${INTEIRO.format(resumo.chamadasIaMes)} chamadas · estimado`,
      },
      {
        rotulo: 'Tour concluído',
        valor: INTEIRO.format(resumo.onboardingConcluido),
        detalhe: `${porcentagem(resumo.onboardingConcluido, resumo.totalLojas)} terminaram o passo a passo`,
      },
    ];
  });

  protected readonly lojasFiltradas = computed(() => {
    const lojas = this.painel()?.lojas ?? [];
    const termo = normalizar(this.busca());
    const digitos = this.busca().replace(/\D/g, '');
    const filtradas = lojas.filter(
      (loja) =>
        passaNoFiltro(loja, this.filtroAtual()) &&
        (!termo ||
          normalizar(`${loja.nomeLoja} ${loja.nomeDono} ${loja.slug ?? ''}`).includes(termo) ||
          (digitos.length >= 3 && loja.numeroWhatsapp.includes(digitos))),
    );
    return ordenar(filtradas, this.ordem());
  });

  protected readonly resumoLista = computed(() => {
    const total = this.painel()?.lojas.length ?? 0;
    const visiveis = this.lojasFiltradas().length;
    return visiveis === total ? pluralizar(total, 'loja', 'lojas') : `${visiveis} de ${total}`;
  });

  ngOnInit(): void {
    void this.recarregar();
  }

  protected async recarregar(): Promise<void> {
    try {
      await this.adminService.carregar();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    }
  }

  protected async gerarSenha(solicitacao: SolicitacaoSenha): Promise<void> {
    if (this.atendendo()) {
      return;
    }
    this.atendendo.set(solicitacao.id);
    try {
      const senha = await this.adminService.gerarSenhaTemporaria(solicitacao.id);
      this.senhaGerada.set({ ...senha, nome: primeiroNome(solicitacao.nomeDono || solicitacao.nomeInformado) });
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível gerar a senha. Tente de novo.'));
    } finally {
      this.atendendo.set(null);
    }
  }

  protected async descartarSolicitacao(solicitacao: SolicitacaoSenha): Promise<void> {
    if (this.atendendo()) {
      return;
    }
    this.atendendo.set(solicitacao.id);
    try {
      await this.adminService.descartarSolicitacao(solicitacao.id);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível descartar o pedido.'));
    } finally {
      this.atendendo.set(null);
    }
  }

  protected async copiarSenha(senha: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(senha);
      this.toastService.mostrar('Senha copiada');
    } catch {
      this.toastService.mostrar('Não foi possível copiar. Selecione a senha e copie.');
    }
  }

  /** Abre o WhatsApp com a mensagem pronta para o lojista (sai do seu WhatsApp, você confere antes de enviar). */
  protected linkEnvioSenha(gerada: SenhaGerada): string {
    const texto =
      `Oi${gerada.nome ? ', ' + gerada.nome : ''}! Sua senha temporária do DizAI é: ${gerada.senha}\n\n` +
      'Entre com ela no painel e crie a sua senha nova no menu da conta (⋮) → "Alterar senha".';
    return `${gerarLinkWhatsapp(gerada.numeroWhatsapp)}?text=${encodeURIComponent(texto)}`;
  }

  protected quandoPediu(solicitacao: SolicitacaoSenha): string {
    return `há ${this.tempoDecorrido.transform(new Date(solicitacao.criadoEm))}`;
  }

  protected filtrar(filtro: FiltroLoja): void {
    this.filtroAtual.set(filtro);
  }

  protected buscar(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected ordenar(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (valor === 'recentes' || valor === 'ativas' || valor === 'custo') {
      this.ordem.set(valor);
    }
  }

  protected situacaoWhatsapp(loja: LojaAdmin): { rotulo: string; classe: string } {
    if (loja.whatsappStatus === 'CONECTADO') {
      return { rotulo: 'WhatsApp conectado', classe: 'selo--ok' };
    }
    if (loja.whatsappStatus === 'DESCONECTADO') {
      return { rotulo: 'WhatsApp desconectado', classe: 'selo--alerta' };
    }
    return { rotulo: 'Nunca conectou', classe: 'selo--neutro' };
  }

  protected atividade(loja: LojaAdmin): string {
    if (!loja.ultimaMensagemEm) {
      return 'sem conversas em 30 dias';
    }
    const conversas = pluralizar(loja.conversas30Dias, 'conversa', 'conversas');
    return `${conversas} em 30 dias · última há ${this.tempoDecorrido.transform(new Date(loja.ultimaMensagemEm))}`;
  }

  protected dataCadastro(loja: LojaAdmin): string {
    return new Date(loja.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  protected custo(loja: LojaAdmin): string {
    return DOLAR.format(loja.custoIaMesUsd);
  }

  protected linkWhatsapp(loja: LojaAdmin): string {
    return gerarLinkWhatsapp(loja.numeroWhatsapp);
  }
}

function passaNoFiltro(loja: LojaAdmin, filtro: FiltroLoja): boolean {
  switch (filtro) {
    case 'conectadas':
      return loja.whatsappStatus === 'CONECTADO';
    case 'sem-whatsapp':
      return loja.whatsappStatus !== 'CONECTADO';
    case 'ia-ligada':
      return loja.iaAtiva;
    case 'sem-atividade':
      return loja.conversas30Dias === 0;
    default:
      return true;
  }
}

/** A lista do backend já vem das mais novas para as mais antigas. */
function ordenar(lojas: LojaAdmin[], ordem: OrdemLojas): LojaAdmin[] {
  if (ordem === 'ativas') {
    return [...lojas].sort((a, b) => b.conversas30Dias - a.conversas30Dias);
  }
  if (ordem === 'custo') {
    return [...lojas].sort((a, b) => b.custoIaMesUsd - a.custoIaMesUsd);
  }
  return lojas;
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}

function porcentagem(parte: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((parte / total) * 100)}%`;
}

/** Sem acentos e em minúsculas, para a busca achar "Doçaria" digitando "docaria". */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
