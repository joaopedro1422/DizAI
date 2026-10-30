import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

import { SessaoService } from '../../../core/auth/sessao.service';
import { ramoDeServico, ramoUsaAgenda } from '../../../core/models/perfil.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { ConteudoRamoService } from '../../../core/services/conteudo-ramo.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { PerguntaFrequenteService } from '../../../core/services/pergunta-frequente.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { TesteAtendimentoService } from '../../../core/services/teste-atendimento.service';
import { IconeComponent } from '../../../shared/components/icone/icone.component';
import {
  marcarTesteFeito,
  ocultarPrimeirosPassos,
  perguntaDoPrimeiroTeste,
  primeirosPassosOcultos,
  testeFeito,
} from './progresso-onboarding';

/** Perguntas frequentes que contam como "respondidas" no passo. */
const PERGUNTAS_DO_PASSO = 3;

interface PassoInicial {
  titulo: string;
  detalhe: string;
  feito: boolean;
  rota?: string;
  parametros?: Params;
}

/**
 * "Primeiros passos" no topo do painel: o que falta para o assistente atender de verdade, com o teste logo depois do
 * primeiro produto (é quando o lojista vê o valor). Cada passo se marca sozinho pelos dados da loja; o card some quando
 * tudo está feito ou com "Ocultar".
 */
@Component({
  selector: 'app-primeiros-passos',
  imports: [RouterLink, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './primeiros-passos.component.html',
  styleUrl: './primeiros-passos.component.css',
})
export class PrimeirosPassosComponent implements OnInit {
  private readonly perfil = inject(PerfilService).perfil;
  private readonly produtos = inject(ProdutoService).produtos;
  private readonly perguntas = inject(PerguntaFrequenteService).perguntas;
  private readonly testeAtendimento = inject(TesteAtendimentoService);
  private readonly rotas = inject(SessaoService).rotasDoPainel;
  private readonly conteudo = inject(ConteudoRamoService).conteudo;
  private readonly agenda = inject(AgendaService);
  private readonly usaAgenda = computed(() => ramoUsaAgenda(this.perfil().ramo));

  private readonly testou = signal(false);
  private readonly oculto = signal(false);

  protected readonly passos = computed<PassoInicial[]>(() => {
    const rotas = this.rotas();
    const respondidas = Math.min(this.perguntas().length, PERGUNTAS_DO_PASSO);
    return [
      { titulo: 'Loja criada', detalhe: '', feito: true },
      {
        titulo: `Cadastrar o primeiro ${this.conteudo().termoItem}`,
        detalhe: 'Nome, preço e as opções',
        feito: this.produtos().length > 0,
        rota: rotas.produtos,
        parametros: { novo: 1 },
      },
      // serviços com agenda: sem os dias e horários, o assistente não tem horário para oferecer no teste
      ...(this.usaAgenda()
        ? [
            {
              titulo: 'Cadastrar os seus horários',
              detalhe: 'Os dias e horários em que você atende',
              feito: (this.agenda.configuracao()?.periodos.length ?? 0) > 0,
              rota: rotas.agenda,
            },
          ]
        : []),
      {
        titulo: 'Testar o atendimento',
        detalhe: 'Converse com ele como se fosse cliente',
        feito: this.testou(),
        rota: rotas.atendimento,
        // a mensagem já vai escrita: nos serviços, agendar o primeiro serviço para amanhã
        parametros: {
          testar: 1,
          pergunta: perguntaDoPrimeiroTeste(
            ramoDeServico(this.perfil().ramo),
            this.produtos().find((produto) => !produto.produtoAVenda)?.nome,
          ),
        },
      },
      {
        titulo: 'Responder 3 perguntas frequentes',
        detalhe: `${respondidas} de ${PERGUNTAS_DO_PASSO}`,
        feito: respondidas >= PERGUNTAS_DO_PASSO,
        rota: rotas.perguntas,
      },
      {
        titulo: 'Conectar o WhatsApp',
        detalhe: 'O assistente começa a responder os clientes',
        feito: this.perfil().whatsappConectado,
        rota: rotas.conectarWhatsapp,
      },
    ];
  });

  protected readonly feitos = computed(() => this.passos().filter((passo) => passo.feito).length);
  protected readonly progresso = computed(() => (this.feitos() / this.passos().length) * 100);
  /** O próximo a fazer ganha o botão "Fazer" em destaque. */
  protected readonly indiceProximo = computed(() => this.passos().findIndex((passo) => !passo.feito));
  protected readonly visivel = computed(() => !this.oculto() && this.indiceProximo() !== -1);

  ngOnInit(): void {
    const perfilId = this.perfil().id;
    this.oculto.set(primeirosPassosOcultos(perfilId));
    if (this.usaAgenda() && !this.oculto() && !this.agenda.configuracao()) {
      void this.agenda.carregarConfiguracao().catch(() => undefined);
    }
    if (testeFeito(perfilId)) {
      this.testou.set(true);
    } else if (!this.oculto()) {
      void this.conferirTeste(perfilId);
    }
  }

  protected ocultar(): void {
    ocultarPrimeirosPassos(this.perfil().id);
    this.oculto.set(true);
  }

  /** Testou em outro aparelho (ou antes deste card existir): a conversa de teste tem mensagem do lojista. */
  private async conferirTeste(perfilId: string): Promise<void> {
    try {
      const mensagens = await this.testeAtendimento.mensagens();
      if (mensagens.some((mensagem) => mensagem.origem === 'CLIENTE')) {
        marcarTesteFeito(perfilId);
        this.testou.set(true);
      }
    } catch {
      // sem a conferência o passo só fica em aberto
    }
  }
}
