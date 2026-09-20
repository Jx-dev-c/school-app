import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth-service';

/** Moldura das telas internas: navegação, identificação e saída. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly auth = inject(AuthService);

  readonly usuario = this.auth.usuario;
  readonly podeVerAlunos = () => this.auth.podeVerAlunos();

  sair(): void {
    this.auth.sair();
  }
}
