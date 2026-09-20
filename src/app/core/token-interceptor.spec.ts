import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';
import { Sessao } from './modelos';
import { tokenInterceptor } from './token-interceptor';

const SESSAO: Sessao = {
  accessToken: 'token-antigo',
  expiraEm: '2026-12-31T23:59:59Z',
  refreshToken: 'refresh-1',
  usuario: { id: 1, nome: 'Admin', email: 'admin@escola.test', papel: 'Admin', professorId: null, alunoId: null },
};

const SESSAO_RENOVADA: Sessao = { ...SESSAO, accessToken: 'token-novo', refreshToken: 'refresh-2' };

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let controle: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', children: [] }]),
      ],
    });
    http = TestBed.inject(HttpClient);
    controle = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  function logar(): void {
    auth.entrar('admin@escola.test', 'escola@2026').subscribe();
    controle.expectOne((r) => r.url.endsWith('/auth/login')).flush(SESSAO);
  }

  it('anexa o token nas chamadas da API', () => {
    logar();

    http.get(`${environment.apiUrl}/turmas`).subscribe();

    const requisicao = controle.expectOne(`${environment.apiUrl}/turmas`);
    expect(requisicao.request.headers.get('Authorization')).toBe('Bearer token-antigo');
    requisicao.flush([]);
  });

  it('não anexa token no login nem no refresh', () => {
    logar();

    auth.renovar().subscribe();

    const requisicao = controle.expectOne((r) => r.url.endsWith('/auth/refresh'));
    // mandar o access token vencido junto do refresh não ajuda e vaza o token
    // para um endpoint que é anônimo de propósito
    expect(requisicao.request.headers.has('Authorization')).toBe(false);
    requisicao.flush(SESSAO_RENOVADA);
  });

  it('renova a sessão e repete a chamada quando recebe 401', () => {
    logar();

    let respondeu = false;
    http.get(`${environment.apiUrl}/turmas`).subscribe(() => (respondeu = true));

    // primeira tentativa: token vencido
    controle
      .expectOne((r) => r.url.endsWith('/turmas') && r.headers.get('Authorization') === 'Bearer token-antigo')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    controle.expectOne((r) => r.url.endsWith('/auth/refresh')).flush(SESSAO_RENOVADA);

    // segunda tentativa: já com o token novo, sem a tela perceber
    controle
      .expectOne((r) => r.url.endsWith('/turmas') && r.headers.get('Authorization') === 'Bearer token-novo')
      .flush([]);

    expect(respondeu).toBe(true);
  });

  it('desiste e encerra a sessão quando a renovação também falha', () => {
    logar();

    let erro: unknown = null;
    http.get(`${environment.apiUrl}/turmas`).subscribe({ error: (e) => (erro = e) });

    controle.expectOne((r) => r.url.endsWith('/turmas')).flush(null, { status: 401, statusText: 'Unauthorized' });
    controle.expectOne((r) => r.url.endsWith('/auth/refresh')).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(erro).not.toBeNull();
    expect(auth.autenticado()).toBe(false);
  });

  it('não tenta renovar em erro que não é 401', () => {
    logar();

    let erro: unknown = null;
    http.get(`${environment.apiUrl}/turmas`).subscribe({ error: (e) => (erro = e) });

    controle.expectOne((r) => r.url.endsWith('/turmas')).flush(null, { status: 500, statusText: 'Erro' });

    controle.expectNone((r) => r.url.endsWith('/auth/refresh'));
    expect(erro).not.toBeNull();
    expect(auth.autenticado()).toBe(true);
  });
});
