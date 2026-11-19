"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PropsNativas = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "defaultChecked" | "onChange" | "className" | "children"
>;

export interface CaixaSelecaoProps extends PropsNativas {
  /** Marcada ou não (controlada). */
  checked: boolean;
  /** Recebe o estado desejado, não um "inverta". */
  onCheckedChange: (marcada: boolean) => void;
  /** Texto visível à direita da caixa. Sem ele, passe `aria-label`. */
  children?: ReactNode;
  className?: string;
}

/**
 * Caixa de seleção do design system (premium-design v0.28.0): um
 * `<input type="checkbox">` de verdade (teclado, leitor de tela, formulário),
 * invisível sobre o desenho do sistema. Nunca a caixa nativa com
 * `accent-color`, que não estiliza igual entre navegadores (ui-guidelines §4.8).
 *
 * - **Marcada:** fundo e borda `--yellow`, visto `--brand-ink`, iguais nos dois
 *   temas (o amarelo da matriz de permissões do Tasks).
 * - **Desmarcada:** borda `--premium-gray` (3:1 ou mais sobre a superfície nos
 *   dois temas), fundo `--premium-white`; hover com borda `--premium-ink`.
 * - **Foco:** contorno `--premium-ink` com halo `--yellow-50`.
 * - **Desabilitada:** `opacity-50` e `cursor-not-allowed`; a marcada continua
 *   amarela, para ler "marcada e travada".
 * - **Alvo:** 44×44px no mínimo, com a caixa de 18px no centro.
 *
 * Para várias escolhas de uma lista com efeito em grupo (matriz de permissões,
 * "aplicar a todos"). Estado binário aplicado na hora continua sendo `Switch`.
 */
export function CaixaSelecao({
  checked,
  onCheckedChange,
  children,
  className,
  disabled,
  ...props
}: CaixaSelecaoProps) {
  return (
    <label
      className={cn(
        "group/caixa relative inline-flex min-h-11 min-w-11 items-center gap-2.5 text-[13px] text-[var(--premium-ink)]",
        children == null ? "justify-center" : "justify-start",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        {...props}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer absolute inset-0 m-0 h-full w-full cursor-[inherit] opacity-0"
      />
      <span
        aria-hidden
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[var(--r-sm)] border transition-colors motion-reduce:transition-none",
          "peer-focus-visible:shadow-[0_0_0_4px_var(--yellow-50)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--premium-ink)]",
          checked
            ? "border-[var(--yellow)] bg-[var(--yellow)] text-[var(--brand-ink)]"
            : "border-[var(--premium-gray)] bg-[var(--premium-white)] text-transparent",
          !checked && !disabled && "group-hover/caixa:border-[var(--premium-ink)]",
          disabled && "opacity-50",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </span>
      {children}
    </label>
  );
}
