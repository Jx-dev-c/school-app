import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface Usuario {
  id?: number;
  nome?: string;
  email?: string;
  cargo?: string;
  dataCriacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:5105/api/usuarios';

  // Canal de avisos: quem alterar dados emite aqui,
  // quem precisa reagir se inscreve.
  private usuariosAlterados = new Subject<void>();
  usuariosAlterados$ = this.usuariosAlterados.asObservable();

  constructor(private http: HttpClient) { }

  notificarAlteracao(): void {
    this.usuariosAlterados.next();
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: Usuario): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}