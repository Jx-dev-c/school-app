import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

import { EscolaService } from '../../core/escola-service';

@Component({
  selector: 'app-alunos',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './alunos.html',
  styleUrl: './alunos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alunos {
  private readonly escola = inject(EscolaService);

  readonly busca = new FormControl('', { nonNullable: true });
  readonly pagina = signal(1);
  readonly tamanho = 10;

  /** 300 ms de espera: sem isso, sai uma requisição por tecla digitada. */
  private readonly termo = toSignal(this.busca.valueChanges.pipe(debounceTime(300)), {
    initialValue: '',
  });

  readonly alunos = rxResource({
    params: () => ({ pagina: this.pagina(), termo: this.termo() }),
    stream: ({ params }) => this.escola.listarAlunos(params.pagina, this.tamanho, params.termo),
  });

  constructor() {
    // buscar algo novo tem que voltar para a primeira página, senão a busca
    // parece vazia só porque a página 3 do resultado anterior não existe mais
    effect(() => {
      this.termo();
      this.pagina.set(1);
    });
  }

  irPara(pagina: number): void {
    this.pagina.set(pagina);
  }
}
