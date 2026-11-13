/**
 * Ordenação por data das visões de demandas e atividades.
 *
 * O estado vive num único searchParam `sort` no formato `campo-direção`
 * (ex.: `etapaFim-asc`, `entrega-desc`). Ausência do param = ordem natural
 * (a de carregamento). O mesmo estado é lido/escrito pelo kanban (toggle) e
 * pela tabela (headers clicáveis), de modo que a ordenação viaja entre as
 * visões. Capability: ordenacao-por-data-visoes.
 */

export type SortDir = "asc" | "desc";

export interface SortState {
  field: string;
  dir: SortDir;
}

/** Lê `campo-direção` da URL; retorna null para ausente ou inválido. */
export function parseSort(raw: string | null | undefined): SortState | null {
  if (!raw) return null;
  const i = raw.lastIndexOf("-");
  if (i <= 0) return null;
  const field = raw.slice(0, i);
  const dir = raw.slice(i + 1);
  if (dir !== "asc" && dir !== "desc") return null;
  return { field, dir };
}

export function serializeSort(sort: SortState | null): string | null {
  return sort ? `${sort.field}-${sort.dir}` : null;
}

/** Ciclo de um clique para um campo: natural → asc → desc → natural. */
export function nextSort(current: SortState | null, field: string): SortState | null {
  if (!current || current.field !== field) return { field, dir: "asc" };
  if (current.dir === "asc") return { field, dir: "desc" };
  return null;
}

/**
 * Ordenação por coluna do kanban (capability kanban-ordenacao-por-coluna): o
 * campo é fixo por kanban, então o estado de cada coluna guarda apenas a direção.
 */

/** Lê a direção de uma coluna; null para ausente ou inválido. */
export function parseDir(raw: string | null | undefined): SortDir | null {
  return raw === "asc" || raw === "desc" ? raw : null;
}

/** Ciclo de um clique por coluna: natural → asc → desc → natural. */
export function nextDir(current: SortDir | null): SortDir | null {
  if (!current) return "asc";
  if (current === "asc") return "desc";
  return null;
}

/** Chave de URL da coluna: `sort<ChaveDaColuna>` (ex.: sortNOVAS). */
export function columnSortKey(columnKey: string): string {
  return `sort${columnKey}`;
}

type SortValue = number | string | Date | null | undefined;
type Accessor<T> = (item: T) => SortValue;

/**
 * Comparador estável para o campo ativo. Itens cujo valor é nulo afundam
 * sempre para o final da lista, tanto em asc quanto em desc.
 */
export function makeComparator<T>(
  sort: SortState | null,
  accessors: Record<string, Accessor<T>>,
): (a: T, b: T) => number {
  if (!sort) return () => 0;
  const accessor = accessors[sort.field];
  if (!accessor) return () => 0;
  const mult = sort.dir === "asc" ? 1 : -1;
  return (a, b) => {
    const va = accessor(a);
    const vb = accessor(b);
    const na = va == null;
    const nb = vb == null;
    if (na && nb) return 0;
    if (na) return 1; // nulos ao final, independente da direção
    if (nb) return -1;
    let cmp: number;
    if (va instanceof Date && vb instanceof Date) cmp = va.getTime() - vb.getTime();
    else if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
    else cmp = String(va).localeCompare(String(vb), "pt-BR");
    return cmp * mult;
  };
}

/**
 * Devolve uma cópia ordenada quando há `sort` ativo e um accessor válido;
 * caso contrário, a própria lista (preserva a ordem natural sem copiar).
 */
export function sortRows<T>(
  rows: T[],
  sort: SortState | null,
  accessors: Record<string, Accessor<T>>,
): T[] {
  if (!sort || !accessors[sort.field]) return rows;
  return [...rows].sort(makeComparator(sort, accessors));
}
