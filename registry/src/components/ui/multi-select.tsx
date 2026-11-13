"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { popoverPos } from "@/lib/popover-pos";
import { motionPreset } from "@/lib/motion";

/**
 * MultiSelect genérico do Design System (estilo react-select multi), com a
 * identidade do Tasks. Para valores arbitrários (ex.: departamentos) — para
 * **pessoas** use o `PessoasPicker` (avatares + grupos). Controlado por
 * `value: string[]`; itens escolhidos viram badges removíveis; o popover (portal)
 * tem busca acento-insensível e é posicionado com flip/clamp (`popover-pos.ts`).
 */

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Cor opcional (mostra um ponto colorido — útil p/ departamentos). */
  cor?: string;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** A partir deste tamanho a lista ganha campo de busca. */
const BUSCA_A_PARTIR_DE = 8;

export function MultiSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Selecionar...",
  ariaLabel,
  disabled,
  minSelecionados = 0,
  searchable,
  className,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  options: MultiSelectOption[];
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  /** Impede remover abaixo deste número (ex.: 1 = ao menos um). */
  minSelecionados?: number;
  /** Força (ou oculta) o campo de busca; default: automático por tamanho. */
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selecionados = useMemo(
    () => value.map((v) => options.find((o) => o.value === v)).filter((o): o is MultiSelectOption => Boolean(o)),
    [value, options]
  );
  const podeRemover = value.length > minSelecionados && !disabled;
  const mostrarBusca = searchable ?? options.length >= BUSCA_A_PARTIR_DE;

  const termo = norm(busca.trim());
  const filtradas = useMemo(
    () => (termo ? options.filter((o) => norm(o.label).includes(termo)) : options),
    [options, termo]
  );

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
    if (disabled) return;
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setBusca("");
    setOpen((o) => !o);
  }

  function toggle(id: string) {
    if (value.includes(id)) {
      if (value.length <= minSelecionados) return;
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function remover(id: string) {
    if (value.length <= minSelecionados) return;
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className={`flex flex-col gap-[7px] ${className ?? ""}`}>
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]">{label}</span>
      )}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel ?? label}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir();
          }
        }}
        className={`flex min-h-[44px] w-full items-center gap-2 rounded-[var(--r-md)] border bg-[var(--c-surface)] px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] ${
          disabled
            ? "border-[var(--premium-mist)] opacity-50 cursor-not-allowed"
            : `cursor-pointer ${open ? "border-[var(--premium-ink)]" : "border-[var(--premium-mist)] hover:border-[var(--premium-ink)]"}`
        }`}
      >
        {selecionados.length === 0 ? (
          <span className="flex-1 text-[13px] text-[var(--premium-gray)]">{placeholder}</span>
        ) : (
          <span className="flex flex-1 flex-wrap gap-[6px]">
            {selecionados.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-[6px] rounded-full bg-[var(--premium-bone)] py-[3px] pl-[8px] pr-[6px] text-[12px] font-medium text-[var(--c-ink)]"
              >
                {o.cor && <span className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: o.cor }} />}
                {o.label}
                {podeRemover && (
                  <button
                    type="button"
                    aria-label={`Remover ${o.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remover(o.value);
                    }}
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[var(--premium-gray)] hover:bg-[var(--premium-mist)] hover:text-[var(--c-ink)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
                  >
                    <X size={13} />
                  </button>
                )}
              </span>
            ))}
          </span>
        )}
        <ChevronDown size={16} className="ml-auto shrink-0 text-[var(--premium-gray)]" />
      </div>

      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            data-multiselect-pop=""
            role="dialog"
            aria-label={ariaLabel ?? label ?? "Selecionar"}
            style={popoverPos(rect, Math.max(rect.width, 240), 360)}
            className="z-[60] max-h-[340px] overflow-y-auto rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-3 shadow-[var(--sh-lg)]"
          >
            {mostrarBusca && (
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--premium-gray)]" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar..."
                  aria-label="Buscar"
                  autoFocus
                  className="w-full rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] py-[9px] pl-9 pr-3 text-[13px] focus:border-[var(--premium-ink)] focus:outline-none focus:shadow-[0_0_0_2px_var(--yellow-50)]"
                />
              </div>
            )}
            <div className="space-y-[2px]">
              {filtradas.map((o) => {
                const ativo = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    aria-pressed={ativo}
                    className={`flex w-full items-center gap-2 rounded-[var(--r-md)] px-3 py-2 text-left transition-colors min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] ${
                      ativo ? "bg-[var(--gold-bg)] border border-[var(--gold)]" : "border border-transparent hover:bg-[var(--premium-bone)]"
                    }`}
                  >
                    {o.cor && <span className="h-[10px] w-[10px] shrink-0 rounded-full" style={{ background: o.cor }} />}
                    <span className="flex-1 text-[13px] text-[var(--c-ink)]">{o.label}</span>
                    {ativo && <Check size={16} className="shrink-0 text-[var(--gold)]" />}
                  </button>
                );
              })}
              {filtradas.length === 0 && (
                <div className="py-6 text-center text-[13px] text-[var(--premium-gray)]">Nenhum resultado.</div>
              )}
            </div>
          </m.div>,
          document.body
        )}
    </div>
  );
}
