"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { navegarComTransicao } from "@/lib/view-transition";
import type { EscreverParams, TabConfig } from "@/components/ui/filter-bar-config";

/** A partir de quantas abas o painel da barra compacta as mostra em lista. */
const ABAS_EM_LISTA_A_PARTIR_DE = 4;

/** No painel da barra compacta, as abas vão em lista a partir de quatro. */
export function abasEmLista(viewTabs: readonly TabConfig[]): boolean {
  return viewTabs.length >= ABAS_EM_LISTA_A_PARTIR_DE;
}

/** Abas em lista no celular: caixa com borda, uma aba por linha. */
const LISTA_NO_CELULAR =
  "max-md:flex-col max-md:gap-0 max-md:overflow-hidden max-md:border max-md:border-[var(--premium-mist)] max-md:bg-[var(--premium-white)] max-md:p-0";

/** Uma aba da lista no celular: linha de 44px, a escolhida com a borda amarela à esquerda. */
const ITEM_DA_LISTA_NO_CELULAR =
  "max-md:min-h-11 max-md:rounded-none max-md:border-l-[3px] max-md:border-transparent max-md:px-3.5 max-md:text-left max-md:text-[var(--premium-ink)] max-md:not-first:border-t max-md:not-first:border-t-[var(--premium-bone)] max-md:aria-pressed:border-l-[var(--yellow)] max-md:aria-pressed:bg-[var(--premium-bone)]";

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
 *
 * `compacta` (a `FilterBar` passa no painel da barra compacta, premium-design
 * v0.28.0): no celular, o grupo ocupa a largura do painel, em controle
 * segmentado até três abas e em lista, uma por linha e com o visto na
 * escolhida, a partir de quatro. No computador, nada muda.
 */
export function ViewTabsPill({
  viewTabs,
  activeView,
  viewParam,
  setParams,
  compacta = false,
}: {
  viewTabs: TabConfig[];
  activeView: string | undefined;
  viewParam: string;
  setParams: EscreverParams;
  compacta?: boolean;
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

  const emLista = compacta && abasEmLista(viewTabs);

  return (
    <div
      ref={listRef}
      className={cn(
        "relative flex gap-1 rounded-[var(--r-md)] bg-[var(--premium-bone)] p-1",
        compacta && !emLista && "max-md:grid max-md:auto-cols-fr max-md:grid-flow-col",
        emLista && LISTA_NO_CELULAR,
      )}
    >
      {ind && (
        <span
          aria-hidden
          className={cn(
            "absolute top-1 bottom-1 rounded-[var(--r-sm)] bg-[var(--premium-white)] shadow-[var(--sh-sm)] transition-[left,width] duration-200 ease-[var(--ease)] motion-reduce:transition-none",
            emLista && "max-md:hidden",
          )}
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
              compacta && !emLista && "max-md:justify-center",
              emLista && ITEM_DA_LISTA_NO_CELULAR,
            )}
          >
            {emLista && (
              <Check
                size={16}
                aria-hidden
                className={cn("shrink-0 md:hidden", !active && "invisible")}
              />
            )}
            {Icon && <Icon size={15} />} {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  "text-[11px] text-[var(--premium-gray)]",
                  emLista && "max-md:ml-auto",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
