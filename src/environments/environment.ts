/**
 * Ambiente de desenvolvimento. A URL da API era literal dentro do serviço,
 * o que quebrava qualquer publicação: o navegador do visitante não tem um
 * `localhost:5105`.
 */
export const environment = {
  producao: false,
  apiUrl: 'http://localhost:5105/api',
};
