import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth-service';

@Component({
  selector: 'app-entrar',
  imports: [ReactiveFormsModule],
  templateUrl: './entrar.html',
  styleUrl: './entrar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Entrar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  /**
   * Reactive form, e não template-driven: a validação fica no TypeScript, onde
   * dá para testar, em vez de espalhada por atributos no HTML.
   */
  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const { email, senha } = this.formulario.getRawValue();

    this.auth.entrar(email, senha).subscribe({
      next: () => {
        const destino = this.rota.snapshot.queryParamMap.get('destino') ?? '/turmas';
        void this.router.navigateByUrl(destino);
      },
      error: (resposta: { status?: number }) => {
        this.enviando.set(false);
        this.erro.set(
          resposta.status === 429
            ? 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'
            : 'E-mail ou senha incorretos.',
        );
      },
    });
  }

  campoInvalido(campo: 'email' | 'senha'): boolean {
    const controle = this.formulario.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }
}
