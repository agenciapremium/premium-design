/**
 * Executa `fn` (tipicamente um `router.replace`/`push`) dentro de uma View
 * Transition quando o navegador suporta, dando um crossfade de conteúdo na troca
 * de aba/visão server-nav (change animacoes-graficos-abas-transicoes, Tier 4).
 *
 * Progressive enhancement: sem a API (ou sob `prefers-reduced-motion`) apenas
 * chama `fn()` — a troca acontece instantaneamente, como hoje, sem erro. Não
 * altera a navegação (URL/filtros/paginação).
 */
type DocumentComViewTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

export function navegarComTransicao(fn: () => void): void {
  if (typeof document === "undefined") {
    fn();
    return;
  }
  const doc = document as DocumentComViewTransition;
  const prefersReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || typeof doc.startViewTransition !== "function") {
    fn();
    return;
  }
  doc.startViewTransition(fn);
}
