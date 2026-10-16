import { AgendaService } from '../services/agenda.service';
import { EstatisticasService } from '../services/estatisticas.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlApi } from '../api/api-url';
import { DadosCadastroLoja } from '../models/cadastro.model';
import { ContatoIgnoradoService } from '../services/contato-ignorado.service';
import { ContatosWhatsappService } from '../services/contatos-whatsapp.service';
import { ConversaService } from '../services/conversa.service';
import { GaleriaService } from '../services/galeria.service';
import { PerfilService } from '../services/perfil.service';
import { PerguntaFrequenteService } from '../services/pergunta-frequente.service';
import { ProdutoService } from '../services/produto.service';
import { RespostaAutenticacao, SessaoService } from './sessao.service';

/** Login, cadastro e saída do lojista (/api/auth). */
@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);

  /** Serviços que guardam dados da loja: são esvaziados ao trocar de conta. */
  private readonly servicosComDadosDaLoja = [
    inject(PerfilService),
    inject(ProdutoService),
    inject(PerguntaFrequenteService),
    inject(GaleriaService),
    inject(ConversaService),
    inject(ContatoIgnoradoService),
    inject(ContatosWhatsappService),
    inject(AgendaService),
    inject(EstatisticasService),
  ];

  /** Login com o WhatsApp do negócio e a senha. Devolve o caminho do painel: /painel/{uuid} */
  async entrar(whatsapp: string, senha: string): Promise<string> {
    const resposta = await firstValueFrom(
      this.http.post<RespostaAutenticacao>(urlApi('/api/auth/login'), { whatsapp, senha }),
    );
    return this.iniciarSessao(resposta);
  }

  /**
   * Cria a conta e a loja de uma vez e já deixa o lojista logado.
   * Pagamento, entrega e antecedência ficam para o painel.
   */
  async cadastrar({ dadosNegocio, acesso, ramo }: DadosCadastroLoja): Promise<string> {
    const resposta = await firstValueFrom(
      this.http.post<RespostaAutenticacao>(urlApi('/api/auth/cadastro'), {
        nomeResponsavel: dadosNegocio.nomeResponsavel.trim(),
        nomeLoja: dadosNegocio.nomeLoja.trim(),
        descricao: dadosNegocio.descricao.trim(),
        whatsapp: acesso.whatsapp,
        senha: acesso.senha,
        ramo,
      }),
    );
    return this.iniciarSessao(resposta);
  }

  /** O token é stateless (JWT): sair é apagar a sessão deste navegador e os dados em memória. */
  sair(): void {
    this.sessao.encerrar();
    this.esvaziarDadosDaLoja();
  }

  private iniciarSessao(resposta: RespostaAutenticacao): string {
    this.esvaziarDadosDaLoja();
    this.sessao.iniciar(resposta);
    return this.sessao.caminhoPainel();
  }

  private esvaziarDadosDaLoja(): void {
    this.servicosComDadosDaLoja.forEach((servico) => servico.reiniciar());
  }
}
