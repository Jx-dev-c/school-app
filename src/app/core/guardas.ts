import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth-service';
import { Papel } from './modelos';

/**
 * Rota fechada para quem não entrou. Guarda o destino para devolver a pessoa
 * ao lugar certo depois do login, em vez de sempre jogar na home.
 */
export const exigeLogin: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.autenticado()
    ? true
    : router.createUrlTree(['/entrar'], { queryParams: { destino: estado.url } });
};

/** Rota restrita a determinados papéis. */
export function exigePapel(...papeis: Papel[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const papel = auth.papel();

    if (!papel) {
      return router.createUrlTree(['/entrar']);
    }

    // a guarda é conveniência de navegação, não segurança: quem decide é a
    // API, que valida o token em toda chamada
    return papeis.includes(papel) ? true : router.createUrlTree(['/turmas']);
  };
}
