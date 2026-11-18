"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Dropdown em portal das pílulas: o estado do painel (`useDropdownPortal`) e o
 * item de seleção única (`SingleSelectItem`), usados pela `PilulaSelect` e pelos
 * filtros da `FilterBar`. Reexportados por `pilula.tsx`.
 */

/**
 * Estado de um dropdown renderizado em **portal** com `position: fixed`
 * (capability filter-bar-busca-layout-global), necessário para não ser cortado
 * pela rolagem horizontal da barra. Fecha por clique fora / `Esc`, e reposiciona
 * em scroll/resize. Espelha o padrão de `multi-select.tsx`.
 */
export function useDropdownPortal() {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(ev: MouseEvent) {
      const t = ev.target as Node | null;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    function reposition() {
      setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  function abrir() {
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setOpen((o) => !o);
  }

  return { open, setOpen, rect, triggerRef, panelRef, abrir };
}

export function SingleSelectItem({
  checked,
  label,
  onClick,
  contagem,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  /** Número à direita (ex.: não lidas da categoria). Zero ou ausente não aparece. */
  contagem?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-selected={checked}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 py-[7px] text-left text-[13px] text-[var(--premium-ink)] hover:bg-[var(--premium-bone)]",
        "focus-visible:bg-[var(--premium-bone)] focus-visible:outline-none",
        checked && "font-medium",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {contagem ? (
        <span className="shrink-0 text-[11px] font-bold text-[var(--premium-gray)] tabular-nums">
          {contagem}
        </span>
      ) : null}
      {checked && <Check size={13} className="shrink-0" />}
    </button>
  );
}
