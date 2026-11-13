"use client";

import { useCountUp } from "@/lib/hooks/use-count-up";

/**
 * Exibe um número com contagem crescente animada (change
 * animacoes-graficos-abas-transicoes). Passe `format` para preservar
 * moeda/%/compacto. Sob `prefers-reduced-motion` mostra o valor final direto
 * (guardado dentro do `useCountUp`).
 */
export function Contador({
  valor,
  format,
  duracao,
  className,
}: {
  valor: number;
  format?: (n: number) => string;
  duracao?: number;
  className?: string;
}) {
  const texto = useCountUp(valor, { format, duration: duracao });
  return <span className={className}>{texto}</span>;
}
