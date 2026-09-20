import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth-service';
import { EscolaService } from '../../core/escola-service';

@Component({
  selector: 'app-turmas',
  imports: [DecimalPipe],
  templateUrl: './turmas.html',
  styleUrl: './turmas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Turmas {
  private readonly escola = inject(EscolaService);
  private readonly auth = inject(AuthService);

  readonly papel = this.auth.papel;
  readonly ano = signal<number | undefined>(undefined);

  /**
   * `rxResource` cuida do ciclo inteiro — carregando, erro e recarga quando o
   * filtro muda — sem `subscribe` na mão e sem risco de vazar inscrição.
   */
  readonly turmas = rxResource({
    params: () => ({ ano: this.ano() }),
    stream: ({ params }) => this.escola.listarTurmas(params.ano),
  });

  readonly totalDeVagas = computed(() =>
    (this.turmas.value() ?? []).reduce((soma, turma) => soma + turma.vagasDisponiveis, 0),
  );

  readonly totalDeAlunos = computed(() =>
    (this.turmas.value() ?? []).reduce((soma, turma) => soma + turma.matriculados, 0),
  );

  ocupacao(matriculados: number, capacidade: number): number {
    return capacidade === 0 ? 0 : Math.round((matriculados / capacidade) * 100);
  }
}
