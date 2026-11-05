import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../core/api/erro-api';
import { SessaoService } from '../../core/auth/sessao.service';
import { Cliente, DetalheCliente } from '../../core/models/cliente.model';
import { ClienteService } from '../../core/services/cliente.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { ramoDeServico } from '../../core/models/perfil.model';
import { pluralizar } from '../../core/utils/colecao.utils';
import { gerarLinkWhatsapp } from '../../core/utils/texto.utils';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../shared/components/carregando/carregando.component';
import { EstadoVazioComponent } from '../../shared/components/estado-vazio/estado-vazio.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { formatarReal } from '../pedidos/textos-pedido';

/** A partir de quantos dias sem vir (ou sem pedir) o cliente entra em "Sumidos". */
const DIAS_PARA_SUMIDO = 45;

type Filtro = 'todos' | 'frequentes' | 'proximos' | 'sumidos';
/** Ordem da lista: atividade mais recente (padrão), mais agendamentos/pedidos ou maior gasto. */
type Ordem = 'recentes' | 'mais' | 'gasto';

const DATA_CURTA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const DATA_COMPLETA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
const HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const MES_ANO = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' });

@Component({
  selector: 'app-clientes-page',
  imports: [RouterLink, IconeComponent, AvatarComponent, BottomSheetComponent, CarregandoComponent, EstadoVazioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clientes-page.component.html',
  styleUrls: ['../../shared/estilos-topo-azul.css', './clientes-page.component.css', './clientes-pc.css'],
})
export class ClientesPageComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly toastService = inject(ToastService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  private readonly perfil = inject(PerfilService).perfil;

  protected readonly rotaChats = computed(() => this.rotas().chats);
  /** Serviços contam agendamentos; produtos, pedidos. */
  protected readonly servico = computed(() => ramoDeServico(this.perfil().ramo));
  protected readonly termo = computed(() => (this.servico() ? 'agendamento' : 'pedido'));

  protected readonly carregando = signal(true);
  protected readonly busca = signal('');
  protected readonly filtro = signal<Filtro>('todos');
  protected readonly ordem = signal<Ordem>('recentes');
  protected readonly aberto = signal<Cliente | null>(null);
  protected readonly detalhe = signal<DetalheCliente | null>(null);
  protected readonly carregandoDetalhe = signal(false);

  protected readonly clientes = this.clienteService.clientes;

  protected readonly filtros = computed(() => {
    const lista = this.clientes();
    return [
      { id: 'todos' as Filtro, rotulo: 'Todos', total: lista.length },
      { id: 'frequentes' as Filtro, rotulo: 'Frequentes', total: lista.filter(frequente).length },
      ...(this.servico() ? [{ id: 'proximos' as Filtro, rotulo: 'Com horário', total: lista.filter((c) => !!c.proximo).length }] : []),
      { id: 'sumidos' as Filtro, rotulo: 'Sumidos', total: lista.filter(sumido).length },
    ];
  });

  protected readonly visiveis = computed(() => {
    const termo = simplificar(this.busca());
    const digitos = this.busca().replace(/\D/g, '');
    const filtro = this.filtro();
    return this.clientes()
      .filter((c) =>
        filtro === 'frequentes' ? frequente(c) : filtro === 'sumidos' ? sumido(c) : filtro === 'proximos' ? !!c.proximo : true,
      )
      .filter((c) => !termo || simplificar(c.nome).includes(termo) || (digitos.length >= 3 && c.numero.includes(digitos)))
      .sort(this.comparar());
  });

  /** A lista já vem da mais recente; nas outras ordens, empate fica pela mais recente (sort estável). */
  private comparar(): (a: Cliente, b: Cliente) => number {
    switch (this.ordem()) {
      case 'mais':
        return (a, b) => b.total - a.total || b.valor - a.valor;
      case 'gasto':
        return (a, b) => b.valor - a.valor || b.total - a.total;
      default:
        return () => 0;
    }
  }

  protected escolherOrdem(evento: Event): void {
    this.ordem.set((evento.target as HTMLSelectElement).value as Ordem);
  }

  ngOnInit(): void {
    this.clienteService
      .carregar()
      .catch((erro: unknown) => this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR)))
      .finally(() => this.carregando.set(false));
  }

  protected digitarBusca(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected async abrir(cliente: Cliente): Promise<void> {
    this.aberto.set(cliente);
    this.detalhe.set(null);
    this.carregandoDetalhe.set(true);
    try {
      this.detalhe.set(await this.clienteService.detalhe(cliente.id));
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
      this.aberto.set(null);
    } finally {
      this.carregandoDetalhe.set(false);
    }
  }

  protected fechar(): void {
    this.aberto.set(null);
    this.detalhe.set(null);
  }

  /** wa.me com um "Oi, Maria!" já escrito. */
  protected linkWhatsapp(cliente: Cliente): string {
    const primeiro = cliente.nome.split(' ')[0];
    const texto = /^[\d(+]/.test(primeiro) ? 'Oi!' : `Oi, ${primeiro}!`;
    return `${gerarLinkWhatsapp(cliente.numero)}?text=${encodeURIComponent(texto)}`;
  }

  protected async copiarNumero(cliente: Cliente): Promise<void> {
    try {
      await navigator.clipboard.writeText(cliente.whatsapp);
      this.toastService.mostrar('Número copiado');
    } catch {
      this.toastService.mostrar('Não foi possível copiar o número');
    }
  }

  protected contagem(total: number): string {
    return pluralizar(total, this.termo(), `${this.termo()}s`);
  }

  protected real(valor: number | null): string {
    return valor === null ? '—' : formatarReal(Number(valor));
  }

  protected dataCurta(data: Date | null): string {
    return data ? DATA_CURTA.format(data) : '—';
  }

  /** "sexta-feira, 24/10 às 14:00". */
  protected dataHora(data: Date): string {
    return `${DATA_COMPLETA.format(data)} às ${HORA.format(data)}`;
  }

  protected desde(data: Date | null): string {
    return data ? MES_ANO.format(data).replace('.', '') : '';
  }

  /** "hoje", "ontem", "há 12 dias", "há 3 meses". */
  protected haQuanto(data: Date | null): string {
    if (!data) return '';
    const dias = Math.floor((Date.now() - data.getTime()) / 86_400_000);
    if (dias <= 0) return 'hoje';
    if (dias === 1) return 'ontem';
    if (dias < 60) return `há ${dias} dias`;
    const meses = Math.floor(dias / 30);
    return meses < 12 ? `há ${meses} meses` : `há ${Math.floor(meses / 12)} ${meses < 24 ? 'ano' : 'anos'}`;
  }

  protected classeSituacao(situacao: string): string {
    return situacao === 'Cancelado' ? 'situacao--cancelado' : situacao === 'Agendado' || situacao === 'Em andamento' || situacao === 'Pronto'
      ? 'situacao--aberto' : 'situacao--feito';
  }
}

function frequente(c: Cliente): boolean {
  return c.total >= 2;
}

/** Já veio (ou pediu) e não volta há 45 dias ou mais, sem horário marcado. */
function sumido(c: Cliente): boolean {
  return c.total > 0 && !c.proximo && !!c.ultimaVez && Date.now() - c.ultimaVez.getTime() >= DIAS_PARA_SUMIDO * 86_400_000;
}

function simplificar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}
