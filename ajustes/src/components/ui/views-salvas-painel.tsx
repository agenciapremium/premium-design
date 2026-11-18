"use client";

import type { RefObject } from "react";
import { m } from "motion/react";
import { Bookmark } from "lucide-react";
import { motionPreset } from "@/lib/motion";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  filtrosIndisponiveis,
  VIEW_NOME_MAX,
  type FiltroConhecido,
} from "@/lib/helpers/views-salvas";
import type { ViewSalva } from "@/components/ui/filtros-persistencia";
import { ItemView } from "@/components/ui/views-salvas-item";

/**
 * Painel do menu de views salvas: a lista (ou o texto de quando não há
 * nenhuma), as ações de cada view e o "Salvar view atual…".
 */
export function PainelViews({
  menuRef,
  views,
  ativaId,
  expandida,
  filtros,
  onExpandir,
  onAplicar,
  onPadrao,
  onRenomear,
  onCopiar,
  onExcluir,
  onSalvar,
}: {
  menuRef: RefObject<HTMLDivElement | null>;
  views: ViewSalva[];
  ativaId: string | undefined;
  /** View com as ações abertas, ou `null`. */
  expandida: string | null;
  filtros: FiltroConhecido[];
  onExpandir: (id: string) => void;
  onAplicar: (view: ViewSalva) => void;
  onPadrao: (view: ViewSalva) => void;
  onRenomear: (view: ViewSalva) => void;
  onCopiar: (view: ViewSalva) => void;
  onExcluir: (view: ViewSalva) => void;
  onSalvar: () => void;
}) {
  return (
    <m.div
      {...motionPreset("menu")}
      ref={menuRef}
      role="menu"
      aria-label="Views salvas"
      className="absolute top-full right-0 z-[60] mt-1 w-[300px] max-w-[calc(100vw-2rem)] rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--premium-paper)] p-1 shadow-[var(--sh-md)]"
    >
      {views.length === 0 ? (
        <p className="px-2 py-3 text-[12.5px] leading-[1.5] text-[var(--premium-steel)]">
          Nenhuma view salva nesta tela. Guarde o recorte atual (filtros, visão e ordenação) com um
          nome para voltar a ele com um clique.
        </p>
      ) : (
        <ul className="max-h-[320px] overflow-y-auto">
          {views.map((view) => (
            <ItemView
              key={view.id}
              view={view}
              ativa={ativaId === view.id}
              expandida={expandida === view.id}
              indisponiveis={filtrosIndisponiveis(view.query, filtros)}
              onExpandir={() => onExpandir(view.id)}
              onAplicar={() => onAplicar(view)}
              onPadrao={() => onPadrao(view)}
              onRenomear={() => onRenomear(view)}
              onCopiar={() => onCopiar(view)}
              onExcluir={() => onExcluir(view)}
            />
          ))}
        </ul>
      )}

      <div className="mt-1 border-t border-[var(--premium-mist)] pt-1">
        <button
          type="button"
          role="menuitem"
          onClick={onSalvar}
          className="flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 text-left text-[13px] font-medium text-[var(--premium-ink)] transition-colors hover:bg-[var(--premium-bone)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none"
        >
          <Bookmark size={14} className="text-[var(--premium-gray)]" />
          Salvar view atual…
        </button>
        <p className="px-2 pt-[2px] pb-1 text-[11px] leading-[1.5] text-[var(--premium-gray)]">
          A view padrão abre a tela; sem ela, a tela abre como você deixou.
        </p>
      </div>
    </m.div>
  );
}

/** Diálogo de nomear (salvar) ou renomear uma view (coleta rápida, design D3). */
export function DialogoNomeView({
  modo,
  nome,
  onNome,
  duplicado,
  salvando,
  erro,
  onClose,
  onConfirm,
}: {
  /** `null` com o diálogo fechado. */
  modo: "salvar" | "renomear" | null;
  nome: string;
  onNome: (nome: string) => void;
  duplicado: boolean;
  salvando: boolean;
  erro: string | undefined;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={modo !== null}
      onClose={onClose}
      onConfirm={onConfirm}
      title={modo === "renomear" ? "Renomear view" : "Salvar view atual"}
      message={
        modo === "renomear"
          ? "Escolha um novo nome para esta view."
          : "Guarde o recorte atual (filtros, visão e ordenação) com um nome."
      }
      confirmLabel={modo === "renomear" ? "Renomear" : "Salvar"}
      variant="primary"
      tone="neutral"
      loading={salvando}
      error={erro}
      autoFocusConfirm={false}
      confirmDisabled={nome.trim().length === 0 || duplicado}
    >
      <Input
        label="Nome da view"
        value={nome}
        onChange={(e) => onNome(e.target.value)}
        maxLength={VIEW_NOME_MAX}
        placeholder="Atrasadas do mês"
        autoFocus
        error={duplicado ? "Já existe uma view com esse nome nesta tela." : undefined}
      />
    </ConfirmDialog>
  );
}
