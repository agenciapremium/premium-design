/**
 * Constantes compartilhadas do app.
 *
 * Paginação (capability `paginacao-tabelas`): fonte única do tamanho de página
 * usado por todas as tabelas, listas em linha e grids de cards de registros.
 */

/** Itens por página em todas as tabelas/grids paginados server-side. */
export const TABELA_PAGINA_TAMANHO = 25;

/**
 * Kanban (capability `kanban-scroll-infinito`): carga inicial e incremento de
 * cartões por coluna. Cada coluna dos três Kanbans (Atividades, Demandas, Quadros)
 * renderiza `KANBAN_LOTE_INICIAL` cartões na abertura e carrega mais
 * `KANBAN_LOTE_INCREMENTO` por vez ao rolar até o fim (windowing client-side).
 */
export const KANBAN_LOTE_INICIAL = 15;
export const KANBAN_LOTE_INCREMENTO = 15;

/**
 * Lê o parâmetro `?pagina=` de `searchParams` (1-based). Retorna 1 quando
 * ausente, não-numérico ou inválido (< 1).
 */
export function parsePagina(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

/**
 * Total de páginas para um total de itens (mínimo 1, para nunca exibir
 * "Página 1 de 0").
 */
export function totalPaginas(total: number): number {
  return Math.max(1, Math.ceil(total / TABELA_PAGINA_TAMANHO));
}

/**
 * `skip`/`take` do Prisma para a página 1-based, no tamanho padrão. Açúcar para
 * a forma `findMany({ ...skipTake(pagina) })` reaproveitada pelas pages simples.
 */
export function skipTake(pagina: number): { skip: number; take: number } {
  return { skip: (Math.max(1, pagina) - 1) * TABELA_PAGINA_TAMANHO, take: TABELA_PAGINA_TAMANHO };
}
