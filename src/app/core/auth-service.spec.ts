import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from './auth-service';
import { Sessao } from './modelos';

const SESSAO: Sessao = {
  accessToken: 'token-de-acesso',
  expiraEm: '2026-12-31T23:59:59Z',
  refreshToken: 'token-de-renovacao',
  usuario: {
    id: 1,
    nome: 'Marcos Ribeiro',
    email: 'professor@escola.test',
    papel: 'Professor',
    professorId: 1,
    alunoId: null,
  },
};

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: '**', children: [] }])],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('começa sem sessão', () => {
    expect(auth.autenticado()).toBe(false);
    expect(auth.usuario()).toBeNull();
    expect(auth.accessToken).toBeNull();
  });

  it('guarda a sessão depois do login', () => {
    auth.entrar('professor@escola.test', 'escola@2026').subscribe();

    const requisicao = http.expectOne((r) => r.url.endsWith('/auth/login'));
    expect(requisicao.request.body).toEqual({ email: 'professor@escola.test', senha: 'escola@2026' });
    requisicao.flush(SESSAO);

    expect(auth.autenticado()).toBe(true);
    expect(auth.papel()).toBe('Professor');
    expect(auth.accessToken).toBe('token-de-acesso');
  });

  it('sobrevive a recarregar a página', () => {
    auth.entrar('professor@escola.test', 'escola@2026').subscribe();
    http.expectOne((r) => r.url.endsWith('/auth/login')).flush(SESSAO);

    // instância nova lendo o mesmo armazenamento, como acontece depois do F5
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: '**', children: [] }])],
    });

    const recriado = TestBed.inject(AuthService);

    expect(recriado.autenticado()).toBe(true);
    expect(recriado.usuario()?.email).toBe('professor@escola.test');
  });

  it('renovar sem refresh token não chama a API', () => {
    let resultado: unknown = 'nao-chamou';
    auth.renovar().subscribe((valor) => (resultado = valor));

    http.expectNone((r) => r.url.endsWith('/auth/refresh'));
    expect(resultado).toBeNull();
  });

  it('encerra a sessão quando a renovação falha', () => {
    auth.entrar('professor@escola.test', 'escola@2026').subscribe();
    http.expectOne((r) => r.url.endsWith('/auth/login')).flush(SESSAO);

    let resultado: unknown = 'pendente';
    auth.renovar().subscribe((valor) => (resultado = valor));
    http.expectOne((r) => r.url.endsWith('/auth/refresh')).flush(null, { status: 401, statusText: 'Unauthorized' });

    // erro na renovação não pode virar exceção solta: a sessão cai e a
    // aplicação segue viva, mandando a pessoa para o login
    expect(resultado).toBeNull();
    expect(auth.autenticado()).toBe(false);
    expect(localStorage.getItem('school-app.sessao')).toBeNull();
  });

  it('só quem é admin ou professor enxerga a área de alunos', () => {
    auth.entrar('professor@escola.test', 'escola@2026').subscribe();
    http.expectOne((r) => r.url.endsWith('/auth/login')).flush(SESSAO);

    expect(auth.podeVerAlunos()).toBe(true);
    expect(auth.ehAdmin()).toBe(false);
  });
});
