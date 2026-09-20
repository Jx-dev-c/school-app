import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Papel, Sessao, UsuarioLogado } from './modelos';

const CHAVE_SESSAO = 'school-app.sessao';

/**
 * Dono da sessão: guarda os tokens, diz quem está logado e faz a renovação.
 *
 * O estado é signal, não `Subject` — quem precisa do usuário lê `usuario()`
 * e o Angular recalcula sozinho. A versão anterior avisava por `Subject` e
 * cada componente chamava `ChangeDetectorRef.detectChanges()` na mão.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _sessao = signal<Sessao | null>(this.lerDoNavegador());

  readonly usuario = computed<UsuarioLogado | null>(() => this._sessao()?.usuario ?? null);
  readonly autenticado = computed(() => this._sessao() !== null);
  readonly papel = computed<Papel | null>(() => this._sessao()?.usuario.papel ?? null);

  get accessToken(): string | null {
    return this._sessao()?.accessToken ?? null;
  }

  ehAdmin(): boolean {
    return this.papel() === 'Admin';
  }

  podeVerAlunos(): boolean {
    return this.papel() === 'Admin' || this.papel() === 'Professor';
  }

  entrar(email: string, senha: string): Observable<Sessao> {
    return this.http
      .post<Sessao>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(tap((sessao) => this.guardar(sessao)));
  }

  /**
   * Renova o par de tokens. O interceptor chama isto ao receber 401 — se a
   * renovação também falhar, a sessão acabou de verdade.
   */
  renovar(): Observable<Sessao | null> {
    const refreshToken = this._sessao()?.refreshToken;
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<Sessao>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((sessao) => this.guardar(sessao)),
      catchError(() => {
        this.encerrar();
        return of(null);
      }),
    );
  }

  sair(): void {
    // avisa a API para revogar os refresh tokens; a sessão local cai de
    // qualquer jeito, mesmo se a chamada falhar
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => this.encerrar(),
      error: () => this.encerrar(),
    });
  }

  encerrar(): void {
    this._sessao.set(null);
    this.apagarDoNavegador();
    void this.router.navigate(['/entrar']);
  }

  private guardar(sessao: Sessao): void {
    this._sessao.set(sessao);
    try {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    } catch {
      // janela anônima ou armazenamento bloqueado: a sessão vale só nesta aba
    }
  }

  private apagarDoNavegador(): void {
    try {
      localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* idem */
    }
  }

  private lerDoNavegador(): Sessao | null {
    try {
      const salvo = localStorage.getItem(CHAVE_SESSAO);
      return salvo ? (JSON.parse(salvo) as Sessao) : null;
    } catch {
      return null;
    }
  }
}
