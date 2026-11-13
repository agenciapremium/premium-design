"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

/**
 * Provider único de animação do design system (change animacoes-motion-overlays).
 *
 * - `LazyMotion features={domAnimation} strict`: carrega só as features leves
 *   (~20 kb — animações, variants, exit, gestos de hover/tap). O modo `strict`
 *   faz o componente `motion.*` completo lançar erro: use sempre `m.*`.
 * - `MotionConfig reducedMotion="user"`: respeita `prefers-reduced-motion` por
 *   construção, dispensando tratamento caso a caso (docs/design-system/ui-guidelines.md §2.6).
 * - Transição default com a curva `--ease` do projeto.
 *
 * Montado nos três shells (app interno, portal do cliente, docs). Componentes
 * `m.*` renderizados via portal (ex.: SlideOver) continuam cobertos: o contexto
 * React atravessa `createPortal`.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: EASE }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
