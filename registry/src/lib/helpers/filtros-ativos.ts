/**
 * Regras puras de "filtro ativo" da barra de filtros (`FilterBar`), change
 * `busca-um-x-por-campo` (design D3), e das chaves de URL de cada filtro,
 * change `catalogo-filterbar-faixa-busca-correcoes` (D1 e D2).
 *
 * Módulo puro (sem React, sem `window`): o `filter-bar.tsx` é client e tem JSX,
 * então a regra mora aqui para o runner `node --test` alcançá-la e para a barra
 * e o teste decidirem pela mesma função.
 */

/** O mínimo de um `FilterConfig` de que a regra precisa. */
export interface FiltroMinimo {
  key: string;
  type: string;
  /** Busca fora da URL (`search` com `aoBuscar`): o termo não vai para a URL. */
  aoBuscar?: (termo: string) => void;
}

/** Lê um parâmetro da URL (ex.: `searchParams.get`). */
export type LerParametro = (key: string) => string | null;

/** Tipos que serializam em duas chaves, `<key>De` e `<key>Ate`. */
const TIPOS_DE_FAIXA = new Set(["daterange", "faixa"]);

/**
 * Chaves de URL de um filtro: `[key]`, ou `[keyDe, keyAte]` no `daterange` e
 * na `faixa`. Fonte única da expansão, usada pelas chaves persistidas, pelo
 * "Limpar filtros" e pelo filtro ativo.
 */
export function chavesDoFiltro(filtro: FiltroMinimo): string[] {
  return TIPOS_DE_FAIXA.has(filtro.type) ? [`${filtro.key}De`, `${filtro.key}Ate`] : [filtro.key];
}

/** A busca deste filtro fica só no estado do componente, fora da URL. */
export function buscaLocal(filtro: FiltroMinimo): boolean {
  return filtro.type === "search" && typeof filtro.aoBuscar === "function";
}

/**
 * Chaves de URL que contam como filtro: as que são persistidas por tela e
 * restauradas. A busca com `aoBuscar` fica de fora, porque o termo nunca vai
 * para a URL (pode ser dado pessoal, como nome ou e-mail).
 */
export function chavesNaUrl(filtros: readonly FiltroMinimo[]): string[] {
  return filtros.flatMap((f) => (buscaLocal(f) ? [] : chavesDoFiltro(f)));
}

/** Escrita do "Limpar filtros": todas as chaves de todos os filtros saem da URL. */
export function limpezaDosFiltros(filtros: readonly FiltroMinimo[]): Record<string, null> {
  const updates: Record<string, null> = {};
  for (const f of filtros) for (const k of chavesDoFiltro(f)) updates[k] = null;
  return updates;
}

/**
 * Um filtro está ativo quando tem valor na URL. O `daterange` e a `faixa`
 * serializam em `<key>De`/`<key>Ate` e contam como ativos com qualquer um dos
 * dois. Na `faixa`, valor não numérico na URL não conta, como se não houvesse
 * filtro. A busca com `aoBuscar` não lê a URL.
 */
export function filtroAtivo(filtro: FiltroMinimo, get: LerParametro): boolean {
  if (buscaLocal(filtro)) return false;
  if (filtro.type === "faixa") return chavesDoFiltro(filtro).some((k) => numeroDe(get(k)) !== null);
  return chavesDoFiltro(filtro).some((k) => Boolean(get(k)));
}

/**
 * O botão "Limpar filtros" só aparece quando limpa mais do que a busca: com
 * algum filtro ativo que **não** é `type: "search"`. Só com a busca ativa, o `X`
 * da própria busca já limpa, e o botão seria o terceiro "x" da barra (o nativo
 * do navegador era o primeiro, escondido pela regra CSS base). A busca com
 * `aoBuscar` segue a mesma regra: quando o botão aparece, ele a limpa também.
 */
export function mostrarLimparFiltros(filtros: readonly FiltroMinimo[], get: LerParametro): boolean {
  return filtros.some((f) => f.type !== "search" && filtroAtivo(f, get));
}

// ─── Faixa numérica (D1) ────────────────────────────────────────────────────

/** Limites de um filtro `faixa`. */
export interface LimitesFaixa {
  min: number;
  max: number;
}

/** Valores de uma faixa; `null` é o limite não informado. */
export interface ValorFaixa {
  de: number | null;
  ate: number | null;
}

/** Número de um texto (campo ou URL); vazio ou não numérico vira `null`. */
function numeroDe(texto: string | null | undefined): number | null {
  if (texto == null) return null;
  const t = texto.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const limitar = (n: number, { min, max }: LimitesFaixa) => Math.min(max, Math.max(min, n));

/**
 * Normaliza a faixa digitada ou lida da URL: valor não numérico é ignorado
 * (como se não houvesse limite), valor fora de `min`..`max` vai para o limite
 * mais próximo e, se "de" ficar maior que "até", os dois são trocados.
 */
export function normalizarFaixa(
  de: string | null | undefined,
  ate: string | null | undefined,
  limites: LimitesFaixa,
): ValorFaixa {
  let a = numeroDe(de);
  let b = numeroDe(ate);
  if (a !== null) a = limitar(a, limites);
  if (b !== null) b = limitar(b, limites);
  if (a !== null && b !== null && a > b) [a, b] = [b, a];
  return { de: a, ate: b };
}

/**
 * Escrita na URL de um filtro `faixa`: `<key>De` e `<key>Ate`, cada um só
 * quando preenchido (o vazio remove a chave).
 */
export function escritaDaFaixa(
  filtro: FiltroMinimo,
  de: string | null | undefined,
  ate: string | null | undefined,
  limites: LimitesFaixa,
): Record<string, string | null> {
  const v = normalizarFaixa(de, ate, limites);
  const [chaveDe, chaveAte] = chavesDoFiltro(filtro);
  return {
    [chaveDe]: v.de === null ? null : String(v.de),
    [chaveAte]: v.ate === null ? null : String(v.ate),
  };
}

const formatarNumero = (n: number) => n.toLocaleString("pt-BR");

/**
 * Rótulo resumido do gatilho da faixa: "Nota: 40 a 80", "Nota: a partir de 40",
 * "Nota: até 80", ou só o rótulo quando não há valor.
 */
export function rotuloFaixa(rotulo: string, { de, ate }: ValorFaixa): string {
  if (de !== null && ate !== null) return `${rotulo}: ${formatarNumero(de)} a ${formatarNumero(ate)}`;
  if (de !== null) return `${rotulo}: a partir de ${formatarNumero(de)}`;
  if (ate !== null) return `${rotulo}: até ${formatarNumero(ate)}`;
  return rotulo;
}
