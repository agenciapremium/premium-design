"use client";

import { Fragment, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { KANBAN_LOTE_INICIAL, KANBAN_LOTE_INCREMENTO } from "@/lib/constants";
import { useInfiniteWindow } from "@/lib/hooks/use-infinite-window";

/**
 * Renderiza os cartões de uma coluna de Kanban com carregamento incremental
 * (capability `kanban-scroll-infinito`): mostra os primeiros `KANBAN_LOTE_INICIAL`
 * e carrega mais `KANBAN_LOTE_INCREMENTO` conforme a sentinela do fim entra na área
 * visível. Deve ser montado DENTRO do container rolável da coluna. Não renderiza o
 * estado vazio — cada tela mantém o seu (o badge de total também continua na tela,
 * refletindo `items.length`). O DnD segue operando sobre o array completo do pai.
 */
export function ColunaInfinita<T>({
  items,
  getKey,
  renderItem,
  resetKey,
}: {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Reinicia a janela ao mudar (filtro/ordenação/modo). */
  resetKey?: string;
}) {
  const { visiveis, sentinelaRef, temMais } = useInfiniteWindow(
    items.length,
    KANBAN_LOTE_INCREMENTO,
    KANBAN_LOTE_INICIAL,
    resetKey
  );

  return (
    <>
      {items.slice(0, visiveis).map((item, i) => (
        <Fragment key={getKey(item, i)}>{renderItem(item, i)}</Fragment>
      ))}
      {temMais && (
        <div ref={sentinelaRef}>
          <CarregandoMais />
        </div>
      )}
    </>
  );
}

/** Indicador leve "Carregando mais…" (tokens semânticos, dark mode). */
function CarregandoMais() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-2 text-[13px] text-[var(--premium-gray)]"
    >
      <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden />
      Carregando mais…
    </div>
  );
}
