"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type Variant = "primary" | "dark" | "ghost" | "danger";
type Size = "default" | "sm";
export type ButtonVariant = Variant;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  /**
   * Estado de carregamento: cruza o rótulo para um spinner sem alterar a largura
   * do botão (crossfade CSS ~150 ms) e desabilita a ação. CSS puro — o `Button` é
   * usado em rotas sem `MotionProvider` (ex.: login), então não pode usar Motion.
   */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--yellow)] text-black hover:bg-[var(--gold)] active:bg-[var(--amber)] active:translate-y-px shadow-[var(--sh-gold)]",
  dark: "bg-[var(--c-emphasis)] text-[var(--c-on-emphasis)] hover:bg-[var(--c-emphasis-hover)]",
  ghost:
    "bg-transparent text-[var(--premium-ink)] border border-[var(--premium-mist)] hover:border-[var(--premium-ink)]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90",
};

const sizeClasses: Record<Size, string> = {
  default: "px-[18px] py-[11px] text-[13px]",
  sm: "px-3 py-2 text-[11px]",
};

const baseClasses =
  "relative inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider rounded-[var(--r-md)] cursor-pointer transition-all duration-150 ease-[var(--ease)] disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-ubuntu),system-ui,sans-serif]";

/**
 * As classes do `Button` (base + variante + tamanho), para um link (`<a>`) com
 * o mesmo visual, como Abrir e Baixar do cartão de documento (change
 * portal-documentos-pdf-office, D5). O `Button` usa exatamente estas classes.
 */
export function buttonVariantClasses(variant: Variant = "primary", size: Size = "default"): string {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
}

export function Button({
  variant = "primary",
  size = "default",
  className,
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariantClasses(variant, size), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 transition-opacity duration-150 motion-reduce:transition-none",
          loading && "opacity-0"
        )}
      >
        {children}
      </span>
      {loading && (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin motion-reduce:animate-none" />
        </span>
      )}
    </button>
  );
}
