"use client";

import type { KeyboardEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { Check, Search } from "lucide-react";
import { motionPreset } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/ui/select";

/** Item da lista do `Select`: uma opção ou o placeholder (valor vazio). */
export type ItemSelect = SelectOption & { isPlaceholder?: boolean };

interface SelectPainelProps {
  popRef: RefObject<HTMLDivElement | null>;
  buscaRef: RefObject<HTMLInputElement | null>;
  itemRefs: RefObject<(HTMLButtonElement | null)[]>;
  /** Gatilho medido na tela: o painel se ancora embaixo dele. */
  rect: { left: number; bottom: number; width: number };
  inline: boolean;
  comBusca: boolean;
  busca: string;
  /** Termo novo da busca; a lista muda e o destaque volta ao primeiro resultado. */
  onBusca: (termo: string) => void;
  label?: string;
  listboxId: string;
  itens: ItemSelect[];
  selected: string;
  highlight: number;
  onHighlight: (i: number) => void;
  onSelecionar: (valor: string) => void;
  onPainelKeyDown: (e: KeyboardEvent) => void;
}

/**
 * Painel do `Select` em portal: busca (listas longas), a lista de opções com o
 * item destacado e o vazio. Posição fixa ancorada ao gatilho, presa à tela.
 */
export function SelectPainel({
  popRef,
  buscaRef,
  itemRefs,
  rect,
  inline,
  comBusca,
  busca,
  onBusca,
  label,
  listboxId,
  itens,
  selected,
  highlight,
  onHighlight,
  onSelecionar,
  onPainelKeyDown,
}: SelectPainelProps) {
  const maxAltura = 320;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  return createPortal(
    <m.div
      ref={popRef}
      {...motionPreset("menu")}
      // Marcador para popovers hospedeiros ignorarem cliques aqui dentro
      // (o painel vive em portal, fora da árvore DOM do hospedeiro).
      data-select-pop=""
      onKeyDown={onPainelKeyDown}
      style={{
        position: "fixed",
        left: Math.max(8, Math.min(rect.left, vw - Math.max(rect.width, inline ? 200 : 0) - 8)),
        top: Math.min(rect.bottom + 6, vh - maxAltura),
        width: Math.max(rect.width, inline ? 200 : 0),
      }}
      className="z-[60] rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-2 shadow-[var(--sh-lg)]"
    >
      {comBusca && (
        <div className="relative mb-2">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--premium-gray)]"
          />
          <input
            ref={buscaRef}
            type="text"
            value={busca}
            onChange={(e) => {
              onBusca(e.target.value);
            }}
            placeholder="Buscar..."
            aria-label={label ? `Buscar em ${label}` : "Buscar opção"}
            className="w-full rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] py-2 pr-3 pl-8 text-[13px] focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)] focus:outline-none"
          />
        </div>
      )}
      <div
        id={listboxId}
        role="listbox"
        aria-label={label}
        className="kanban-col-scroll flex max-h-[256px] flex-col overflow-y-auto"
      >
        {itens.map((o, i) => {
          const ativo = o.value === selected && !o.isPlaceholder;
          return (
            <button
              key={`${o.value}-${i}`}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="option"
              aria-selected={ativo}
              aria-disabled={o.disabled || undefined}
              disabled={o.disabled}
              tabIndex={comBusca ? -1 : undefined}
              onClick={() => {
                if (!o.disabled) onSelecionar(o.value);
              }}
              onMouseEnter={() => onHighlight(i)}
              className={cn(
                "flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-[var(--r-md)] px-3 text-left text-[13px] transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
                o.isPlaceholder ? "text-[var(--premium-gray)]" : "text-[var(--c-ink)]",
                o.disabled && "cursor-not-allowed text-[var(--premium-gray)]",
                i === highlight && "bg-[var(--premium-bone)]",
                ativo && "font-medium",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {ativo && <Check size={15} className="shrink-0 text-[var(--premium-ink)]" />}
            </button>
          );
        })}
        {itens.length === 0 && (
          <div className="py-6 text-center text-[12.5px] text-[var(--premium-gray)]">
            Nenhuma opção encontrada.
          </div>
        )}
      </div>
    </m.div>,
    document.body,
  );
}
