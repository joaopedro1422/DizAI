import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RAMOS_NEGOCIO, RAMOS_PARA_ESCOLHER } from '../../../core/constants/opcoes-perfil';
import { PeriodoAtendimento } from '../../../core/models/agenda.model';
import { DadosLoja, RamoNegocio, UnidadeAntecedencia, ramoUsaAgenda } from '../../../core/models/perfil.model';
import { SegmentoNegocio, segmentoDoPerfil, segmentosDoRamo } from '../../../core/constants/segmentos';
import { mensagemDoErro } from '../../../core/api/erro-api';
import { AgendaService } from '../../../core/services/agenda.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { antecedenciaEmMinutos, antecedenciaNaTela } from '../../../core/utils/antecedencia';
import { ToastService } from '../../../core/services/toast.service';
import { formatarTelefone } from '../../../core/utils/texto.utils';
import { campoComErro, telefoneValido } from '../../../core/utils/validadores';
import { CarregandoComponent } from '../../../shared/components/carregando/carregando.component';
import {
  GrupoPagamentoEntrega,
  criarGrupoDadosNegocio,
  criarGrupoPagamentoEntrega,
} from '../../cadastro/cadastro-formulario';
import { EtapaDadosNegocioComponent } from '../../cadastro/etapas/etapa-dados-negocio.component';
import { EtapaPagamentoEntregaComponent } from '../../cadastro/etapas/etapa-pagamento-entrega.component';
import { HorarioFuncionamentoComponent } from '../../atendimento/horario-funcionamento/horario-funcionamento.component';

/**
 * Formulário do modal "Dados da loja". Reaproveita os campos e validações do cadastro,
 * já preenchidos com o perfil atual.
 */
@Component({
  selector: 'app-editar-perfil',
  imports: [
    ReactiveFormsModule,
    EtapaDadosNegocioComponent,
    EtapaPagamentoEntregaComponent,
    CarregandoComponent,
    HorarioFuncionamentoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css',
})
export class EditarPerfilComponent {
  readonly salvo = output<void>();

  private readonly perfilService = inject(PerfilService);
  private readonly agendaService = inject(AgendaService);
  private readonly toastService = inject(ToastService);

  // "Produtos em geral" só aparece para quem já está nele
  protected readonly ramos = this.perfilService.perfil().ramo === 'PRODUTOS_GERAIS' ? RAMOS_NEGOCIO : RAMOS_PARA_ESCOLHER;
  protected readonly salvando = signal(false);
  protected readonly formulario = this.criarFormularioPreenchido();

  /**
   * Horário de funcionamento da loja: limita os pedidos (o assistente calcula o primeiro horário possível) e,
   * com "Só no meu horário de funcionamento", também a confirmação. "Sempre" = sem horário fixo.
   */
  private readonly ramoEscolhido = toSignal(this.formulario.controls.ramo.valueChanges, {
    initialValue: this.formulario.controls.ramo.value,
  });
  /** Serviço presencial: pode copiar os horários da agenda. */
  protected readonly usaAgenda = computed(() => ramoUsaAgenda(this.ramoEscolhido()));
  protected readonly ramoAtual = computed(() => this.ramoEscolhido());

  /** O tipo do negócio dentro do ramo (só exemplos e tutoriais); trocar o ramo deixa sem tipo até escolher outro. */
  protected readonly segmento = signal<SegmentoNegocio | null>(this.perfilService.perfil().segmento ?? null);
  protected readonly segmentos = computed(() => segmentosDoRamo(this.ramoEscolhido()));
  protected readonly segmentoDoRamo = computed(() => segmentoDoPerfil(this.ramoEscolhido(), this.segmento())?.valor ?? null);
  /** Serviço com agendamento automático: quem manda é a agenda; o horário daqui só confundiria. */
  protected readonly mostrarHorario = computed(
    () => !(this.usaAgenda() && this.perfilService.perfil().modoPedido === 'AGENDAMENTO_AUTOMATICO'),
  );
  protected readonly horarios = signal<PeriodoAtendimento[]>(this.perfilService.perfil().horariosFuncionamento ?? []);
  protected readonly horarioLivre = signal(this.perfilService.perfil().horarioLivre === true);
  protected readonly horarioInvalido = computed(
    () => !this.horarioLivre() && this.horarios().some((h) => h.fim <= h.inicio),
  );

  protected whatsappComErro(): boolean {
    return campoComErro(this.formulario.controls.whatsapp);
  }

  protected formatarWhatsapp(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.formulario.controls.whatsapp.setValue(formatarTelefone(campo.value));
  }

  protected escolherRamo(ramo: RamoNegocio): void {
    this.formulario.controls.ramo.setValue(ramo);
  }

  protected async salvar(): Promise<void> {
    if (this.salvando()) {
      return;
    }
    if (this.formulario.invalid || (this.mostrarHorario() && this.horarioInvalido())) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    try {
      await this.perfilService.atualizarDadosLoja(this.montarDadosLoja());
      this.salvo.emit();
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível salvar. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  private montarDadosLoja(): DadosLoja {
    const { dadosNegocio, whatsapp, ramo, pagamentoEntrega } = this.formulario.getRawValue();
    return {
      dadosNegocio: { ...dadosNegocio, whatsapp },
      ramo,
      pagamentoEntrega: paraPagamentoEntrega(pagamentoEntrega),
      // escondido (agendamento automático): não mexe no horário salvo
      horariosFuncionamento: this.mostrarHorario() ? this.horarios() : undefined,
      horarioLivre: this.mostrarHorario() ? this.horarioLivre() : undefined,
      segmento: this.segmentoDoRamo(),
    };
  }

  /** Um período por dia: das primeiras às últimas horas de atendimento da agenda (o almoço fica de fora da conta). */
  protected async usarHorariosDaAgenda(): Promise<void> {
    try {
      await this.agendaService.carregarConfiguracao();
      const periodos = this.agendaService.configuracao()?.periodos ?? [];
      if (periodos.length === 0) {
        this.toastService.mostrar('A agenda ainda não tem horários cadastrados.');
        return;
      }
      const porDia = new Map<string, PeriodoAtendimento>();
      for (const p of periodos) {
        const atual = porDia.get(p.diaSemana);
        porDia.set(p.diaSemana, {
          diaSemana: p.diaSemana,
          inicio: atual && atual.inicio < p.inicio ? atual.inicio : p.inicio,
          fim: atual && atual.fim > p.fim ? atual.fim : p.fim,
        });
      }
      this.horarioLivre.set(false);
      this.horarios.set([...porDia.values()]);
    } catch (erro) {
      this.toastService.mostrar(mensagemDoErro(erro, 'Não foi possível abrir os horários da agenda.'));
    }
  }

  private criarFormularioPreenchido() {
    const fb = inject(FormBuilder);
    const formulario = fb.nonNullable.group({
      dadosNegocio: criarGrupoDadosNegocio(fb),
      whatsapp: ['', [Validators.required, telefoneValido]],
      ramo: fb.nonNullable.control<RamoNegocio>('OUTRO'),
      pagamentoEntrega: criarGrupoPagamentoEntrega(fb),
    });
    const perfil = this.perfilService.perfil();
    formulario.setValue({
      dadosNegocio: {
        nomeResponsavel: perfil.nomeResponsavel,
        nomeLoja: perfil.nomeLoja,
        descricao: perfil.descricao,
      },
      whatsapp: perfil.whatsapp,
      ramo: perfil.ramo,
      pagamentoEntrega: {
        formasPagamento: perfil.formasPagamento,
        formasRecebimento: perfil.formasRecebimento,
        distanciaMaximaKm: perfil.distanciaMaximaKm,
        taxaEntrega: perfil.taxaEntrega,
        ...antecedenciaNoFormulario(perfil.antecedenciaMinutos ?? 0),
      },
    });
    return formulario;
  }
}

/** Minutos do backend -> número + unidade da tela (dias, horas cheias ou minutos). */
function antecedenciaNoFormulario(minutos: number): { antecedenciaValor: number; antecedenciaUnidade: UnidadeAntecedencia } {
  const { valor, unidade } = antecedenciaNaTela(minutos);
  return { antecedenciaValor: valor, antecedenciaUnidade: unidade };
}

/** Número + unidade da tela -> minutos para o backend. */
function paraPagamentoEntrega(valores: ValoresPagamentoEntrega): DadosLoja['pagamentoEntrega'] {
  const { antecedenciaValor, antecedenciaUnidade, ...resto } = valores;
  return { ...resto, antecedenciaMinutos: antecedenciaEmMinutos(antecedenciaValor, antecedenciaUnidade) };
}

type ValoresPagamentoEntrega = ReturnType<GrupoPagamentoEntrega['getRawValue']>;
