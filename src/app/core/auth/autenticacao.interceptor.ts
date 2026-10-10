import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ehRequisicaoDaApi } from '../api/api-url';
import { SessaoService } from './sessao.service';

/**
 * Envia o token do lojista nas chamadas ao backend.
 * Se o backend responder 401 (token vencido ou inválido), encerra a sessão e volta para o login.
 */
export const autenticacaoInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  if (!ehRequisicaoDaApi(requisicao.url)) {
    return proximo(requisicao);
  }

  const sessao = inject(SessaoService);
  const router = inject(Router);
  const token = sessao.token();
  const requisicaoComToken = token
    ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : requisicao;

  return proximo(requisicaoComToken).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401 && token) {
        sessao.encerrar();
        void router.navigate(['/entrar'], { queryParams: { sessaoExpirada: 1 } });
      }
      return throwError(() => erro);
    }),
  );
};
