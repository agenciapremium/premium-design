/**
 * Regras puras de "filtro ativo" da barra de filtros (`FilterBar`), change
 * `busca-um-x-por-campo` (design D3).
 *
 * Módulo puro (sem React, sem `window`): o `filter-bar.tsx` é client e tem JSX,
 * então a regra mora aqui para o runner `node --test` alcançá-la e para a barra
 * e o teste decidirem pela mesma função.
 */

/** O mínimo de um `FilterConfig` de que a regra precisa. */
export interface FiltroMinimo {
  key: string;
  type: string;
}

/** Lê um parâmetro da URL (ex.: `searchParams.get`). */
export type LerParametro = (key: string) => string | null;

/**
 * Um filtro está ativo quando tem valor na URL. O `daterange` serializa em
 * `<key>De`/`<key>Ate` e conta como ativo com qualquer um dos dois.
 */
export function filtroAtivo(filtro: FiltroMinimo, get: LerParametro): boolean {
  if (filtro.type === "daterange") {
    return Boolean(get(`${filtro.key}De`) || get(`${filtro.key}Ate`));
  }
  return Boolean(get(filtro.key));
}

/**
 * O botão "Limpar filtros" só aparece quando limpa mais do que a busca: com
 * algum filtro ativo que **não** é `type: "search"`. Só com a busca ativa, o `X`
 * da própria busca já limpa, e o botão seria o terceiro "x" da barra (o nativo
 * do navegador era o primeiro, escondido pela regra CSS base).
 */
export function mostrarLimparFiltros(filtros: readonly FiltroMinimo[], get: LerParametro): boolean {
  return filtros.some((f) => f.type !== "search" && filtroAtivo(f, get));
}
