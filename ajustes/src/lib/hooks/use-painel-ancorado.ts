"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Posição do gatilho na tela, onde o painel se ancora. */
export interface AncoraPainel {
  left: number;
  top: number;
  bottom: number;
  width: number;
}

/**
 * Painel em portal ancorado a um gatilho (o `Select` e o `DatePicker`): com o
 * painel aberto, mede o gatilho e mede de novo a cada rolagem (inclusive de um
 * `SlideOver`) e redimensionamento, e chama `aoClicarFora` no clique fora do
 * gatilho e do painel. Devolve a última medida, ou `null` antes da primeira.
 */
export function usePainelAncorado({
  aberto,
  gatilhoRef,
  painelRef,
  aoClicarFora,
}: {
  aberto: boolean;
  gatilhoRef: RefObject<HTMLElement | null>;
  painelRef: RefObject<HTMLElement | null>;
  aoClicarFora: () => void;
}): AncoraPainel | null {
  const [rect, setRect] = useState<AncoraPainel | null>(null);
  // O clique fora chama sempre a função do render mais recente.
  const aoClicarForaRef = useRef(aoClicarFora);
  useEffect(() => {
    aoClicarForaRef.current = aoClicarFora;
  });

  useEffect(() => {
    if (!aberto) return;
    const update = () => {
      const r = gatilhoRef.current?.getBoundingClientRect();
      if (r) setRect({ left: r.left, top: r.top, bottom: r.bottom, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [aberto, gatilhoRef]);

  useEffect(() => {
    if (!aberto) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (painelRef.current?.contains(t) || gatilhoRef.current?.contains(t)) return;
      aoClicarForaRef.current();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [aberto, gatilhoRef, painelRef]);

  return rect;
}
