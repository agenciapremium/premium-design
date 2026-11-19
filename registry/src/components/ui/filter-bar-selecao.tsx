"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SingleSelectItem, useDropdownPortal } from "@/components/ui/pilula";
import {
  comDependentes,
  filtrarOpcoes,
  mostrarBuscaPara,
  type FilterConfig,
  type PropsControleFiltro,
} from "@/components/ui/filter-bar-config";
import { GatilhoFiltro, PainelFiltro } from "@/components/ui/filter-bar-painel";

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

/**
 * Painel dos filtros de seleção: a busca (listas longas), as opções e o
 * "Nenhum resultado." quando a busca não acha nada.
 */
function PainelOpcoes({
  filter,
  aberto,
  rect,
  panelRef,
  busca,
  onBusca,
  vazio,
  multiselecionavel,
  children,
}: {
  filter: FilterConfig;
  aberto: boolean;
  rect: DOMRect | null;
  panelRef: RefObject<HTMLDivElement | null>;
  busca: string;
  onBusca: (termo: string) => void;
  vazio: boolean;
  multiselecionavel?: boolean;
  children: ReactNode;
}) {
  return (
    <PainelFiltro
      aberto={aberto}
      rect={rect}
      panelRef={panelRef}
      role="listbox"
      rotulo={filter.label}
      largura={220}
      altura={320}
      multiselecionavel={multiselecionavel}
    >
      {mostrarBuscaPara(filter) && (
        <OpcoesBusca value={busca} onChange={onBusca} label={filter.label} />
      )}
      {children}
      {vazio && (
        <div className="py-4 text-center text-[13px] text-[var(--premium-gray)]">
          Nenhum resultado.
        </div>
      )}
    </PainelFiltro>
  );
}

/**
 * Estado comum dos filtros de seleção: o menu em portal, a busca e as opções
 * visíveis, e as props do gatilho e do painel. Abrir limpa a busca.
 */
function useMenuOpcoes(filter: FilterConfig) {
  const [busca, setBusca] = useState("");
  const { open, setOpen, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const visiveis = filtrarOpcoes(filter, busca);
  return {
    busca,
    setBusca,
    setOpen,
    visiveis,
    gatilho: {
      triggerRef,
      icone: filter.icon,
      aberto: open,
      popup: "listbox" as const,
      onClick: () => {
        setBusca("");
        abrir();
      },
    },
    painel: {
      filter,
      aberto: open,
      rect,
      panelRef,
      busca,
      onBusca: setBusca,
      vazio: visiveis.length === 0,
    },
  };
}

export function SingleSelectControl({ filter, searchParams, setParams }: PropsControleFiltro) {
  const menu = useMenuOpcoes(filter);
  const value = searchParams.get(filter.key) ?? "";
  const selectedLabel = filter.options?.find((o) => o.value === value)?.label;

  function escolher(v: string | null) {
    setParams(comDependentes(filter, v));
    menu.setBusca("");
    menu.setOpen(false);
  }

  return (
    <div className="relative shrink-0">
      <GatilhoFiltro
        {...menu.gatilho}
        rotulo={value && selectedLabel ? `${filter.label}: ${selectedLabel}` : filter.label}
        valorCompacto={(value && selectedLabel) || (filter.placeholder ?? "Todos")}
        ativo={Boolean(value)}
        ariaLabel={filter.label}
      />
      <PainelOpcoes {...menu.painel}>
        {!menu.busca && (
          <SingleSelectItem
            checked={!value}
            label={filter.placeholder ?? "Todos"}
            onClick={() => escolher(null)}
          />
        )}
        {menu.visiveis.map((o) => (
          <SingleSelectItem
            key={o.value}
            checked={o.value === value}
            label={o.label}
            onClick={() => escolher(o.value)}
          />
        ))}
      </PainelOpcoes>
    </div>
  );
}

export function MultiSelectControl({ filter, searchParams, setParams }: PropsControleFiltro) {
  const menu = useMenuOpcoes(filter);
  const raw = searchParams.get(filter.key);
  const selected = raw ? raw.split(",").filter(Boolean) : [];
  const active = selected.length > 0;
  const rotulosEscolhidos = (filter.options ?? [])
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label);

  function toggle(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    setParams(comDependentes(filter, next.length ? next.join(",") : null));
  }

  return (
    <div className="relative shrink-0">
      <GatilhoFiltro
        {...menu.gatilho}
        rotulo={filter.label}
        valorCompacto={rotulosEscolhidos.join(", ") || (filter.placeholder ?? "Todos")}
        ariaLabel={
          active
            ? `${filter.label}: ${selected.length} ${selected.length === 1 ? "opção" : "opções"}`
            : filter.label
        }
        ativo={active}
        extra={
          active && (
            <span className="min-w-[16px] rounded-full bg-[var(--premium-ink)] px-[6px] text-center text-[11px] font-bold text-[var(--premium-paper)]">
              {selected.length}
            </span>
          )
        }
      />
      <PainelOpcoes {...menu.painel} multiselecionavel>
        {menu.visiveis.map((o) => {
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
      </PainelOpcoes>
    </div>
  );
}
