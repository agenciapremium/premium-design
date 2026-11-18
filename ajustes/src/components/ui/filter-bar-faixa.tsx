"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  chavesDaFaixa,
  escritaDaFaixa,
  normalizarFaixa,
  rotuloFaixa,
  type LimitesFaixa,
} from "@/lib/helpers/filtros-ativos";
import { motionPreset } from "@/lib/motion";
import { popoverPos } from "@/lib/popover-pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  chipActive,
  chipBase,
  chipIdle,
  dropdownPanelClass,
  useDropdownPortal,
} from "@/components/ui/pilula";
import type { EscreverParams, FilterConfig, ParamsDaUrl } from "@/components/ui/filter-bar-config";

/** Limites da `faixa`, obrigatórios em tempo de execução (D1). */
function limitesDaFaixa(filter: FilterConfig): LimitesFaixa {
  const { min, max } = filter;
  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max
  ) {
    throw new Error(
      `FilterBar: o filtro "${filter.key}" é do tipo "faixa" e precisa de min e max numéricos, com min <= max.`,
    );
  }
  return { min, max };
}

const textoDe = (n: number | null) => (n === null ? "" : String(n));

// Filtro de faixa numérica, "de" e "até" (change
// catalogo-filterbar-faixa-busca-correcoes, D1): pílula com o rótulo resumido
// e o painel em portal dos selects, com dois campos numéricos. Grava
// `<key>De`/`<key>Ate` ao confirmar (Enter ou Aplicar), ao sair dos campos ou
// ao fechar o painel pelo clique fora, nunca a cada tecla; `Esc` descarta.
export function FaixaFilterControl({
  filter,
  searchParams,
  setParams,
}: {
  filter: FilterConfig;
  searchParams: ParamsDaUrl;
  setParams: EscreverParams;
}) {
  const { open, setOpen, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const id = useId();
  const Icon = filter.icon;
  const limites = limitesDaFaixa(filter);
  const passo = filter.passo ?? 1;
  const [chaveDe, chaveAte] = chavesDaFaixa(filter);
  const urlDe = searchParams.get(chaveDe);
  const urlAte = searchParams.get(chaveAte);
  const atual = normalizarFaixa(urlDe, urlAte, limites);
  const active = atual.de !== null || atual.ate !== null;
  const rotulo = rotuloFaixa(filter.label, atual);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  // Edição ainda não gravada; `null` quando não há nada pendente.
  const pendente = useRef<{ de: string; ate: string } | null>(null);

  /** Grava na URL, só quando muda algo. */
  function escrever(novoDe: string, novoAte: string) {
    pendente.current = null;
    const escrita = escritaDaFaixa(filter, novoDe, novoAte, limites);
    if (escrita[chaveDe] !== (urlDe || null) || escrita[chaveAte] !== (urlAte || null))
      setParams(escrita);
  }

  /** Grava e mostra nos campos o valor normalizado (limitado e ordenado). */
  function aplicar(novoDe: string, novoAte: string) {
    const v = normalizarFaixa(novoDe, novoAte, limites);
    setDe(textoDe(v.de));
    setAte(textoDe(v.ate));
    escrever(novoDe, novoAte);
  }

  // Fechou pelo clique fora com edição pendente: grava, como ao sair do campo.
  const escreverRef = useRef(escrever);
  useEffect(() => {
    escreverRef.current = escrever;
  });
  useEffect(() => {
    if (!open && pendente.current) escreverRef.current(pendente.current.de, pendente.current.ate);
  }, [open]);

  function abrirPainel() {
    setDe(textoDe(atual.de));
    setAte(textoDe(atual.ate));
    pendente.current = null;
    abrir();
  }

  function fechar() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      aplicar(de, ate);
      fechar();
    } else if (e.key === "Escape") {
      // O `useDropdownPortal` fecha o painel; a edição é descartada.
      pendente.current = null;
      triggerRef.current?.focus();
    }
  }

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    // Ir de um campo ao outro, ou aos botões do painel, não grava.
    if (panelRef.current?.contains(e.relatedTarget as Node | null)) return;
    if (pendente.current) aplicar(de, ate);
  }

  function mudarDe(v: string) {
    setDe(v);
    pendente.current = { de: v, ate };
  }

  function mudarAte(v: string) {
    setAte(v);
    pendente.current = { de, ate: v };
  }

  // O que os dois campos têm em comum: número com os limites e o passo, e as
  // mesmas teclas e a mesma saída.
  const propsCampo = {
    type: "number",
    inputMode: Number.isInteger(passo) && Number.isInteger(limites.min) ? "numeric" : "decimal",
    min: limites.min,
    max: limites.max,
    step: passo,
    onKeyDown,
    onBlur,
    className: "min-h-10",
  } as const;

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : abrirPainel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          chipBase,
          active ? chipActive : chipIdle,
          "focus-visible:shadow-[0_0_0_2px_var(--yellow-50),0_0_0_3px_var(--premium-ink)] focus-visible:outline-none",
        )}
      >
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span>{rotulo}</span>
        <ChevronDown size={14} className="-mr-1 text-[var(--premium-gray)]" />
      </button>
      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            role="dialog"
            aria-label={filter.label}
            style={popoverPos(rect, Math.max(rect.width, 260), 200)}
            className={cn(dropdownPanelClass, "p-3")}
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                {...propsCampo}
                id={`${id}-de`}
                label="De"
                aria-label={`${filter.label}: de`}
                value={de}
                onChange={(e) => mudarDe(e.target.value)}
                placeholder={String(limites.min)}
                autoFocus
              />
              <Input
                {...propsCampo}
                id={`${id}-ate`}
                label="Até"
                aria-label={`${filter.label}: até`}
                value={ate}
                onChange={(e) => mudarAte(e.target.value)}
                placeholder={String(limites.max)}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              {(active || de || ate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-10"
                  onClick={() => {
                    aplicar("", "");
                    fechar();
                  }}
                >
                  Limpar
                </Button>
              )}
              <Button
                variant="dark"
                size="sm"
                className="min-h-10"
                onClick={() => {
                  aplicar(de, ate);
                  fechar();
                }}
              >
                Aplicar
              </Button>
            </div>
          </m.div>,
          document.body,
        )}
    </div>
  );
}
