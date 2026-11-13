"use client";

import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, Ref } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ContextIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "title"> {
  icon: LucideIcon;
  /** Rótulo da ação — vira a dica (`Tooltip`) e o `aria-label`. */
  label: string;
  /** Lado da dica. `bottom` por padrão: a barra de ações vive no topo da tela. */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Classe do wrapper da dica (ex.: `shrink-0` numa linha apertada). */
  tooltipClassName?: string;
  /**
   * `neutro` (padrão) = ação contextual comum; `destaque` = ação de criação
   * principal da tela (espelho só-ícone do `Button variant="dark"`).
   */
  variant?: "neutro" | "destaque";
  /** Ação assíncrona em andamento: spinner + disabled + `aria-busy`. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Botão de contexto só-ícone da barra de ações (capability filter-bar): alvo
 * ≥40×40, dica (`Tooltip`) + aria-label obrigatórios, foco visível e tokens
 * semânticos nos dois temas. Estilo neutro espelha o botão de configurações do
 * quadro (quadros-exportar-em-configuracoes); o destaque fica reservado à
 * criação principal da tela — em repouso sem amarelo; no hover assume a
 * assinatura da marca (ícone amarelo sobre tinta), nos dois temas.
 *
 * A dica é embutida: o `label` já vira balão e nome acessível, então **não**
 * envolver o componente num `Tooltip` externo (sairiam dois balões).
 */
export function ContextIconButton({
  icon: Icon,
  label,
  variant = "neutro",
  loading = false,
  disabled,
  className,
  type = "button",
  tooltipSide = "bottom",
  tooltipClassName,
  ...props
}: ContextIconButtonProps) {
  return (
    <Tooltip label={label} side={tooltipSide} className={cn("shrink-0", tooltipClassName)}>
      <button
        type={type}
        aria-label={label}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(
          "flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-[var(--r-md)] transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]",
          "disabled:opacity-50 disabled:cursor-default",
          variant === "destaque"
            ? "bg-[var(--c-emphasis)] text-[var(--c-on-emphasis)] hover:bg-[var(--c-emphasis-hover)] hover:text-[var(--brand-yellow)] dark:hover:bg-[var(--brand-ink)]"
            : "text-[var(--premium-gray)] hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)]",
          className
        )}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      </button>
    </Tooltip>
  );
}
