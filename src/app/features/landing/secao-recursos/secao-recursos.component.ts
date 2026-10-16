import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';

type ModoVenda = 'coletar' | 'chamar';

/** Os dois modos de "Quando o cliente quiser fechar" para quem vende (coletar é o padrão). */
const MODOS_VENDA: Record<ModoVenda, {
  rotulo: string;
  titulo: string;
  texto: string;
  resposta: string;
  avisoTitulo: string;
  avisoTexto: string;
}> = {
  coletar: {
    rotulo: 'Coletar dados',
    titulo: 'Anota o pedido e te entrega pronto para fechar.',
    texto:
      'Tira as dúvidas sobre produtos, preços e prazos, faz orçamentos, envia seu catálogo e, quando o cliente decide, coleta dados definidos por você e espera a sua confirmação.',
    resposta: 'Perfeito! Para prosseguirmos, me informe:\n- Quantidade de cada sabor\n- Retirada ou entrega\n- Seu nome',
    avisoTitulo: 'Pedido pronto para fechar',
    avisoTexto: 'Ana · 150 salgados · retirada sábado às 15h',
  },
  chamar: {
    rotulo: 'Me chamar na hora',
    titulo: 'Te chama assim que o cliente quiser comprar.',
    texto:
      'Tira as dúvidas sobre produtos, preços e prazos, faz orçamentos, envia seu catálogo e, quando o cliente decide, passa a conversa para você na hora, com um aviso no celular. Você assume!',
    resposta: '1 minuto!',
    avisoTitulo: 'Cliente quer fechar um pedido',
    avisoTexto: 'Ana · "Gostaria de 150 salgados para sábado"',
  },
};

interface Recurso {
  icone: NomeIcone;
  titulo: string;
  texto: string;
}

const RECURSOS: Recurso[] = [
  { icone: 'relogio', titulo: 'Responde na hora', texto: 'De dia, de noite e no fim de semana, sem deixar ninguém no vácuo.' },
  {
    icone: 'ajustes',
    titulo: 'Altamente personalizável',
    texto:
      'Deixe o assistente com a sua cara. Você decide comportamentos, mensagem de saudação e instruções específicas do seu negócio, que ele sempre segue.',
  },
  { icone: 'escudo', titulo: 'Só fala o que é verdade', texto: 'Usa apenas o que você cadastrou. Se não souber, diz “vou confirmar” e te chama.' },
  { icone: 'sino', titulo: 'Te avisa no celular', texto: 'Notificação quando um cliente está pronto para fechar ou precisa de você.' },
  { icone: 'pessoa', titulo: 'Você assume quando quiser', texto: 'Mandou uma mensagem pelo celular? O assistente sai daquela conversa na hora.' },
  { icone: 'documento', titulo: 'Catálogo e fotos na conversa', texto: 'Envia seu catálogo e a galeria dos seus trabalhos quando o cliente pede.' },
  {
    icone: 'imagem',
    titulo: 'Vitrine do seu negócio',
    texto: 'Monte uma página personalizada para as fotos dos seus trabalhos, catálogos e apresentações.',
  },
  {
    icone: 'grafico',
    titulo: 'Mostra o tempo que você ganhou',
    texto: 'Atendimentos, pedidos ou agendamentos e as horas que você deixou de passar no WhatsApp.',
  },
];

/** A conversa de serviços troca de cena sozinha: pergunta dos serviços → agendamento. */
const TEMPO_POR_CENA_MS = 5000;

/**
 * "Recursos" da landing: dois cards em destaque com conversas de verdade (quem vende, com os dois modos
 * de fechamento; quem presta serviço, com o agendamento automático) e os recursos menores.
 */
@Component({
  selector: 'app-secao-recursos',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-recursos.component.html',
  styleUrls: ['../secao-landing.css', './secao-recursos.component.css'],
})
export class SecaoRecursosComponent {
  protected readonly recursos = RECURSOS;
  protected readonly modos = (Object.keys(MODOS_VENDA) as ModoVenda[]).map((id) => ({ id, rotulo: MODOS_VENDA[id].rotulo }));
  protected readonly modoVenda = signal<ModoVenda>('coletar');
  protected readonly venda = computed(() => MODOS_VENDA[this.modoVenda()]);

  protected readonly cenaServico = signal<'pergunta' | 'agendamento'>('pergunta');

  constructor() {
    const temporizador = setInterval(
      () => this.cenaServico.update((cena) => (cena === 'pergunta' ? 'agendamento' : 'pergunta')),
      TEMPO_POR_CENA_MS,
    );
    inject(DestroyRef).onDestroy(() => clearInterval(temporizador));
  }

  protected escolherModo(modo: ModoVenda): void {
    this.modoVenda.set(modo);
  }
}
