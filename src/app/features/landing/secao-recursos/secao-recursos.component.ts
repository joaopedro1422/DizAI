import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { IconeComponent } from '../../../shared/components/icone/icone.component';
import { NomeIcone } from '../../../shared/components/icone/icones';

type ModoVenda = 'coletar' | 'chamar';
type Cena = 'primeira' | 'segunda';

/** Duas mensagens por vez na tela: a do cliente e a resposta do assistente. */
interface CenaConversa {
  id: string;
  cliente: string;
  resposta: string;
}

/** Os dois modos de "Quando o cliente quiser fechar" para quem vende (coletar é o padrão). */
const MODOS_VENDA: Record<ModoVenda, {
  rotulo: string;
  titulo: string;
  texto: string;
  /** Coletar tem duas cenas (o pedido dos dados → o cliente responde); chamar, uma. */
  cenas: CenaConversa[];
  avisoTitulo: string;
  avisoTexto: string;
}> = {
  coletar: {
    rotulo: 'Coletar dados',
    titulo: 'Anota o pedido e te entrega pronto para fechar.',
    texto:
      'Tira as dúvidas sobre produtos, preços e prazos, faz orçamentos, envia seu catálogo e, quando o cliente decide, coleta dados definidos por você e espera a sua confirmação.',
    cenas: [
      {
        id: 'coletar-pedido',
        cliente: 'Gostaria de 150 salgados para sábado',
        resposta: 'Perfeito! Para prosseguirmos, me informe:\n- Quantidade de cada sabor\n- Retirada ou entrega\n- Seu nome',
      },
      { id: 'coletar-dados', cliente: '100 coxinhas e 50 kibes. Retiro sábado às 15h. Sou a Ana', resposta: '1 minuto!' },
    ],
    avisoTitulo: 'Pedido pronto para fechar',
    avisoTexto: 'Ana · 150 salgados · retirada sábado às 15h',
  },
  chamar: {
    rotulo: 'Me chamar na hora',
    titulo: 'Te chama assim que o cliente quiser comprar.',
    texto:
      'Tira as dúvidas sobre produtos, preços e prazos, faz orçamentos, envia seu catálogo e, quando o cliente decide, passa a conversa para você na hora, com um aviso no celular. Você assume!',
    cenas: [{ id: 'chamar', cliente: 'Gostaria de 150 salgados para sábado', resposta: '1 minuto!' }],
    avisoTitulo: 'Cliente quer fechar um pedido',
    avisoTexto: 'Ana · "Gostaria de 150 salgados para sábado"',
  },
};

interface RecursoControle {
  icone: NomeIcone;
  titulo: string;
  texto: string;
}

/** Os recursos que respondem "e se ele errar?" e "e se eu quiser responder?". */
const CONTROLE: RecursoControle[] = [
  { icone: 'sino', titulo: 'Te avisa no celular', texto: 'Quando um cliente está pronto para fechar ou precisa de você.' },
  { icone: 'escudo', titulo: 'Só fala o que é verdade', texto: 'Usa o que você cadastrou. Se não souber, diz "vou confirmar" e te chama.' },
  { icone: 'pessoaIgnorada', titulo: 'Contatos pessoais de fora', texto: 'Família e amigos não falam com o assistente.' },
  { icone: 'lampada', titulo: 'Aprende com o que não sabia', texto: 'A pergunta sem resposta vira sugestão de pergunta frequente.' },
  { icone: 'relogio', titulo: 'Respeita o seu horário', texto: 'Fora do expediente, avisa o cliente quando você vai confirmar.' },
  { icone: 'conversa', titulo: 'Teste antes de ligar', texto: 'Converse com o assistente como se fosse um cliente.' },
];

/** O que mais cada lado tem (lista curta embaixo do texto de cada card). */
const EXTRAS_VENDAS = ['Gerenciador de pedidos com mensagens rápidas'];
const EXTRAS_SERVICOS = [
  'Adicione vários profissionais',
  'Lembrete automático antes do horário',
  'Mensagem de agradecimento depois do atendimento',
];

/** As conversas trocam de cena sozinhas (vendas: pedido → dados; serviços: pergunta → agendamento). */
const TEMPO_POR_CENA_MS = 5000;

/**
 * "Recursos" da landing: dois cards em destaque com conversas de verdade (quem vende, com os dois modos
 * de fechamento; quem presta serviço, com o agendamento automático) e os recursos que deixam o lojista no controle.
 */
@Component({
  selector: 'app-secao-recursos',
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secao-recursos.component.html',
  styleUrls: ['../secao-landing.css', './secao-recursos.component.css'],
})
export class SecaoRecursosComponent {
  protected readonly controle = CONTROLE;
  protected readonly extrasVendas = EXTRAS_VENDAS;
  protected readonly extrasServicos = EXTRAS_SERVICOS;
  protected readonly modos = (Object.keys(MODOS_VENDA) as ModoVenda[]).map((id) => ({ id, rotulo: MODOS_VENDA[id].rotulo }));
  protected readonly modoVenda = signal<ModoVenda>('coletar');
  protected readonly venda = computed(() => MODOS_VENDA[this.modoVenda()]);

  protected readonly cena = signal<Cena>('primeira');
  /** A cena de vendas que está na tela (o modo "chamar" só tem uma). */
  protected readonly cenaVenda = computed(() => {
    const cenas = this.venda().cenas;
    return this.cena() === 'segunda' && cenas.length > 1 ? cenas[1] : cenas[0];
  });
  /** O aviso no celular só chega com o pedido pronto (no "chamar", desde o começo). */
  protected readonly avisoVendaVisivel = computed(() => this.cenaVenda() === this.venda().cenas.at(-1));

  constructor() {
    const temporizador = setInterval(() => this.cena.update((cena) => (cena === 'primeira' ? 'segunda' : 'primeira')), TEMPO_POR_CENA_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(temporizador));
  }

  protected escolherModo(modo: ModoVenda): void {
    this.modoVenda.set(modo);
  }
}
