"use client";

import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Expansivel } from "@/components/ui/expansivel";
import { cn } from "@/lib/utils";

/**
 * Bloco colapsável (accordion) — ui-guidelines §4 (catálogo). Controlado pelo
 * pai (`open`/`onToggle`) para suportar regras como "só o mais recente
 * expandido". O cabeçalho é um `<button aria-expanded>` (foco visível, alvo ≥
 * 40px, Enter/Espaço); ações secundárias (links/botões) ficam ao lado do
 * gatilho — nunca aninhadas dentro dele (HTML inválido). Cores só por token;
 * transições respeitam `prefers-reduced-motion`. Refs: ui-guidelines §2.2, §6,
 * §7, §9.
 */
export interface AccordionItemProps {
  /** Título exibido no cabeçalho (dentro do gatilho de expandir). */
  title: ReactNode;
  /** Conteúdo informativo do cabeçalho (ex.: contagem, selo de versão). */
  meta?: ReactNode;
  /** Ações do cabeçalho (ex.: editar, remover) — fora do gatilho de expandir. */
  actions?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  meta,
  actions,
  open,
  onToggle,
  children,
  className,
}: AccordionItemProps) {
  const bodyId = useId();

  return (
    <div
      className={cn(
        "border border-[var(--premium-mist)] rounded-[var(--r-lg)] overflow-hidden bg-[var(--c-surface)]",
        className
      )}
    >
      <div className="flex items-center gap-2 bg-[var(--premium-paper)] border-b border-[var(--premium-mist)] pr-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-h-[44px] flex-1 min-w-0 items-center gap-2 px-[14px] py-[10px] text-left cursor-pointer focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--yellow-50)]"
        >
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-[var(--premium-gray)] transition-transform duration-150 motion-reduce:transition-none",
              open && "rotate-180"
            )}
          />
          <span className="truncate text-[13.5px] font-bold text-[var(--c-ink)]">{title}</span>
        </button>
        {meta}
        {actions}
      </div>
      <Expansivel open={open} id={bodyId}>
        {children}
      </Expansivel>
    </div>
  );
}
