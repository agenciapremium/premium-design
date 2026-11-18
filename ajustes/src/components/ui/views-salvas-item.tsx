"use client";

import { Check, Link2, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewSalva } from "@/components/ui/filtros-persistencia";

/**
 * Uma view no menu: a linha aplica; o botão de reticências abre, ali mesmo, as
 * ações daquela view com o rótulo escrito.
 */
export function ItemView({
  view,
  ativa,
  expandida,
  indisponiveis,
  onExpandir,
  onAplicar,
  onPadrao,
  onRenomear,
  onCopiar,
  onExcluir,
}: {
  view: ViewSalva;
  ativa: boolean;
  expandida: boolean;
  indisponiveis: string[];
  onExpandir: () => void;
  onAplicar: () => void;
  onPadrao: () => void;
  onRenomear: () => void;
  onCopiar: () => void;
  onExcluir: () => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-[var(--r-sm)]",
          // View ativa: assinatura amarelo sobre tinta da marca (ui-guidelines §4).
          ativa && "bg-[var(--brand-ink)]",
        )}
      >
        <button
          type="button"
          role="menuitem"
          onClick={onAplicar}
          aria-current={ativa ? "true" : undefined}
          className={cn(
            "flex min-h-[40px] min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 text-left text-[13px] transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
            ativa
              ? "font-bold text-[var(--brand-on-ink)]"
              : "text-[var(--premium-ink)] hover:bg-[var(--premium-bone)]",
          )}
        >
          {ativa ? (
            <Check size={14} className="shrink-0 text-[var(--yellow)]" />
          ) : (
            <span aria-hidden className="w-[14px] shrink-0" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate">{view.nome}</span>
            {indisponiveis.length > 0 && (
              <span
                className={cn(
                  "block truncate text-[11px] font-normal",
                  ativa ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]",
                )}
              >
                Filtro indisponível: {indisponiveis.join(" · ")}
              </span>
            )}
          </span>
          {view.padrao && (
            <Star
              size={12}
              aria-hidden
              className={cn(
                "shrink-0",
                ativa ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]",
              )}
            />
          )}
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={onExpandir}
          aria-label={`Ações da view "${view.nome}"`}
          aria-expanded={expandida}
          className={cn(
            "flex min-h-[40px] min-w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-sm)] transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
            ativa
              ? "text-[var(--brand-on-ink)] hover:text-[var(--yellow)]"
              : "text-[var(--premium-gray)] hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)]",
          )}
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      {expandida && (
        <div role="group" aria-label={`Ações da view "${view.nome}"`} className="pb-1 pl-4">
          <AcaoDaView
            icon={Star}
            label={view.padrao ? "Deixar de ser a padrão" : "Definir como padrão"}
            onClick={onPadrao}
          />
          <AcaoDaView icon={Pencil} label="Renomear…" onClick={onRenomear} />
          <AcaoDaView icon={Link2} label="Copiar link" onClick={onCopiar} />
          <AcaoDaView icon={Trash2} label="Excluir" perigo onClick={onExcluir} />
        </div>
      )}
    </li>
  );
}

function AcaoDaView({
  icon: Icon,
  label,
  perigo,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  perigo?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 text-left text-[13px] transition-colors hover:bg-[var(--premium-bone)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
        perigo ? "text-[var(--danger)]" : "text-[var(--premium-ink)]",
      )}
    >
      <Icon size={14} className={perigo ? undefined : "text-[var(--premium-gray)]"} />
      {label}
    </button>
  );
}
