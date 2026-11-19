"use client";

import type { AriaRole, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionPreset } from "@/lib/motion";
import { popoverPos } from "@/lib/popover-pos";
import { chipActive, chipBase, chipIdle, dropdownPanelClass } from "@/components/ui/pilula";

/*
 * Gatilho e painel dos filtros com menu da `FilterBar` (seleção única, seleção
 * múltipla e faixa): a pílula com ícone, rótulo e chevron, e o painel em portal
 * ancorado nela pelo `useDropdownPortal`.
 */

/** Classes do gatilho no painel da barra compacta (celular): campo de 44px na largura toda. */
const GATILHO_NO_PAINEL =
  "max-md:h-11 max-md:w-full max-md:rounded-[var(--r-md)] max-md:bg-[var(--premium-white)]";

/**
 * Pílula que abre o menu de um filtro. `extra` entra entre o rótulo e o chevron.
 *
 * No celular, o gatilho fica no painel da barra compacta, com o rótulo do filtro
 * acima dele: ocupa a largura toda e mostra só o valor (`valorCompacto`). Quem
 * passa `valorCompacto` passa também `ariaLabel`, para o nome acessível não
 * depender de qual dos dois textos está à vista.
 */
export function GatilhoFiltro({
  triggerRef,
  icone: Icon,
  rotulo,
  valorCompacto,
  ativo,
  aberto,
  popup,
  onClick,
  ariaLabel,
  type,
  className,
  extra,
}: {
  triggerRef: RefObject<HTMLButtonElement | null>;
  icone?: LucideIcon;
  rotulo: string;
  valorCompacto?: string;
  ativo: boolean;
  aberto: boolean;
  popup: "listbox" | "dialog";
  onClick: () => void;
  ariaLabel?: string;
  type?: "button";
  className?: string;
  extra?: ReactNode;
}) {
  return (
    <button
      ref={triggerRef}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-haspopup={popup}
      aria-expanded={aberto}
      className={cn(chipBase, ativo ? chipActive : chipIdle, GATILHO_NO_PAINEL, className)}
    >
      {Icon && <Icon size={14} className="shrink-0 text-[var(--premium-gray)]" />}
      {valorCompacto === undefined ? (
        <span className="max-md:min-w-0 max-md:flex-1 max-md:truncate max-md:text-left">
          {rotulo}
        </span>
      ) : (
        <>
          <span className="max-md:hidden">{rotulo}</span>
          <span className="min-w-0 flex-1 truncate text-left md:hidden">{valorCompacto}</span>
        </>
      )}
      {extra}
      <ChevronDown size={14} className="-mr-1 shrink-0 text-[var(--premium-gray)]" />
    </button>
  );
}

/** Painel do menu em portal, com a largura mínima e a altura estimada para a posição. */
export function PainelFiltro({
  aberto,
  rect,
  panelRef,
  role,
  rotulo,
  largura,
  altura,
  multiselecionavel,
  className,
  children,
}: {
  aberto: boolean;
  rect: DOMRect | null;
  panelRef: RefObject<HTMLDivElement | null>;
  role: AriaRole;
  rotulo: string;
  largura: number;
  altura: number;
  multiselecionavel?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!aberto || !rect || typeof document === "undefined") return null;
  return createPortal(
    <m.div
      ref={panelRef}
      {...motionPreset("menu")}
      role={role}
      aria-label={rotulo}
      aria-multiselectable={multiselecionavel}
      style={popoverPos(rect, Math.max(rect.width, largura), altura)}
      className={cn(dropdownPanelClass, className)}
    >
      {children}
    </m.div>,
    document.body,
  );
}
