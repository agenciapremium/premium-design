"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Switch liga/desliga do Design System (ui-guidelines §4.1/§7).
 *
 * `button role="switch"` com trilho e polegar — **não** um `<input type=checkbox>`
 * com `accent-color`: controle nativo não é estilizável de forma consistente entre
 * navegadores e o sistema não usa nativos (ui-guidelines §4.8).
 *
 * Use para **estado binário que vale por si**, aplicado na hora (auto-save, §5.9):
 * ativo/inativo, ligado/desligado. Quando a ação é destrutiva ou tem efeito que a
 * pessoa precisa entender antes, o `onCheckedChange` do consumidor confirma primeiro
 * e só então troca o estado — o switch não muda sozinho.
 *
 * Para escolher entre várias opções, é `Select` ou chips; para disparar uma ação,
 * é `Button`.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  dica,
  className,
}: {
  checked: boolean;
  onCheckedChange: (proximo: boolean) => void;
  /** Vira o `aria-label` — obrigatório: o switch não tem texto próprio. */
  label: string;
  disabled?: boolean;
  /** Dica do estado atual (balão no hover e no foco), quando ajuda a ler o trilho. */
  dica?: string;
  className?: string;
}) {
  return (
    <Tooltip label={dica ?? ""} side="top" className="shrink-0" disabled={!dica}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => !disabled && onCheckedChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full outline-none transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]",
          checked ? "bg-[var(--success)]" : "bg-[var(--premium-mist)]",
          className
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </Tooltip>
  );
}
