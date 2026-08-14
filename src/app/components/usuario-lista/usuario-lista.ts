import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UsuarioService, Usuario } from '../../services/usuario';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.html',
  styleUrls: ['./usuario-lista.css'],
  standalone: true,
  imports: [CommonModule]
})
export class UsuarioListaComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  carregando = true;
  erro: string | null = null;

  private inscricao?: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();

    // Sintoniza o radio: recarrega sempre que alguem alterar os dados.
    this.inscricao = this.usuarioService.usuariosAlterados$.subscribe(() => {
      this.carregarUsuarios();
    });
  }

  ngOnDestroy(): void {
    this.inscricao?.unsubscribe();
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.erro = null;

    this.usuarioService.getUsuarios().subscribe({
      next: (dados) => {
        this.usuarios = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar usuarios:', erro);
        this.erro = 'Erro ao carregar usuarios';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  deletar(id?: number): void {
    if (id === undefined) {
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuario?')) {
      return;
    }

    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => {
        this.usuarioService.notificarAlteracao();
      },
      error: (erro) => {
        console.error('Erro ao deletar usuario:', erro);
        this.erro = 'Erro ao deletar usuario';
        this.cdr.detectChanges();
      }
    });
  }
}