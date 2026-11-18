"use client";

import type { KeyboardEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { popoverPos, PAINEL_W, PAINEL_H_EST } from "@/lib/popover-pos";
import { motionPreset } from "@/lib/motion";
import { DIAS, MESES, toISO } from "@/components/ui/date-picker-datas";

interface CalendarioPainelProps {
  popRef: RefObject<HTMLDivElement | null>;
  panelId: string;
  /** Gatilho medido na tela: o painel se ancora nele. */
  rect: { left: number; top: number; bottom: number; width: number };
  /** Mês exibido (`month` de 0 a 11). */
  view: { year: number; month: number };
  /** Valor ISO selecionado, ou vazio. */
  selected: string;
  onEscKeyDown: (e: KeyboardEvent) => void;
  onNavMes: (delta: number) => void;
  onSelecionar: (iso: string) => void;
  desabilitado: (iso: string) => boolean;
}

/**
 * Calendário do `DatePicker` em portal: navegação de mês, a grade do mês com o
 * dia selecionado e o de hoje, e as ações "Hoje" e "Limpar".
 */
export function CalendarioPainel({
  popRef,
  panelId,
  rect,
  view,
  selected,
  onEscKeyDown,
  onNavMes,
  onSelecionar,
  desabilitado,
}: CalendarioPainelProps) {
  // Grade do mês.
  const firstDow = new Date(view.year, view.month, 1).getDay();
  const diasNoMes = new Date(view.year, view.month + 1, 0).getDate();
  const hojeISO = (() => {
    const d = new Date();
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  })();
  const celulas: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  return createPortal(
    <m.div
      ref={popRef}
      {...motionPreset("menu")}
      id={panelId}
      role="dialog"
      aria-label="Selecionar data"
      // Marcador para popovers hospedeiros ignorarem cliques aqui dentro
      // (o calendário vive em portal, fora da árvore DOM do hospedeiro).
      data-datepicker-pop=""
      onKeyDown={onEscKeyDown}
      style={popoverPos(rect, PAINEL_W, PAINEL_H_EST)}
      className="z-[60] overflow-y-auto rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-3 shadow-[var(--sh-lg)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavMes(-1)}
          aria-label="Mês anterior"
          className="cursor-pointer rounded-[var(--r-sm)] p-1.5 text-[var(--premium-gray)] hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)]"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[12.5px] font-bold">
          {MESES[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={() => onNavMes(1)}
          aria-label="Próximo mês"
          className="cursor-pointer rounded-[var(--r-sm)] p-1.5 text-[var(--premium-gray)] hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DIAS.map((d, i) => (
          <div
            key={i}
            className="flex h-6 items-center justify-center text-[10px] font-bold text-[var(--premium-gray)] uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={i} className="h-8" />;
          const iso = toISO(view.year, view.month, dia);
          const isSel = iso === selected;
          const isHoje = iso === hojeISO;
          const off = desabilitado(iso);
          return (
            <button
              key={i}
              type="button"
              disabled={off}
              onClick={() => onSelecionar(iso)}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-center rounded-[var(--r-sm)] text-[12px] transition-colors",
                isSel
                  ? "bg-[var(--yellow)] font-bold text-[var(--premium-black)]"
                  : "text-[var(--premium-ink)] hover:bg-[var(--premium-bone)]",
                !isSel && isHoje && "font-bold ring-1 ring-[var(--premium-silver)] ring-inset",
                off && "cursor-not-allowed opacity-30 hover:bg-transparent",
              )}
            >
              {dia}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-[var(--premium-mist)] pt-2">
        <button
          type="button"
          onClick={() => onSelecionar(hojeISO)}
          className="cursor-pointer text-[11.5px] font-medium text-[var(--premium-ink)] hover:underline"
        >
          Hoje
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => onSelecionar("")}
            className="cursor-pointer text-[11.5px] text-[var(--premium-gray)] hover:text-[var(--danger)]"
          >
            Limpar
          </button>
        )}
      </div>
    </m.div>,
    document.body,
  );
}
