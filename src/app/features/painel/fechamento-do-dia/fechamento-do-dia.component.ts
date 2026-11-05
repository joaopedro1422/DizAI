import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { urlDaImagem } from '../../../core/imagens/url-imagem';
import { ResumoDoDia } from '../../../core/models/resumo-do-dia.model';
import { PerfilService } from '../../../core/services/perfil.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

/** Uma linha da ficha (rótulo à esquerda, valor à direita). */
interface LinhaFicha {
  rotulo: string;
  valor: string;
}

/** Um dos três números logo abaixo do faturamento. */
interface Indicador {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const DURACAO_CONTAGEM_MS = 900;

/** "1h 36min", "24 min", "2h". */
export function textoDoTempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas}h ${resto}min` : `${horas}h`;
}

/** "sábado passado", "segunda passada". */
function diaDaSemanaPassada(data: Date): string {
  const nome = data.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
  const masculino = data.getDay() === 0 || data.getDay() === 6;
  return `${nome} ${masculino ? 'passado' : 'passada'}`;
}

@Component({
  selector: 'app-fechamento-do-dia',
  imports: [IconeComponent, RouterLink],
  templateUrl: './fechamento-do-dia.component.html',
  styleUrls: ['./fechamento-do-dia.component.css', './fechamento-conteudo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'fechar.emit()' },
})
export class FechamentoDoDiaComponent implements AfterViewInit, OnDestroy {
  readonly resumo = input.required<ResumoDoDia>();
  readonly fechar = output<void>();

  private readonly perfil = inject(PerfilService).perfil;
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private overflowAnterior = '';
  private quadro = 0;

  protected readonly nomeLoja = computed(() => this.perfil().nomeLoja || 'Sua loja');
  protected readonly logo = computed(() => urlDaImagem(this.perfil().fotoPerfilUrl));
  protected readonly inicial = computed(() => this.nomeLoja().trim().charAt(0).toUpperCase());

  protected readonly servicos = computed(() => this.resumo().servicos);
  protected readonly produtos = computed(() => this.resumo().produtos);

  private readonly dia = computed(() => {
    const [ano, mes, dia] = this.resumo().data.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  });

  /** "Sábado, 24 de outubro". */
  protected readonly dataPorExtenso = computed(() => {
    const texto = this.dia().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });

  protected readonly situacao = computed(() => {
    const r = this.resumo();
    if (!r.encerrado) return 'Parcial, até agora';
    return r.fechouAs ? `Encerrado às ${r.fechouAs}` : 'Dia encerrado';
  });

  protected readonly faturamento = computed(() => this.servicos()?.faturamento ?? this.produtos()?.faturamento ?? 0);

  /** O valor do destaque sobe de zero até o faturamento quando o modal abre. */
  protected readonly faturamentoNaTela = signal(0);
  protected readonly reais = computed(() => {
    const texto = MOEDA.format(this.faturamentoNaTela());
    const virgula = texto.lastIndexOf(',');
    return { inteiro: texto.slice(0, virgula), centavos: texto.slice(virgula) };
  });

  protected readonly rotuloFaturamento = computed(() =>
    this.servicos() ? 'Faturamento dos atendimentos' : 'Faturamento dos pedidos entregues',
  );

  /** Em relação ao mesmo dia da semana anterior; sem faturamento naquele dia, não aparece. */
  protected readonly comparacao = computed(() => {
    const anterior = this.servicos()?.semanaPassada ?? this.produtos()?.semanaPassada ?? 0;
    if (anterior <= 0) return null;
    const variacao = Math.round(((this.faturamento() - anterior) / anterior) * 100);
    const quando = diaDaSemanaPassada(this.dia());
    if (variacao === 0) return { tipo: 'igual', texto: `Igual a ${quando}` };
    return {
      tipo: variacao > 0 ? 'sobe' : 'desce',
      texto: `${variacao > 0 ? '+' : '−'}${Math.abs(variacao)}% em relação a ${quando}`,
    };
  });

  protected readonly indicadores = computed<Indicador[]>(() => {
    const s = this.servicos();
    if (s) {
      const lista: Indicador[] = [
        {
          rotulo: 'Agendamentos',
          valor: String(s.agendamentos),
          detalhe: s.atendidos < s.agendamentos ? `${s.atendidos} atendidos` : undefined,
        },
        { rotulo: 'Ticket médio', valor: MOEDA.format(s.ticketMedio) },
      ];
      lista.push(
        s.ocupacao !== null
          ? { rotulo: 'Ocupação', valor: `${s.ocupacao}%` }
          : { rotulo: 'Cancelados', valor: String(s.cancelados) },
      );
      return lista;
    }
    const p = this.produtos()!;
    return [
      { rotulo: 'Vendas', valor: String(p.vendas), detalhe: p.vendas ? MOEDA.format(p.valorVendido) : undefined },
      { rotulo: 'Entregues', valor: String(p.entregues) },
      { rotulo: 'Ticket médio', valor: MOEDA.format(p.ticketMedio) },
    ];
  });

  protected readonly ficha = computed<LinhaFicha[]>(() => {
    const s = this.servicos();
    if (s) {
      const linhas: LinhaFicha[] = [
        { rotulo: 'Marcados pelo assistente', valor: String(s.marcadosPeloAssistente) },
        { rotulo: 'Clientes novos', valor: String(s.clientesNovos) },
        { rotulo: 'Clientes que voltaram', valor: String(s.clientesQueVoltaram) },
      ];
      if (s.ocupacao !== null) linhas.push({ rotulo: 'Cancelados', valor: String(s.cancelados) });
      if (s.produtosVendidos > 0) {
        linhas.push({
          rotulo: `Produtos vendidos (${s.produtosVendidos})`,
          valor: MOEDA.format(s.faturamentoProdutos),
        });
      }
      return linhas;
    }
    const p = this.produtos()!;
    const linhas: LinhaFicha[] = [
      {
        rotulo: 'Em andamento',
        valor: p.emAndamento ? `${p.emAndamento} · ${MOEDA.format(p.valorEmAndamento)}` : '0',
      },
      { rotulo: 'Cancelados', valor: String(p.cancelados) },
    ];
    if (p.preparoMedio !== null) linhas.push({ rotulo: 'Preparo médio', valor: textoDoTempo(p.preparoMedio) });
    return linhas;
  });

  /** Barras dos profissionais, proporcionais ao que mais faturou. */
  protected readonly profissionais = computed(() => {
    const lista = this.servicos()?.porProfissional ?? [];
    const maior = Math.max(0, ...lista.map((p) => p.faturamento));
    return lista.map((p) => ({
      ...p,
      valor: MOEDA.format(p.faturamento),
      largura: maior > 0 ? Math.max(3, Math.round((p.faturamento / maior) * 100)) : 0,
    }));
  });

  protected readonly ranking = computed(() => {
    const s = this.servicos();
    if (s) {
      return {
        titulo: 'Serviços mais feitos',
        itens: s.servicosMaisFeitos.map((i) => ({ nome: i.nome, valor: `${i.quantidade}×` })),
      };
    }
    return {
      titulo: 'Mais vendidos',
      itens: (this.produtos()?.maisVendidos ?? []).map((i) => ({
        nome: i.nome,
        valor: `${i.quantidade} ${i.quantidade === 1 ? 'pedido' : 'pedidos'} · ${MOEDA.format(i.valor ?? 0)}`,
      })),
    };
  });

  protected readonly tempoEconomizado = computed(() => textoDoTempo(this.resumo().minutosEconomizados));

  protected readonly textoAssistente = computed(() => {
    const r = this.resumo();
    const mensagens = `${r.mensagensAssistente} ${r.mensagensAssistente === 1 ? 'mensagem' : 'mensagens'}`;
    const conversas = `${r.conversas} ${r.conversas === 1 ? 'conversa' : 'conversas'}`;
    return `O assistente enviou ${mensagens} em ${conversas} no seu lugar.`;
  });

  protected readonly amanha = computed(() => {
    const s = this.servicos();
    if (!s) return null;
    if (s.amanha === 0) return 'Nenhum horário marcado ainda.';
    const horarios = `${s.amanha} ${s.amanha === 1 ? 'horário marcado' : 'horários marcados'}`;
    return s.amanhaPrimeiroHorario ? `${horarios}, o primeiro às ${s.amanhaPrimeiroHorario}.` : `${horarios}.`;
  });

  protected readonly destino = computed(() =>
    this.servicos()
      ? { rota: this.rotas().agenda, texto: 'Ver a agenda' }
      : { rota: this.rotas().pedidos, texto: 'Ver os pedidos' },
  );

  ngAfterViewInit(): void {
    this.overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.elemento.nativeElement.querySelector<HTMLElement>('.fechamento')?.focus();
    this.contar();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.overflowAnterior;
    cancelAnimationFrame(this.quadro);
  }

  private contar(): void {
    const alvo = this.faturamento();
    if (alvo <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.faturamentoNaTela.set(alvo);
      return;
    }
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / DURACAO_CONTAGEM_MS);
      const suave = 1 - Math.pow(1 - t, 3);
      this.faturamentoNaTela.set(t < 1 ? Math.round(alvo * suave * 100) / 100 : alvo);
      if (t < 1) this.quadro = requestAnimationFrame(passo);
    };
    this.quadro = requestAnimationFrame(passo);
  }
}
