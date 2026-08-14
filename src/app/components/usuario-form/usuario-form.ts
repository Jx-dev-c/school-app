import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-form.html',
  styleUrls: ['./usuario-form.css']
})
export class UsuarioFormComponent {
  usuario: Usuario = {};
  enviando = false;
  mensagem = '';

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  enviar(): void {
    if (!this.usuario.nome || !this.usuario.email || !this.usuario.cargo) {
      this.mensagem = 'Preencha todos os campos!';
      return;
    }

    this.enviando = true;

    this.usuarioService.createUsuario(this.usuario).subscribe({
      next: () => {
        this.mensagem = 'Usuario criado com sucesso!';
        this.usuario = {};
        this.enviando = false;

        // Avisa o resto do app que a lista mudou.
        this.usuarioService.notificarAlteracao();

        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao criar usuario:', erro);
        this.mensagem = 'Erro ao criar usuario';
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }
}