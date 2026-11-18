"use client";

import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { FunnelX } from "lucide-react";
import { cn } from "@/lib/utils";
import { chavesNaUrl, limpezaDosFiltros, mostrarLimparFiltros } from "@/lib/helpers/filtros-ativos";
import { Tooltip } from "@/components/ui/tooltip";
import { useSetParams } from "@/lib/hooks/use-set-params";
import { useFiltrosPersistidos } from "@/lib/hooks/use-filtros-persistidos";
import { ViewsSalvasMenu } from "@/components/ui/views-salvas-menu";
import { useFiltrosPersistencia } from "@/components/ui/filtros-persistencia";
import type { FiltroConhecido } from "@/lib/helpers/views-salvas";
import type { FilterConfig, TabConfig } from "@/components/ui/filter-bar-config";
import { FilterControl } from "@/components/ui/filter-bar-controle";
import { ViewTabsPill } from "@/components/ui/filter-bar-abas";

export type {
  FilterConfig,
  FilterOption,
  FilterType,
  TabConfig,
} from "@/components/ui/filter-bar-config";
export { ViewTabsPill } from "@/components/ui/filter-bar-abas";

interface FilterBarProps {
  filters?: FilterConfig[];
  viewTabs?: TabConfig[];
  /** Nome do parâmetro de URL que guarda a visualização ativa. */
  viewParam?: string;
  /** Visualização usada quando a URL não traz `viewParam`. */
  defaultView?: string;
  /** Botões de contexto da tela (ex.: "Calendário editorial", "Gerar link"). Primeiro no cluster da direita. */
  contextActions?: ReactNode;
  /** Estrela de favorito — sempre por último à direita. */
  favorito?: ReactNode;
  /** @deprecated Use `contextActions`. Mantido como alias legado. */
  actions?: ReactNode;
  /**
   * Quando informado, ativa a persistência por usuário dos filtros desta tela
   * (capability persistencia-filtros-usuario): restaura o último filtro salvo na
   * abertura (se a URL não trouxer filtros) e salva alterações de forma
   * debounced. Sem `telaKey`, o comportamento permanece o atual. A leitura e a
   * gravação vêm do `FiltrosPersistenciaProvider`; sem ele, `telaKey` não grava
   * nada e o menu de views salvas não aparece.
   */
  telaKey?: string;
  /**
   * Opt-out da busca colapsável (padrão global = lupa que expande). Quando `true`, o
   * campo de busca fica sempre aberto (comportamento anterior).
   */
  buscaSempreAberta?: boolean;
  /**
   * Opt-out da linha única (padrão global = filtros e visões na mesma linha, com
   * rolagem horizontal dos filtros). Quando `true`, os filtros voltam a quebrar em
   * várias linhas (`flex-wrap`).
   */
  permitirQuebra?: boolean;
  /**
   * A tela recorta no navegador o que já carregou e o servidor não lê os filtros
   * (ex.: calendário do time). Com `true`, a barra escreve a URL pela History API
   * nativa (`history.replaceState`/`pushState`), que o Next sincroniza com
   * `useSearchParams` sem pedir a página de novo ao servidor. Vale para a
   * mudança de filtro, a restauração do filtro salvo e a aplicação de view.
   * Padrão: `router.replace`, como nas telas que filtram no servidor.
   */
  recorteLocal?: boolean;
  /**
   * Parâmetros que dizem onde a tela está, e não o recorte (ex.: `ano`, `mes` e
   * `dia` do calendário do time). Ficam fora das views salvas, não impedem a view
   * de aparecer como ativa e são mantidos ao aplicar uma view.
   */
  paramsDeNavegacao?: string[];
}

// Classes de chip, menu e item de seleção: fonte única em `pilula.tsx`
// (padrão "Pílula de ação e de seleção", premium-design v0.10.0).
// A escrita na URL (com o reset de página) é o `useSetParams` de
// `@/lib/hooks/use-set-params` (change catalogo-componentes-premium-design, D7).

export function FilterBar({
  filters = [],
  viewTabs = [],
  viewParam = "view",
  defaultView,
  contextActions,
  favorito,
  actions,
  telaKey,
  buscaSempreAberta = false,
  permitirQuebra = false,
  recorteLocal = false,
  paramsDeNavegacao,
}: FilterBarProps) {
  // `actions` é alias legado de `contextActions` (zona de botões de contexto).
  const contexto = contextActions ?? actions;
  const searchParams = useSearchParams();

  const activeView = searchParams.get(viewParam) ?? defaultView ?? viewTabs[0]?.value;

  // Chaves de URL que contam como filtro (daterange e faixa expandem em
  // De/Ate; a busca com `aoBuscar` fica de fora). Base tanto da restauração
  // quanto do salvamento persistido. Regra pura em `filtros-ativos.ts`.
  const filterKeys = useMemo(() => chavesNaUrl(filters), [filters]);

  // Limpadores das buscas fora da URL (`aoBuscar`), chamados pelo "Limpar
  // filtros" junto com a limpeza da URL (change
  // catalogo-filterbar-faixa-busca-correcoes, D2).
  const limpadoresLocais = useRef(new Map<string, () => void>());
  const registrarLimpador = useCallback((key: string, limpar: () => void) => {
    const mapa = limpadoresLocais.current;
    mapa.set(key, limpar);
    return () => {
      if (mapa.get(key) === limpar) mapa.delete(key);
    };
  }, []);

  const { limpar: limparPersistido } = useFiltrosPersistidos({
    telaKey,
    filterKeys,
    local: recorteLocal,
  });

  // Views salvas só com tela identificada E persistência declarada: sem o
  // `FiltrosPersistenciaProvider`, a barra filtra pela URL e não mostra o menu
  // (change catalogo-componentes-premium-design, D6).
  const persistencia = useFiltrosPersistencia();
  const mostrarViews = telaKey != null && persistencia !== null;

  // Opções que a tela oferece HOJE, no formato mínimo de que o menu de views
  // precisa para avisar "filtro indisponível" quando uma view guarda um projeto
  // que foi excluído (capability views-salvas). Só filtros com lista fechada
  // entram: busca, data e toggle não têm opção para desaparecer.
  const filtrosConhecidos = useMemo<FiltroConhecido[]>(
    () =>
      filters
        .filter((f) => (f.type === "select" || f.type === "multiselect") && f.options?.length)
        .map((f) => ({
          key: f.key,
          label: f.label,
          multiplo: f.type === "multiselect",
          valores: (f.options ?? []).map((o) => o.value),
        })),
    [filters],
  );

  const setParams = useSetParams({ local: recorteLocal });

  // "Limpar filtros" só quando limpa mais do que a busca, que já tem o próprio
  // `X` (change busca-um-x-por-campo, D3). Regra pura em `filtros-ativos.ts`.
  const mostrarLimpar = mostrarLimparFiltros(filters, (k) => searchParams.get(k));

  function clearAll() {
    setParams(limpezaDosFiltros(filters));
    for (const limpar of limpadoresLocais.current.values()) limpar();
    // Limpar filtros também apaga o estado persistido da tela, para que a
    // próxima abertura não restaure o filtro anterior.
    limparPersistido();
  }

  return (
    <div
      className={cn("mb-5 flex items-center justify-between gap-3", permitirQuebra && "flex-wrap")}
    >
      {/* Filtros — esquerda. Padrão: linha única com rolagem horizontal (os dropdowns
          são portados, então não são cortados). Opt-out `permitirQuebra` → flex-wrap. */}
      <div
        className={cn(
          "flex items-center gap-[10px]",
          permitirQuebra
            ? "flex-wrap"
            : "min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {filters.map((filter) => (
          <FilterControl
            key={filter.key}
            filter={filter}
            searchParams={searchParams}
            setParams={setParams}
            buscaColapsavel={!buscaSempreAberta}
            registrarLimpador={registrarLimpador}
          />
        ))}
        {/* Ícone de funil com x, não `X`: o `X` fica reservado ao limpar de um
            campo, e o funil diz "filtros" (change busca-um-x-por-campo, D3). */}
        {mostrarLimpar && (
          <Tooltip label="Limpar filtros" side="bottom">
            <button
              onClick={clearAll}
              aria-label="Limpar filtros"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--yellow)] text-[var(--premium-black)] shadow-[var(--sh-gold)] transition-colors hover:bg-[var(--gold)] active:bg-[var(--amber)]"
            >
              <FunnelX size={16} strokeWidth={2.5} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Cluster da direita — ordem fixa: contexto → views → favorito. O menu de
          views salvas abre a zona de contexto (capability views-salvas): fica
          antes dos botões da tela, que continuam encostados nas abas. */}
      {(contexto != null || mostrarViews || viewTabs.length > 0 || favorito != null) && (
        <div className={cn("flex shrink-0 items-center gap-3", permitirQuebra && "flex-wrap")}>
          {mostrarViews && telaKey && (
            <ViewsSalvasMenu
              telaKey={telaKey}
              filtros={filtrosConhecidos}
              paramsDeNavegacao={paramsDeNavegacao}
              local={recorteLocal}
            />
          )}
          {contexto}
          {viewTabs.length > 0 && (
            <ViewTabsPill
              viewTabs={viewTabs}
              activeView={activeView}
              viewParam={viewParam}
              setParams={setParams}
            />
          )}
          {favorito}
        </div>
      )}
    </div>
  );
}
