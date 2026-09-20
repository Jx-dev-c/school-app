import { Routes } from '@angular/router';

import { exigeLogin, exigePapel } from './core/guardas';

/**
 * Rotas carregadas sob demanda: a tela de login não baixa o código das telas
 * internas, e quem é aluno nunca baixa a de alunos.
 */
export const routes: Routes = [
  {
    path: 'entrar',
    title: 'Entrar — Sistema escolar',
    loadComponent: () => import('./paginas/entrar/entrar').then((m) => m.Entrar),
  },
  {
    path: '',
    canActivate: [exigeLogin],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: 'turmas',
        title: 'Turmas — Sistema escolar',
        loadComponent: () => import('./paginas/turmas/turmas').then((m) => m.Turmas),
      },
      {
        path: 'alunos',
        title: 'Alunos — Sistema escolar',
        canActivate: [exigePapel('Admin', 'Professor')],
        loadComponent: () => import('./paginas/alunos/alunos').then((m) => m.Alunos),
      },
      {
        path: 'relatorios',
        title: 'Relatórios — Sistema escolar',
        canActivate: [exigePapel('Admin', 'Professor')],
        loadComponent: () => import('./paginas/relatorios/relatorios').then((m) => m.Relatorios),
      },
      { path: '', pathMatch: 'full', redirectTo: 'turmas' },
    ],
  },
  { path: '**', redirectTo: '' },
];
