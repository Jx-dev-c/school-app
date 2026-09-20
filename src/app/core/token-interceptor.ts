import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';

/**
 * Anexa o token em toda chamada à API e, ao receber 401, tenta renovar uma vez
 * antes de desistir.
 *
 * O access token vive 15 minutos; sem isto, o usuário seria expulso da tela no
 * meio do trabalho a cada quarto de hora.
 */
export const tokenInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const auth = inject(AuthService);

  // chamadas para fora da API (e as de login/refresh) passam sem token
  const ehApi = requisicao.url.startsWith(environment.apiUrl);
  const ehAutenticacao = requisicao.url.includes('/auth/login') || requisicao.url.includes('/auth/refresh');

  if (!ehApi || ehAutenticacao) {
    return proximo(requisicao);
  }

  return proximo(comToken(requisicao, auth.accessToken)).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status !== 401) {
        return throwError(() => erro);
      }

      return auth.renovar().pipe(
        switchMap((sessao): Observable<HttpEvent<unknown>> => {
          if (!sessao) {
            // renovação falhou: a sessão acabou mesmo
            auth.encerrar();
            return throwError(() => erro);
          }
          return proximo(comToken(requisicao, sessao.accessToken));
        }),
      );
    }),
  );
};

function comToken(requisicao: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token
    ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : requisicao;
}

/** Tipagem auxiliar para deixar explícito o formato do próximo passo. */
export type Proximo = HttpHandlerFn;
