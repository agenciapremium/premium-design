"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Escreve chaves na URL preservando as demais. Qualquer mudança de filtro/visão
 * reseta a paginação para a página 1 (remove `?pagina=`), evitando cair numa
 * página inexistente para o novo recorte (capability paginacao-tabelas, reset ao
 * filtrar). Usa `router.replace` (sem poluir o histórico) e `scroll: false`, ou,
 * com `local`, `history.replaceState` (change calendario-time-filtros, D5).
 *
 * Mora fora da `FilterBar` (change catalogo-componentes-premium-design, D7) para
 * quem renderiza `ViewTabsPill` fora da barra (ex.: as abas da visão Tabela de
 * demandas) e para as listas com abas por parâmetro: a regra do reset de página
 * existe em um só lugar em vez de ser reescrita no consumidor.
 */
export function useSetParams({ local = false }: { local?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function setParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    if (!("pagina" in updates)) params.delete("pagina");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    // `local` (prop `recorteLocal`): a tela recorta no navegador, então basta a
    // URL; o Next sincroniza `useSearchParams` sem refazer a página.
    if (local) window.history.replaceState(null, "", url);
    else router.replace(url, { scroll: false });
  };
}
