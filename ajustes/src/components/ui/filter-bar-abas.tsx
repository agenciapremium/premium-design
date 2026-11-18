"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { navegarComTransicao } from "@/lib/view-transition";
import type { EscreverParams, TabConfig } from "@/components/ui/filter-bar-config";

/**
 * Grupo de tabs de visão com pílula deslizante (CSS, medida por ref — sem
 * `layoutId`/`domMax`) e troca de conteúdo via View Transitions quando disponível
 * (change animacoes-graficos-abas-transicoes).
 *
 * A `FilterBar` renderiza um grupo (o `viewParam` da tela) no cluster da direita.
 * Exportado para telas que precisam de um **segundo** grupo de abas em outro
 * lugar do layout e em outro param — caso das abas "Todas/Para hoje/Atrasadas"
 * (`?aba=`) da visão Tabela de demandas, que ficam acima da tabela. Reusar este
 * componente (com `useSetParams`) mantém uma só implementação de estado de aba em
 * searchParam, com o mesmo visual e o mesmo reset de página.
 */
export function ViewTabsPill({
  viewTabs,
  activeView,
  viewParam,
  setParams,
}: {
  viewTabs: TabConfig[];
  activeView: string | undefined;
  viewParam: string;
  setParams: EscreverParams;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const btn = activeView ? btnRefs.current[activeView] : null;
    const list = listRef.current;
    if (!btn || !list) return;
    const atualizar = () => setInd({ left: btn.offsetLeft, width: btn.offsetWidth });
    atualizar();
    const ro = new ResizeObserver(atualizar);
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeView, viewTabs.length]);

  return (
    <div
      ref={listRef}
      className="relative flex gap-1 rounded-[var(--r-md)] bg-[var(--premium-bone)] p-1"
    >
      {ind && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-[var(--r-sm)] bg-[var(--premium-white)] shadow-[var(--sh-sm)] transition-[left,width] duration-200 ease-[var(--ease)] motion-reduce:transition-none"
          style={{ left: ind.left, width: ind.width }}
        />
      )}
      {viewTabs.map((tab) => {
        const active = tab.value === activeView;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              btnRefs.current[tab.value] = el;
            }}
            onClick={() => navegarComTransicao(() => setParams({ [viewParam]: tab.value }))}
            // Anuncia a opção ativa ao leitor de tela (change qg-cliente, spec
            // qg-cliente-lista): o destaque visual sozinho não basta.
            aria-pressed={active}
            className={cn(
              "relative z-[1] flex cursor-pointer items-center gap-[7px] rounded-[var(--r-sm)] px-4 py-2 text-[13px] font-medium transition-colors",
              active ? "font-bold text-[var(--premium-ink)]" : "text-[var(--premium-steel)]",
            )}
          >
            {Icon && <Icon size={15} />} {tab.label}
            {tab.count != null && (
              <span className="text-[11px] text-[var(--premium-gray)]">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
