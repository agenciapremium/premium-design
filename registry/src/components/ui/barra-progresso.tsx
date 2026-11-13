"use client";

import { m } from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * Barra de progresso com preenchimento que cresce da esquerda na entrada
 * (change animacoes-graficos-abas-transicoes). `scaleX` é transform → o
 * `MotionConfig reducedMotion` já o neutraliza. Client leve, renderizável a
 * partir de server components (recebe só números/strings, sem funções).
 */
export function BarraProgresso({
  pct,
  background,
  altura = "h-2",
  trackClassName,
  className,
}: {
  /** 0–100. */
  pct: number;
  /** `background` CSS do preenchimento (ex.: gradiente por token). */
  background?: string;
  altura?: string;
  trackClassName?: string;
  className?: string;
}) {
  const largura = Math.min(100, Math.max(0, pct));
  return (
    <div
      className={`w-full ${altura} rounded-full bg-[var(--premium-bone)] overflow-hidden ${trackClassName ?? ""}`}
      aria-hidden
    >
      <m.div
        className={`h-full rounded-full ${className ?? ""}`}
        style={{ width: `${largura}%`, background, transformOrigin: "left" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
    </div>
  );
}
