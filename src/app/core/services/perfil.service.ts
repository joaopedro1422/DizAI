import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../api/api-url';
import { SessaoService } from '../auth/sessao.service';
import { COR_MARCA_PADRAO } from '../constants/cores-marca';
import { ConfiguracoesAtendimento, DadosLoja, Perfil } from '../models/perfil.model';
import { ConfiguracaoVitrine } from '../models/vitrine.model';
import { CarregamentoUnico } from '../utils/carregamento-unico';
import { ResultadoCadastroMeta } from '../whatsapp/cadastro-incorporado-meta.service';

/** Dados da tela WhatsApp › Configuração da API, no painel da Meta. */
export interface ConexaoManualWhatsapp {
  phoneNumberId: string;
  wabaId: string;
  token: string;
}
import { gerarLinkWhatsapp } from '../utils/texto.utils';

/** Perfil antes da primeira resposta do backend (as telas do painel esperam o carregamento). */
const PERFIL_VAZIO: Perfil = {
  id: '',
  nomeResponsavel: '',
  nomeLoja: '',
  descricao: '',
  whatsapp: '',
  slug: '',
  fotoPerfilUrl: null,
  corMarca: COR_MARCA_PADRAO,
  ramo: 'OUTRO',
  formasPagamento: [],
  formasRecebimento: [],
  distanciaMaximaKm: '',
  taxaEntrega: '',
  prazoMinimo: 'SEM_ANTECEDENCIA',
  antecedenciaMinutos: 0,
  modoPedido: 'ENCAMINHAR_AO_DONO',
  camposPedido: '',
  modoFotos: 'GALERIA',
  linkPortfolioExterno: '',
  linkAgendamentoExterno: '',
  saudacaoPersonalizada: '',
  instrucoesObrigatorias: '',
  modoCatalogo: 'NAO',
  catalogoArquivos: [],
  iaAtiva: false,
  whatsappConectado: false,
  onboardingConcluido: false,
  introGaleriaVista: true,
  agendaAtiva: false,
  admin: false,
  confirmaQualquerHora: true,
  horariosFuncionamento: [],
  horarioLivre: false,
};

/**
 * Perfil da loja do lojista logado: /api/perfis/{perfilId}.
 * Toda alteração devolve o perfil atualizado pelo backend, que substitui o estado local.
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  private readonly perfilAtual = signal<Perfil>(PERFIL_VAZIO);
  private readonly carregamento = new CarregamentoUnico();

  readonly perfil = this.perfilAtual.asReadonly();
  readonly carregando = this.carregamento.carregando;

  /** Caminho da galeria pública dentro do app, ex.: /l/bella-studio */
  readonly caminhoPaginaPublica = computed(() => `/l/${this.perfilAtual().slug}`);

  /** Endereço completo para copiar e compartilhar. */
  readonly linkPaginaPublica = computed(() => `${window.location.origin}${this.caminhoPaginaPublica()}`);

  /** Endereço sem "https://", para exibir na tela. */
  readonly linkPaginaPublicaExibicao = computed(() => this.linkPaginaPublica().replace(/^https?:\/\//, ''));

  readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.perfilAtual().whatsapp));

  carregar(): Promise<void> {
    return this.carregamento.executar(() => this.buscar());
  }

  salvarConfiguracoes(configuracoes: ConfiguracoesAtendimento): Promise<void> {
    return this.enviar(this.http.put<Perfil>(this.url('/configuracoes'), configuracoes));
  }

  /**
   * Dados do modal "Dados da loja".
   * O slug não muda, para o link público já compartilhado continuar funcionando.
   */
  atualizarDadosLoja({ dadosNegocio, ramo, pagamentoEntrega, horariosFuncionamento, horarioLivre }: DadosLoja): Promise<void> {
    return this.enviar(
      this.http.put<Perfil>(this.url('/dados-loja'), {
        ...dadosNegocio,
        ramo,
        ...pagamentoEntrega,
        horariosFuncionamento,
        horarioLivre,
      }),
    );
  }

  /** "Facilitador de orçamentos" da tela de produtos: a aba Orçamento da página pública. */
  definirOrcamentoAtivo(ativo: boolean): Promise<void> {
    return this.enviar(this.http.patch<Perfil>(this.url('/orcamento-ativo'), { ativo }));
  }

  /** Liga ou desliga as respostas automáticas do assistente. */
  definirIaAtiva(iaAtiva: boolean): Promise<void> {
    return this.enviar(this.http.patch<Perfil>(this.url('/ia-ativa'), { iaAtiva }));
  }

  /** Guarda a referência da nova foto de perfil (já enviada pelo ArmazenamentoFotosService). */
  atualizarFotoPerfil(fotoPerfilUrl: string): Promise<void> {
    return this.enviar(this.http.patch<Perfil>(this.url('/foto'), { fotoPerfilUrl }));
  }

  /** Salva a identidade completa da vitrine pública em uma única atualização. */
  atualizarConfiguracaoVitrine(configuracao: ConfiguracaoVitrine): Promise<void> {
    return this.enviar(this.http.patch<Perfil>(this.url('/cor-marca'), configuracao));
  }

  /**
   * Conclui a conexão com o WhatsApp oficial usando o que o cadastro da Meta devolveu.
   * O backend troca o code pelo token, inscreve o app na conta e já liga o assistente.
   */
  conectarWhatsapp(resultado: ResultadoCadastroMeta): Promise<void> {
    return this.enviar(this.http.post<Perfil>(this.url('/whatsapp/conexao'), resultado));
  }

  /**
   * Só em desenvolvimento: liga o número de teste da Meta à loja, sem o cadastro incorporado.
   * POST /api/perfis/{id}/whatsapp/conexao-manual (a rota não existe no backend em produção).
   */
  conectarWhatsappManualmente(dados: ConexaoManualWhatsapp): Promise<void> {
    return this.enviar(this.http.post<Perfil>(this.url('/whatsapp/conexao-manual'), dados));
  }

  /**
   * O tour de boas-vindas terminou. A tela não espera a resposta:
   * se a chamada falhar, o tour só aparece de novo no próximo acesso.
   */
  marcarOnboardingConcluido(): void {
    this.perfilAtual.update((perfil) => ({ ...perfil, onboardingConcluido: true }));
    this.http.patch<void>(this.url('/onboarding-concluido'), null).subscribe({ error: () => undefined });
  }

  /** Fechou a apresentação da galeria. Como no onboarding, a tela não espera a resposta. */
  /** A tela da agenda salvou: o card do painel e os textos acompanham sem recarregar o perfil. */
  definirAgendaAtivaLocal(agendaAtiva: boolean): void {
    this.perfilAtual.update((perfil) => ({ ...perfil, agendaAtiva }));
  }

  marcarIntroGaleriaVista(): void {
    this.perfilAtual.update((perfil) => ({ ...perfil, introGaleriaVista: true }));
    this.http.patch<void>(this.url('/intro-galeria-vista'), null).subscribe({ error: () => undefined });
  }

  /** Troca a senha (inclusive a temporária do "Esqueci minha senha", que deixa de valer). */
  async alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    await firstValueFrom(this.http.patch<void>(this.url('/senha'), { senhaAtual, novaSenha }));
    this.perfilAtual.update((perfil) => ({ ...perfil, senhaTemporaria: false }));
  }

  reiniciar(): void {
    this.carregamento.reiniciar();
    this.perfilAtual.set(PERFIL_VAZIO);
  }

  private async buscar(): Promise<void> {
    this.perfilAtual.set(await firstValueFrom(this.http.get<Perfil>(this.url())));
  }

  private async enviar(requisicao: Observable<Perfil>): Promise<void> {
    this.perfilAtual.set(await firstValueFrom(requisicao));
  }

  private url(caminho = ''): string {
    return urlDoPerfil(this.sessao.perfilIdObrigatorio(), caminho);
  }
}
