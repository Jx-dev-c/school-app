import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../environments/environment';

export interface DesempenhoDaTurma {
  turmaId: number;
  turma: string;
  professor: string;
  disciplina: string;
  alunos: number;
  mediaGeral: number | null;
  menorMedia: number | null;
  maiorMedia: number | null;
  frequenciaPercentual: number | null;
  alunosEmRisco: number;
  notasLancadas: number;
}

export interface AlunoEmRisco {
  matriculaId: number;
  aluno: string;
  turma: string;
  media: number | null;
  frequenciaPercentual: number | null;
  motivo: string;
}

@Component({
  selector: 'app-relatorios',
  imports: [DecimalPipe],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Relatorios {
  private readonly http = inject(HttpClient);

  readonly turmas = rxResource({
    stream: () => this.http.get<DesempenhoDaTurma[]>(`${environment.apiUrl}/relatorios/turmas`),
  });

  readonly emRisco = rxResource({
    stream: () => this.http.get<AlunoEmRisco[]>(`${environment.apiUrl}/relatorios/alunos-em-risco`),
  });

  readonly mediaDaEscola = computed(() => {
    const linhas = (this.turmas.value() ?? []).filter((t) => t.mediaGeral !== null);
    if (linhas.length === 0) return null;
    // média ponderada por aluno: turma de 13 pesa mais que turma de 10
    const alunos = linhas.reduce((soma, t) => soma + t.alunos, 0);
    const total = linhas.reduce((soma, t) => soma + (t.mediaGeral ?? 0) * t.alunos, 0);
    return alunos === 0 ? null : total / alunos;
  });

  readonly totalEmRisco = computed(() => (this.emRisco.value() ?? []).length);

  /** Altura da barra no gráfico, em porcentagem da escala de 0 a 10. */
  altura(media: number | null): number {
    return media === null ? 0 : Math.max(2, (media / 10) * 100);
  }

  corDaMedia(media: number | null): string {
    if (media === null) return 'var(--tinta-3)';
    if (media < 6) return 'var(--perigo)';
    if (media < 7) return 'var(--atencao)';
    return 'var(--marca)';
  }
}
