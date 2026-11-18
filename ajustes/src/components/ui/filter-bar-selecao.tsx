"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionPreset } from "@/lib/motion";
import { popoverPos } from "@/lib/popover-pos";
import {
  chipActive,
  chipBase,
  chipIdle,
  dropdownPanelClass,
  SingleSelectItem,
  useDropdownPortal,
} from "@/components/ui/pilula";
import {
  comDependentes,
  filtrarOpcoes,
  mostrarBuscaPara,
  type EscreverParams,
  type FilterConfig,
  type ParamsDaUrl,
} from "@/components/ui/filter-bar-config";

// Campo de busca reusado pelos dropdowns de select/multiselect (foco visível,
// teclado e tokens semânticos claro/escuro).
function OpcoesBusca({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="relative mb-1">
      <Search
        size={14}
        className="absolute top-1/2 left-2 -translate-y-1/2 text-[var(--premium-gray)]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Buscar..."
        aria-label={`Buscar em ${label}`}
        autoFocus
        className="w-full rounded-[var(--r-sm)] border border-[var(--premium-mist)] bg-[var(--premium-paper)] py-[6px] pr-2 pl-7 text-[13px] text-[var(--premium-ink)] focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)] focus:outline-none"
      />
    </div>
  );
}

export function SingleSelectControl({
  filter,
  searchParams,
  setParams,
}: {
  filter: FilterConfig;
  searchParams: ParamsDaUrl;
  setParams: EscreverParams;
}) {
  const [busca, setBusca] = useState("");
  const { open, setOpen, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const Icon = filter.icon;
  const value = searchParams.get(filter.key) ?? "";
  const selectedLabel = filter.options?.find((o) => o.value === value)?.label;
  const mostrarBusca = mostrarBuscaPara(filter);
  const visiveis = filtrarOpcoes(filter, busca);

  function escolher(v: string | null) {
    setParams(comDependentes(filter, v));
    setBusca("");
    setOpen(false);
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        onClick={() => {
          setBusca("");
          abrir();
        }}
        aria-label={filter.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(chipBase, value ? chipActive : chipIdle)}
      >
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span>{value && selectedLabel ? `${filter.label}: ${selectedLabel}` : filter.label}</span>
        <ChevronDown size={14} className="-mr-1 text-[var(--premium-gray)]" />
      </button>
      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            role="listbox"
            aria-label={filter.label}
            style={popoverPos(rect, Math.max(rect.width, 220), 320)}
            className={dropdownPanelClass}
          >
            {mostrarBusca && <OpcoesBusca value={busca} onChange={setBusca} label={filter.label} />}
            {!busca && (
              <SingleSelectItem
                checked={!value}
                label={filter.placeholder ?? "Todos"}
                onClick={() => escolher(null)}
              />
            )}
            {visiveis.map((o) => (
              <SingleSelectItem
                key={o.value}
                checked={o.value === value}
                label={o.label}
                onClick={() => escolher(o.value)}
              />
            ))}
            {visiveis.length === 0 && (
              <div className="py-4 text-center text-[13px] text-[var(--premium-gray)]">
                Nenhum resultado.
              </div>
            )}
          </m.div>,
          document.body,
        )}
    </div>
  );
}

export function MultiSelectControl({
  filter,
  searchParams,
  setParams,
}: {
  filter: FilterConfig;
  searchParams: ParamsDaUrl;
  setParams: EscreverParams;
}) {
  const [busca, setBusca] = useState("");
  const { open, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const Icon = filter.icon;
  const raw = searchParams.get(filter.key);
  const selected = raw ? raw.split(",").filter(Boolean) : [];
  const active = selected.length > 0;
  const mostrarBusca = mostrarBuscaPara(filter);
  const visiveis = filtrarOpcoes(filter, busca);

  function toggle(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    setParams(comDependentes(filter, next.length ? next.join(",") : null));
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        onClick={() => {
          setBusca("");
          abrir();
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(chipBase, active ? chipActive : chipIdle)}
      >
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span>{filter.label}</span>
        {active && (
          <span className="min-w-[16px] rounded-full bg-[var(--premium-ink)] px-[6px] text-center text-[11px] font-bold text-[var(--premium-paper)]">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className="-mr-1 text-[var(--premium-gray)]" />
      </button>
      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            role="listbox"
            aria-label={filter.label}
            aria-multiselectable
            style={popoverPos(rect, Math.max(rect.width, 220), 320)}
            className={dropdownPanelClass}
          >
            {mostrarBusca && <OpcoesBusca value={busca} onChange={setBusca} label={filter.label} />}
            {visiveis.map((o) => {
              const checked = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  role="option"
                  aria-selected={checked}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 py-[7px] text-left text-[13px] text-[var(--premium-ink)] hover:bg-[var(--premium-bone)] focus-visible:bg-[var(--premium-bone)] focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                      checked
                        ? "border-[var(--premium-ink)] bg-[var(--premium-ink)] text-[var(--premium-paper)]"
                        : "border-[var(--premium-mist)]",
                    )}
                  >
                    {checked && <Check size={12} />}
                  </span>
                  {o.label}
                </button>
              );
            })}
            {visiveis.length === 0 && (
              <div className="py-4 text-center text-[13px] text-[var(--premium-gray)]">
                Nenhum resultado.
              </div>
            )}
          </m.div>,
          document.body,
        )}
    </div>
  );
}
