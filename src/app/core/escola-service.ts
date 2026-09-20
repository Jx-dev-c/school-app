import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Aluno, Boletim, Pagina, Turma } from './modelos';

/** Acesso aos dados da escola. Um método por endpoint, sem lógica de tela. */
@Injectable({ providedIn: 'root' })
export class EscolaService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  listarTurmas(anoLetivo?: number): Observable<Turma[]> {
    const parametros = anoLetivo ? new HttpParams().set('anoLetivo', anoLetivo) : undefined;
    return this.http.get<Turma[]>(`${this.url}/turmas`, { params: parametros });
  }

  buscarTurma(id: number): Observable<Turma> {
    return this.http.get<Turma>(`${this.url}/turmas/${id}`);
  }

  listarAlunos(pagina: number, tamanho: number, busca?: string): Observable<Pagina<Aluno>> {
    let parametros = new HttpParams().set('pagina', pagina).set('tamanho', tamanho);
    if (busca?.trim()) {
      parametros = parametros.set('busca', busca.trim());
    }
    return this.http.get<Pagina<Aluno>>(`${this.url}/alunos`, { params: parametros });
  }

  buscarBoletim(matriculaId: number): Observable<Boletim> {
    return this.http.get<Boletim>(`${this.url}/matriculas/${matriculaId}/boletim`);
  }

  lancarNota(matriculaId: number, bimestre: number, valor: number): Observable<void> {
    return this.http.put<void>(`${this.url}/matriculas/${matriculaId}/notas`, { bimestre, valor });
  }
}
