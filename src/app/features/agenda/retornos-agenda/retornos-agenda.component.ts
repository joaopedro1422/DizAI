import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ERRO_AO_CARREGAR, mensagemDoErro } from '../../../core/api/erro-api';
import { Cliente } from '../../../core/models/cliente.model';
import { Produto } from '../../../core/models/produto.model';
import { RetornoCliente, mensagemDoRetorno } from '../../../core/models/retorno-cliente.model';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { RetornoClienteService } from '../../../core/services/retorno-cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { diaPorExtenso, hojeIso, somarDias } from '../../../core/utils/datas-agenda';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { SeletorServicoComponent } from '../seletor-servico/seletor-servico.component';

/** Atalhos de data no modal: o intervalo de retorno mais comum (o gel volta em 21 dias, o corte em 30). */
const ATALHOS_DIAS = [15, 21, 30, 45];

/** O mesmo cliente com ou sem o 9º dígito (como a `Telefone.chave` do back). */
function chaveCliente(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  return digitos.length === 13 && digitos.startsWith('55') && digitos[4] === '9'
    ? digitos.slice(0, 4) + digitos.slice(5)
    : digitos;
}

/** O cliente aberto no modal: da lista de clientes ou de um retorno já marcado. */
interface ClienteDoRetorno {
  nome: string;
  numero: string;
  whatsapp: string;
}

@Component({
  selector: 'app-retornos-agenda',
  imports: [AvatarComponent, BottomSheetComponent, CarregandoComponent, IconeComponent, SeletorServicoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './retornos-agenda.component.html',
  styleUrl: './retornos-agenda.component.css',
})
export class RetornosAgendaComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly retornoService = inject(RetornoClienteService);
  private readonly toast = inject(ToastService);
  private readonly produtos = inject(ProdutoService).produtos;
  private readonly produtoService = inject(ProdutoService);

  protected readonly carregando = signal(true);
  protected readonly busca = signal('');
  protected readonly atalhos = ATALHOS_DIAS;
  protected readonly amanha = somarDias(hojeIso(), 1);

  /** Os que ainda vão receber o lembrete (os próximos primeiro) e os que já receberam. */
  protected readonly pendentes = computed(() =>
    this.retornoService.retornos().filter((r) => !r.lembreteEnviadoEm && r.data >= hojeIso()),
  );
  protected readonly enviados = computed(() =>
    this.retornoService.retornos().filter((r) => r.lembreteEnviadoEm).reverse().slice(0, 10),
  );

  /** Clientes da busca; o retorno pendente de cada um aparece ao lado do nome. */
  protected readonly clientes = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const digitos = termo.replace(/\D/g, '');
    return this.clienteService.clientes().filter(
      (c) => !termo || c.nome.toLowerCase().includes(termo) || (digitos.length >= 3 && c.numero.includes(digitos)),
    );
  });
  private readonly pendentePorCliente = computed(
    () => new Map(this.pendentes().map((r) => [chaveCliente(r.numero), r] as const)),
  );

  // ---------- modal ----------
  protected readonly aberto = signal<ClienteDoRetorno | null>(null);
  protected readonly data = signal('');
  protected readonly descricao = signal('');
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly existente = computed(() => {
    const cliente = this.aberto();
    return cliente ? (this.pendentePorCliente().get(chaveCliente(cliente.numero)) ?? null) : null;
  });
  /** Os serviços que dá para agendar (os mesmos do "Agendar horário"): o retorno é escolhido entre eles. */
  protected readonly servicos = computed(() =>
    this.produtoService.produtos().filter((p) => p.disponivel && !p.produtoAVenda && p.duracaoMinutos),
  );
  /** O serviço da descrição (retorno marcado antes, em texto livre, pode não bater com nenhum). */
  protected readonly idsEscolhidos = computed(() => {
    const nome = this.descricao().trim().toLowerCase();
    const servico = this.servicos().find((s) => s.nome.trim().toLowerCase() === nome);
    return servico ? [servico.id] : [];
  });
  protected readonly previa = computed(() => mensagemDoRetorno(this.aberto()?.nome ?? null, this.descricao()));
  /** "O lembrete sai quinta, 19/11, às 10:00". */
  protected readonly quandoSai = computed(() =>
    this.data() >= this.amanha ? `O lembrete sai ${diaPorExtenso(somarDias(this.data(), -1))}, às 10:00.` : '',
  );

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([this.clienteService.carregar(), this.retornoService.carregar(), this.produtoService.carregar()]);
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro, ERRO_AO_CARREGAR));
    } finally {
      this.carregando.set(false);
    }
  }

  protected retornoDe(cliente: Cliente): RetornoCliente | null {
    return cliente.numero ? (this.pendentePorCliente().get(chaveCliente(cliente.numero)) ?? null) : null;
  }

  protected abrirCliente(cliente: Cliente): void {
    if (!cliente.numero) return;
    this.abrir({ nome: cliente.nome, numero: cliente.numero, whatsapp: cliente.whatsapp });
  }

  protected abrirRetorno(retorno: RetornoCliente): void {
    this.abrir({ nome: retorno.nome ?? '', numero: retorno.numero, whatsapp: retorno.whatsapp });
  }

  private abrir(cliente: ClienteDoRetorno): void {
    this.aberto.set(cliente);
    const existente = this.existente();
    this.data.set(existente?.data ?? '');
    this.descricao.set(existente?.descricao ?? '');
    this.erro.set(null);
  }

  /** O nome do serviço escolhido vai para a mensagem do lembrete ("…do seu retorno para Esmaltação em gel."). */
  protected escolherServico(servico: Produto): void {
    this.descricao.set(servico.nome);
    this.erro.set(null);
  }

  protected escolherAtalho(dias: number): void {
    this.data.set(somarDias(hojeIso(), dias));
  }

  protected digitar(campo: 'data' | 'descricao', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    (campo === 'data' ? this.data : this.descricao).set(valor);
    this.erro.set(null);
  }

  protected digitarBusca(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected async salvar(): Promise<void> {
    const cliente = this.aberto();
    if (!cliente) return;
    if (!this.data() || this.data() < this.amanha) {
      this.erro.set('Escolha uma data a partir de amanhã.');
      return;
    }
    if (!this.descricao().trim()) {
      this.erro.set(this.servicos().length ? 'Escolha o serviço do retorno.' : 'Escreva para que é o retorno.');
      return;
    }
    this.salvando.set(true);
    try {
      await this.retornoService.salvar({
        numero: cliente.numero,
        nome: cliente.nome,
        data: this.data(),
        descricao: this.descricao().trim(),
      });
      this.aberto.set(null);
      this.toast.mostrar('Retorno marcado');
    } catch (erro) {
      this.erro.set(mensagemDoErro(erro, 'Não foi possível marcar o retorno. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  protected async excluir(retorno: RetornoCliente): Promise<void> {
    try {
      await this.retornoService.excluir(retorno.id);
      if (this.aberto()) this.aberto.set(null);
      this.toast.mostrar('Retorno removido');
    } catch (erro) {
      this.toast.mostrar(mensagemDoErro(erro, 'Não foi possível remover o retorno. Tente de novo.'));
    }
  }

  protected dia(iso: string): string {
    return diaPorExtenso(iso);
  }

  protected nomeDo(retorno: RetornoCliente): string {
    return retorno.nome || retorno.whatsapp;
  }
}
