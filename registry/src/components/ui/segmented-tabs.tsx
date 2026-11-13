"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { navegarComTransicao } from "@/lib/view-transition";
import { cn } from "@/lib/utils";

export interface SegmentedTab {
  value: string;
  label: string;
  /** Elemento já renderizado (ex.: `<Radar size={15} />`) — precisa ser
   * serializável para atravessar a fronteira server → client. */
  icon?: ReactNode;
  /** Selo opcional após o label (ex.: `<Badge>` de contagem — change entregas-risco-configuracao). */
  badge?: ReactNode;
}

/**
 * Tabs segmentadas standalone (change financeiro-polish-dashboard-filtros,
 * design D1): mesmo visual das tabs do FilterBar (§4.2), sincronizadas a um
 * parâmetro de URL — para quando as abas precisam viver fora da barra de
 * filtros (ex.: ao lado da busca em Lançamentos). O FilterBar segue intocado.
 *
 * Animações (change animacoes-graficos-abas-transicoes): a pílula ativa DESLIZA
 * (indicador CSS medido por ref — sem `layoutId`/`domMax`) e a troca de conteúdo
 * (navegação server) passa por `navegarComTransicao` (View Transitions, se houver).
 */
export function SegmentedTabs({ tabs, param, defaultValue, clearParams = [] }: {
  tabs: SegmentedTab[];
  param: string;
  defaultValue?: string;
  /** Parâmetros zerados ao trocar de aba (ex.: paginação). */
  clearParams?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ativo = searchParams.get(param) ?? defaultValue ?? tabs[0]?.value;

  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);

  // Mede a posição/largura do botão ativo para o indicador deslizante; recalcula
  // ao trocar de aba e ao redimensionar (fontes/quebra de linha mudam a medida).
  useEffect(() => {
    const btn = ativo ? btnRefs.current[ativo] : null;
    const list = listRef.current;
    if (!btn || !list) return;
    const atualizar = () => setInd({ left: btn.offsetLeft, width: btn.offsetWidth });
    atualizar();
    const ro = new ResizeObserver(atualizar);
    ro.observe(list);
    return () => ro.disconnect();
  }, [ativo, tabs.length]);

  function trocar(value: string) {
    navegarComTransicao(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(param, value);
      for (const k of clearParams) params.delete(k);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div ref={listRef} className="relative flex gap-1 bg-[var(--premium-bone)] p-1 rounded-[var(--r-md)]" role="tablist">
      {ind && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-[var(--r-sm)] bg-[var(--premium-white)] shadow-[var(--sh-sm)] transition-[left,width] duration-200 ease-[var(--ease)] motion-reduce:transition-none"
          style={{ left: ind.left, width: ind.width }}
        />
      )}
      {tabs.map((tab) => {
        const active = tab.value === ativo;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              btnRefs.current[tab.value] = el;
            }}
            role="tab"
            aria-selected={active}
            onClick={() => trocar(tab.value)}
            className={cn(
              "relative z-[1] px-4 py-2 rounded-[var(--r-sm)] text-[13px] font-medium flex items-center gap-[7px] cursor-pointer transition-colors whitespace-nowrap",
              active ? "text-[var(--premium-ink)] font-bold" : "text-[var(--premium-steel)]"
            )}
          >
            {tab.icon} {tab.label}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}
