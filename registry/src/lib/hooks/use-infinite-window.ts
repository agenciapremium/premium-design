"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Janela de carregamento incremental por coluna de Kanban (capability
 * `kanban-scroll-infinito`). Mantém `visiveis` cartões renderizados a partir de um
 * array já carregado no client e cresce em lotes de `step` quando a sentinela entra
 * na área visível da coluna (IntersectionObserver com `root` no container rolável
 * da coluna; fallback viewport). Não faz fetch — apenas fatia o array; o total e o
 * badge continuam refletindo `total`. Transversal aos três Kanbans.
 *
 * `resetKey` reinicia a janela (volta a `inicial`) quando muda o filtro/ordenação/
 * modo — o DnD e o realtime alteram o array/total sem passar por aqui, então não
 * reiniciam a janela.
 */
export function useInfiniteWindow(
  total: number,
  step: number,
  inicial: number,
  resetKey?: string
): {
  visiveis: number;
  sentinelaRef: React.RefObject<HTMLDivElement | null>;
  temMais: boolean;
  reset: () => void;
} {
  const [visiveis, setVisiveis] = useState(inicial);
  const sentinelaRef = useRef<HTMLDivElement | null>(null);
  const temMais = visiveis < total;

  // Reinicia a janela ao trocar filtro/ordenação/modo (resetKey), não no DnD —
  // ajuste de estado no render (padrão React), sem efeito nem cascata.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setVisiveis(inicial);
  }

  // Carrega o próximo lote quando a sentinela do fim da lista fica visível.
  useEffect(() => {
    const sentinela = sentinelaRef.current;
    if (!sentinela || !temMais) return;
    const root = acharScrollavel(sentinela);
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisiveis((v) => Math.min(v + step, total));
        }
      },
      { root, rootMargin: "120px" }
    );
    obs.observe(sentinela);
    return () => obs.disconnect();
  }, [temMais, step, total, visiveis]);

  const reset = useCallback(() => setVisiveis(inicial), [inicial]);

  return { visiveis, sentinelaRef, temMais, reset };
}

/** Container rolável mais próximo (overflow y auto/scroll); `null` = viewport. */
function acharScrollavel(el: Element): Element | null {
  let p = el.parentElement;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if (oy === "auto" || oy === "scroll") return p;
    p = p.parentElement;
  }
  return null;
}
