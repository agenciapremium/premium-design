"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";

/**
 * Recolhe/expande a altura de uma seção com transição suave (change
 * animacoes-motion-overlays): `height: 0 ↔ auto` + `opacity` (~200 ms, curva
 * `--ease`), via `AnimatePresence` para animar também o recolhimento antes do
 * desmonte. Usado por accordion, raias do Kanban e árvore de docs.
 *
 * `height` não é `transform`, então o `MotionConfig reducedMotion` não a desliga
 * sozinho — zeramos a duração sob `prefers-reduced-motion`. O `overflow` só recorta
 * enquanto em trânsito; expandido e parado fica `visible`, para não cortar sombras
 * de card, anel de foco ou colunas com rolagem horizontal (raias).
 */
export function Expansivel({
  open,
  children,
  id,
  className,
}: {
  open: boolean;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const [animando, setAnimando] = useState(false);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          key="conteudo"
          id={id}
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.2, ease: EASE }}
          onAnimationStart={() => setAnimando(true)}
          onAnimationComplete={() => setAnimando(false)}
          style={{ overflow: animando ? "hidden" : "visible" }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}
