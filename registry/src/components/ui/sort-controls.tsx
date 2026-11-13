"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { parseSort, serializeSort, nextSort, parseDir, nextDir, type SortState } from "@/lib/helpers/view-sort";

/**
 * Lê/escreve o param `sort` na URL preservando os demais parâmetros. Usa
 * `router.replace` (sem poluir o histórico) e `scroll: false`, no mesmo padrão
 * da FilterBar. Compartilhado pelo toggle do kanban e pelos headers da tabela.
 */
export function useViewSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = parseSort(searchParams.get("sort"));

  function setSort(next: SortState | null) {
    const params = new URLSearchParams(searchParams.toString());
    // Mudar a ordenação reseta a paginação para a página 1 (paginacao-tabelas).
    params.delete("pagina");
    const serialized = serializeSort(next);
    if (serialized) params.set("sort", serialized);
    else params.delete("sort");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return { sort, setSort };
}

function dirLabel(dir: SortState["dir"]) {
  return dir === "asc" ? "crescente" : "decrescente";
}

/**
 * Toggle de ordenação no header de uma coluna do kanban (apenas ícone). O campo
 * é fixo por kanban, então o estado da coluna guarda só a direção, num param
 * próprio (`paramKey`). Cicla natural → ↑ → ↓ → natural e ordena só a coluna.
 */
export function ColumnSortToggle({ paramKey, title }: { paramKey: string; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dir = parseDir(searchParams.get(paramKey));

  function click() {
    const next = nextDir(dir);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(paramKey, next);
    else params.delete(paramKey);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const Icon = dir ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  const label = dir
    ? `Ordenar por ${title.toLowerCase()}, ${dirLabel(dir)}`
    : `Ordenar por ${title.toLowerCase()}`;

  return (
    <Tooltip label={label} side="bottom" className="shrink-0">
      <button
        type="button"
        onClick={click}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center h-6 w-6 rounded-full border cursor-pointer transition-colors duration-150 shrink-0",
          dir
            ? "bg-[var(--brand-ink)] border-[var(--premium-ink)]"
            : "bg-[var(--premium-white)] border-[var(--premium-mist)] hover:border-[var(--premium-steel)]",
        )}
      >
        <Icon size={12} className={dir ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]"} />
      </button>
    </Tooltip>
  );
}

/**
 * Cabeçalho de coluna clicável (idioma nativo da tabela). Clicar alterna a
 * direção e atualiza o mesmo param `sort`, exibindo ▲/▼ no header ativo.
 */
export function SortableTh({
  field,
  label,
  className,
  dica,
}: {
  field: string;
  label: string;
  className?: string;
  /** Dica explicativa da coluna (ex.: definição da métrica nos Relatórios). */
  dica?: string;
}) {
  const { sort, setSort } = useViewSort();
  const active = sort?.field === field ? sort : null;
  const Icon = active ? (active.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  const gatilho = (
    <button
      type="button"
      onClick={() => setSort(nextSort(sort, field))}
      aria-label={`Ordenar por ${label.toLowerCase()}`}
      className="inline-flex items-center gap-[5px] uppercase tracking-wider cursor-pointer hover:text-[var(--premium-ink)] transition-colors"
    >
      {label}
      <Icon size={12} className={active ? "text-[var(--premium-ink)]" : "text-[var(--premium-silver)]"} />
    </button>
  );

  return (
    <th
      className={cn(
        "text-left text-[10.5px] uppercase tracking-wider text-[var(--premium-gray)] font-bold px-4 py-3 border-b border-[var(--premium-mist)] bg-[var(--premium-paper)]",
        className,
      )}
      aria-sort={active ? (active.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      {/* A dica envolve o botão, e não o <th>: dentro de <tr> só cabem células,
          então o wrapper do balão desce um nível. O balão abre para baixo, sobre
          as primeiras linhas, porque acima do cabeçalho não há espaço. */}
      {dica ? (
        <Tooltip label={dica} side="bottom">
          {gatilho}
        </Tooltip>
      ) : (
        gatilho
      )}
    </th>
  );
}
