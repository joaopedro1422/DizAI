import { inject } from '@angular/core';
import { CanActivateFn, RedirectFunction, ResolveFn, Router } from '@angular/router';

import { PerfilService } from '../services/perfil.service';
import { SessaoService } from './sessao.service';

/**
 * Protege /painel/:perfilId.
 * Sem login: vai para /entrar. Com login, mas UUID de outra loja na URL: vai para o próprio painel.
 */
export const painelGuard: CanActivateFn = (rota) => {
  const sessao = inject(SessaoService);
  const router = inject(Router);

  if (!sessao.estaAutenticado()) {
    return router.createUrlTree(['/entrar']);
  }
  if (rota.paramMap.get('perfilId') !== sessao.perfilId()) {
    return router.parseUrl(sessao.caminhoPainel());
  }
  return true;
};

/** Em /entrar e /cadastro: quem já está logado vai direto para o painel. */
export const visitanteGuard: CanActivateFn = () => {
  const sessao = inject(SessaoService);
  return sessao.estaAutenticado() ? inject(Router).parseUrl(sessao.caminhoPainel()) : true;
};

/** /painel sem UUID (links antigos, favoritos): leva ao painel de quem está logado. */
export const redirecionarParaPainel: RedirectFunction = () => inject(SessaoService).caminhoPainel();

/**
 * Busca o perfil antes de abrir qualquer tela do painel, porque todas usam nome, ramo e conexão da loja.
 * Se falhar, a tela abre mesmo assim e mostra o aviso de erro ao carregar os próprios dados.
 */
export const perfilResolver: ResolveFn<boolean> = async () => {
  try {
    await inject(PerfilService).carregar();
    return true;
  } catch {
    return false;
  }
};
