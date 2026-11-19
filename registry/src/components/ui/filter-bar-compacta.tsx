"use client";

import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { FunnelX, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import type { FilterConfig } from "@/components/ui/filter-bar-config";

/*
 * Barra compacta da `FilterBar` no celular (premium-design v0.28.0, decisão do
 * dono de 19/11/2026). Abaixo de 768px (`md`), a barra vira uma linha: o
 * resumo (a aba escolhida e o texto da tela), a busca em lupa e o botão de
 * filtros, com o número de filtros ativos. O botão desce um painel que empurra
 * a lista para baixo, com as abas em cima ("Visão") e os filtros embaixo.
 *
 * Cada controle é renderizado uma vez só: no computador, os invólucros do
 * painel ficam `display: contents` e os controles voltam à linha única de
 * sempre, na ordem filtros ► contexto ► abas ► favorito (`order`).
 */

/** Rótulo de grupo e de campo do painel: eyebrow 11px, como o rótulo do `Input`. */
export const ROTULO_DO_PAINEL =
  "text-[11px] font-bold tracking-[.05em] text-[var(--premium-gray)] uppercase";

/** Linha do celular: resumo, ações da tela, busca e o botão do painel. No computador, some. */
export const LINHA_COMPACTA = "group/linha flex min-h-11 items-center gap-2 md:contents";

/** Filtros que levam o rótulo acima do campo no painel (o gatilho mostra só o valor). */
export function rotuloAcimaNoPainel(filter: FilterConfig): boolean {
  return filter.type === "select" || filter.type === "multiselect" || filter.type === "faixa";
}

/** Resumo da linha compacta: a aba escolhida, em negrito, e o texto da tela. */
export function ResumoCompacto({ aba, resumo }: { aba?: string; resumo?: string }) {
  return (
    <p
      aria-live="polite"
      className="min-w-0 flex-1 truncate text-[13px] text-[var(--premium-gray)] group-has-[[data-busca-aberta]]/linha:hidden md:hidden"
    >
      {aba && <b className="font-bold text-[var(--premium-ink)]">{aba}</b>}
      {aba && resumo ? " · " : null}
      {resumo}
    </p>
  );
}

/**
 * Botão que abre e fecha o painel: ícone de filtros e o número de filtros
 * ativos. O mesmo botão ou `Esc` fecham.
 */
export function BotaoPainelCompacto({
  botaoRef,
  aberto,
  painelId,
  ativos,
  comAbas,
  onClick,
  aoFechar,
}: {
  botaoRef: RefObject<HTMLButtonElement | null>;
  aberto: boolean;
  painelId: string;
  ativos: number;
  comAbas: boolean;
  onClick: () => void;
  aoFechar: () => void;
}) {
  const nome = comAbas ? "Visão e filtros" : "Filtros";
  return (
    <button
      ref={botaoRef}
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !aberto) return;
        e.stopPropagation();
        aoFechar();
      }}
      aria-expanded={aberto}
      aria-controls={painelId}
      aria-label={
        ativos > 0 ? `${nome}, ${ativos} ${ativos === 1 ? "filtro ativo" : "filtros ativos"}` : nome
      }
      className={cn(
        "relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-md)] border transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none md:hidden",
        aberto
          ? "border-[var(--c-emphasis)] bg-[var(--c-emphasis)] text-[var(--c-on-emphasis)]"
          : ativos > 0
            ? "border-[var(--premium-ink)] bg-[var(--premium-white)] text-[var(--premium-ink)]"
            : "border-[var(--premium-mist)] bg-[var(--premium-white)] text-[var(--premium-steel)] hover:border-[var(--premium-ink)] hover:text-[var(--premium-ink)]",
      )}
    >
      <ListFilter size={18} aria-hidden />
      {ativos > 0 && (
        <span
          aria-hidden
          className="absolute -top-[7px] -right-[7px] flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--premium-paper)] bg-[var(--yellow)] px-[5px] text-[11px] leading-none font-bold text-[var(--brand-ink)]"
        >
          {ativos}
        </span>
      )}
    </button>
  );
}

/**
 * O painel que desce no celular: altura de 0 a auto em 200ms, empurrando o
 * conteúdo (não sobrepõe), sem animação com `prefers-reduced-motion`. Fechado,
 * fica `invisible`, fora do Tab e do leitor de tela. `Esc` dentro dele fecha e
 * devolve o foco ao botão (o `Esc` de um menu de filtro aberto fecha só o menu).
 * No computador, os três invólucros ficam `display: contents`.
 */
export function PainelCompacto({
  id,
  painelRef,
  aberto,
  aoFechar,
  rotuloFechar,
  children,
}: {
  id: string;
  painelRef: RefObject<HTMLDivElement | null>;
  aberto: boolean;
  aoFechar: () => void;
  rotuloFechar: string;
  children: ReactNode;
}) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Escape" || !aberto) return;
    const alvo = e.target;
    // Menus dos filtros vêm em portal: o evento do React chega aqui, o DOM não.
    if (!(alvo instanceof Element) || !e.currentTarget.contains(alvo)) return;
    if (alvo.closest('[aria-expanded="true"]')) return;
    e.stopPropagation();
    aoFechar();
  }

  return (
    <div
      id={id}
      ref={painelRef}
      onKeyDown={onKeyDown}
      className={cn(
        "grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-[var(--ease)] motion-reduce:transition-none md:visible md:contents",
        aberto ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden md:contents">
        <div className="mt-2.5 rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--premium-white)] shadow-[var(--sh-sm)] md:contents">
          {children}
          <div className="border-t border-[var(--premium-mist)] px-4 py-3 md:hidden">
            <Button type="button" variant="dark" size="sm" className="w-full" onClick={aoFechar}>
              {rotuloFechar}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * "Limpar filtros", um botão só: no computador, o redondo amarelo com o funil
 * no fim dos filtros; no celular, o texto "Limpar filtros" no cabeçalho do grupo
 * Filtros do painel.
 */
export function LimparFiltros({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip
      label="Limpar filtros"
      side="bottom"
      className="shrink-0 max-md:absolute max-md:top-1.5 max-md:right-2.5"
      bubbleClassName="max-md:hidden"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Limpar filtros"
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
          "md:h-9 md:w-9 md:rounded-full md:bg-[var(--yellow)] md:text-[var(--premium-black)] md:shadow-[var(--sh-gold)] md:hover:bg-[var(--gold)] md:active:bg-[var(--amber)]",
          "max-md:min-h-10 max-md:gap-1.5 max-md:rounded-[var(--r-sm)] max-md:px-1.5 max-md:text-[12.5px] max-md:font-medium max-md:text-[var(--premium-ink)] max-md:underline max-md:underline-offset-2",
        )}
      >
        <FunnelX size={16} strokeWidth={2.5} aria-hidden />
        <span aria-hidden className="md:hidden">
          Limpar filtros
        </span>
      </button>
    </Tooltip>
  );
}
