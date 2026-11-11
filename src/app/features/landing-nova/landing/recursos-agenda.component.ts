import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RECURSOS_AGENDA, TABELA_AGENDA } from './conteudo-agendamentos';

/**
 * Recursos da agenda (o conteúdo da seção de produção, na marca nova), no mesmo lugar dos Recursos de vendas: os
 * destaques, o bento (agendamento automático, mensagens automáticas com o card da Maria acompanhando a etapa,
 * vários profissionais, agenda online e relatórios), "Além disso", o antes e depois e a chamada para testar.
 * CSS do bento da agenda em landing-agenda.css; o resto é o mesmo de landing-recursos.css.
 */
@Component({
  selector: 'app-recursos-agenda',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secao faixa nevoa" id="recursos">
      <div class="miolo">
        <div class="cabeca">
          <span class="rotulo">Recursos da agenda</span>
          <h2 class="titulo">Menos tempo no celular.<br /><span class="grifo">Mais horários marcados.</span></h2>
          <p class="apoio">Feito para quem atende com hora marcada: da agenda cheia ao cliente que volta.</p>
        </div>

        <ul class="destaques-rec">
          @for (check of recursos.checks; track check) {
            <li><span class="check">✓</span><span>{{ check }}</span></li>
          }
        </ul>

        <div class="bento bento--agenda">
          <article class="rec rec--a">
            <span class="etiqueta">Agendamento automático</span>
            <h3>Marca o horário conversando, como você faria.</h3>
            <p>O assistente oferece os horários disponíveis, marca, remarca e cancela pelo próprio WhatsApp.</p>
            <div class="rec__visual rec__conversa">
              <span class="msg msg--cliente" style="--i: 0">Tem horário amanhã à tarde para corte e barba?</span>
              <span class="msg msg--loja" style="--i: 1">Tenho às 14:00, 15:30 e 17:00. Qual fica melhor para você?</span>
              <span class="msg msg--cliente" style="--i: 2">15:30</span>
              <span class="msg msg--loja" style="--i: 3">{{ confirmacao }}</span>
            </div>
          </article>

          <article class="rec rec--b">
            <span class="etiqueta">Mensagens automáticas</span>
            <h3>Confirma, lembra e agradece sozinho.</h3>
            <p>Menos faltas e cliente bem tratado, sem você digitar nada.</p>
            <div class="rec__visual">
              <ol class="linha-msgs" aria-hidden="true">
                @for (passo of linhaMensagens; track passo.quando; let i = $index) {
                  <li [style.--i]="i">
                    <span class="linha-msgs__quando">{{ passo.quando }}</span>
                    <span class="msg msg--loja">{{ passo.mensagem }}</span>
                    @if (passo.resposta) {
                      <span class="msg msg--cliente">{{ passo.resposta }}</span>
                    }
                    @if (passo.selo) {
                      <span class="status status--ok">✓ {{ passo.selo }}</span>
                    }
                  </li>
                }
              </ol>
              <div class="editor">
                <small>Os textos são seus</small>
                <span>Oi, <i>{{ '{' }}nome{{ '}' }}</i>! Seu horário de <i>{{ '{' }}servico{{ '}' }}</i> é <i>{{ '{' }}data{{ '}' }}</i> às <i>{{ '{' }}horario{{ '}' }}</i>.</span>
              </div>
            </div>
          </article>

          <article class="rec rec--c">
            <span class="etiqueta">Vários profissionais</span>
            <h3>Uma agenda para toda a equipe.</h3>
            <p>O cliente escolhe com quem ou "qualquer um", e o assistente acha quem está livre.</p>
            <div class="rec__visual">
              <div class="colunas-agenda">
                <span></span><span class="cab">Lucas</span><span class="cab">Luis</span><span class="cab">Sergio</span>
                <span class="hr">9h</span><span class="ag">Corte</span><span class="vz"></span><span class="ag">Luzes</span>
                <span class="hr">10h</span><span class="ag g">Corte + barba</span><span class="ag">Barba</span><span class="ag">Luzes</span>
                <span class="hr">11h</span><span class="ag g">Corte + barba</span><span class="vz vz--novo">Novo</span><span class="ag">Pezinho</span>
              </div>
            </div>
          </article>

          <article class="rec rec--d">
            <span class="etiqueta">Agenda online</span>
            <h3>Seu link com os horários livres.</h3>
            <p>O cliente vê as vagas, escolhe e manda a mensagem pronta. Funciona no Instagram também.</p>
            <div class="rec__visual">
              <div class="pagina-horarios">
                <span class="mono">/l/<b>seu-salao</b>/agenda</span>
                <div class="ph-dias">
                  <span>Qui<b>24</b></span><span class="ativo">Sex<b>25</b></span><span>Sáb<b>26</b></span><span>Ter<b>29</b></span>
                </div>
                <div class="ph-vagas">
                  @for (hora of recursos.horarios; track hora; let i = $index) {
                    <span [style.--i]="i">{{ hora }}</span>
                  }
                </div>
              </div>
            </div>
          </article>

          <article class="rec rec--e">
            <span class="etiqueta">Relatórios e insights</span>
            <h3>Saiba quanto faturou e o que mais vende.</h3>
            <p>Faturamento do mês, ticket médio, serviços mais feitos, dias mais movimentados, quanto cada profissional atendeu e os clientes que mais voltam.</p>
            <div class="rec__visual rec__visual--lado">
              <div class="cartao">
                <small class="cartao__legenda">Faturamento · outubro</small>
                <div class="valor-grande">R$ 6.340,00</div>
                <div class="fatias">
                  @for (fatia of fatias; track fatia.nome; let i = $index) {
                    <span [style.width.%]="fatia.parte" [style.background]="fatia.cor" [style.--i]="i"></span>
                  }
                </div>
                <div class="fatias-legenda">
                  @for (fatia of fatias; track fatia.nome) {
                    <small><i [style.background]="fatia.cor"></i>{{ fatia.nome }} {{ fatia.parte }}%</small>
                  }
                </div>
              </div>
              <div class="cartao">
                <div class="indicadores">
                  <span><small>Atendimentos</small><b class="mono">118</b></span>
                  <span><small>Ticket médio</small><b class="mono">R$ 53,70</b></span>
                  <span><small>Clientes fiéis</small><b class="mono">41</b></span>
                </div>
                <span class="insight insight--espaco">Sexta é o dia mais movimentado</span>
              </div>
            </div>
          </article>
        </div>

        <div class="alem">
          <h3>Além disso</h3>
          <ul>
            @for (item of recursos.alem; track item[0]) {
              <li><span class="check">✓</span><span><b>{{ item[0] }}</b>{{ item[1] }}</span></li>
            }
          </ul>
        </div>

        <div class="comparacao">
          <div class="cabeca"><h2 class="titulo">O seu dia, <span class="grifo">antes e depois.</span></h2></div>
          <div class="tabela" role="table" aria-label="Comparação antes e depois do DizAI">
            <div class="tabela__linha" role="row">
              <span role="columnheader">Situação</span><span role="columnheader">Hoje</span><span role="columnheader">Com o DizAI</span>
            </div>
            @for (linha of tabela; track linha[0]) {
              <div class="tabela__linha" role="row">
                <span role="cell">{{ linha[0] }}</span>
                <span role="cell"><span class="x">✕</span>{{ linha[1] }}</span>
                <span role="cell"><span class="check">✓</span>{{ linha[2] }}</span>
              </div>
            }
          </div>
        </div>

        <div class="chamada-recursos">
          <div>
            <h3>Veja o assistente marcando na sua agenda.</h3>
            <p>Cadastre os seus serviços e horários em poucos minutos e converse com o assistente como se fosse um cliente, antes de ligar no WhatsApp.</p>
          </div>
          <a class="btn btn--forte" routerLink="/cadastro" [queryParams]="{ tipo: 'servicos' }">Testar de graça →</a>
        </div>
      </div>
    </section>
  `,
})
export class RecursosAgendaComponent {
  protected readonly recursos = RECURSOS_AGENDA;
  protected readonly tabela = TABELA_AGENDA;
  protected readonly confirmacao = 'Agendado! ✅\nServiço: Corte + barba\nData: sexta, 25/10\nHorário: 15:30 às 16:30';
  protected readonly fatias = [
    { nome: 'Gel', parte: 42, cor: 'var(--noite)' },
    { nome: 'Manicure', parte: 27, cor: 'var(--gema-forte)' },
    { nome: 'Pedicure', parte: 19, cor: '#5B7BC0' },
    { nome: 'Sobrancelha', parte: 12, cor: '#B9C3D9' },
  ];
  /** Mensagens automáticas como linha do tempo: o que sai sozinho em cada momento. */
  protected readonly linhaMensagens = [
    { quando: 'No agendamento', mensagem: 'Agendado! ✅\nEsmaltação em gel · sexta, 25/10 às 14:00', resposta: '', selo: '' },
    {
      quando: '1 hora antes',
      mensagem: 'Oi, Maria! Lembrando do seu horário hoje às 14:00. Podemos confirmar?',
      resposta: 'Estarei lá! 😊',
      selo: 'Presença confirmada',
    },
    { quando: '15 minutos depois', mensagem: 'Obrigada pela visita, Maria! Foi um prazer te atender 💅', resposta: '', selo: '' },
    {
      quando: 'Retorno marcado (15 dias depois)',
      mensagem: 'Bom dia, Maria! Passando para lembrar do seu retorno para manutenção do gel. Quando quiser agendar, é só me avisar por aqui.',
      resposta: '',
      selo: '',
    },
  ];
}
