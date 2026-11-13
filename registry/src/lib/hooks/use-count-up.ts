"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Anima um número em contagem crescente até `target` (change
 * animacoes-graficos-abas-transicoes). Formata a cada frame com `format` para
 * preservar moeda/%/compacto (`formatCurrency`, `fmtPct`, `moedaCompacta`).
 *
 * `useReducedMotion` NÃO cobre isto (count-up não é transform) — a guarda é
 * manual: sob movimento reduzido retorna o valor final direto. Na primeira
 * montagem conta de 0; em mudanças de `target` (ex.: troca de filtro) conta a
 * partir do valor anterior.
 */
export function useCountUp(
  target: number,
  opts?: { duration?: number; format?: (n: number) => string }
): string {
  const duration = opts?.duration ?? 0.5;
  const format = opts?.format ?? ((n: number) => String(Math.round(n)));
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState(prefersReduced ? target : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (prefersReduced || !Number.isFinite(target)) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    if (from === target) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const dur = Math.max(1, duration * 1000);
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      setValue(from + (target - from) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, prefersReduced]);

  return format(value);
}
