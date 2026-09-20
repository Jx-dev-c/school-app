/** Contratos da API. Espelham os DTOs do back-end, não as entidades. */

export type Papel = 'Admin' | 'Professor' | 'Aluno';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  professorId: number | null;
  alunoId: number | null;
}

export interface Sessao {
  accessToken: string;
  expiraEm: string;
  refreshToken: string;
  usuario: UsuarioLogado;
}

export interface Turma {
  id: number;
  nome: string;
  anoLetivo: number;
  capacidade: number;
  matriculados: number;
  vagasDisponiveis: number;
  professorNome: string;
  disciplina: string;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  dataCriacao: string;
}

export interface Pagina<T> {
  itens: T[];
  pagina: number;
  tamanho: number;
  total: number;
  totalDePaginas: number;
  temProxima: boolean;
}

export interface Nota {
  bimestre: number;
  valor: number;
  dataLancamento: string;
}

export interface Boletim {
  matriculaId: number;
  alunoNome: string;
  turmaNome: string;
  notas: Nota[];
  media: number | null;
  frequenciaPercentual: number | null;
}
