"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { chavesNaUrl, contarFiltrosAtivos, limpezaDosFiltros } from "@/lib/helpers/filtros-ativos";
import { useSetParams } from "@/lib/hooks/use-set-params";
import { useFiltrosPersistidos } from "@/lib/hooks/use-filtros-persistidos";
import { ViewsSalvasMenu } from "@/components/ui/views-salvas-menu";
import { useFiltrosPersistencia } from "@/components/ui/filtros-persistencia";
import type { FiltroConhecido } from "@/lib/helpers/views-salvas";
import type { FilterConfig, TabConfig } from "@/components/ui/filter-bar-config";
import { FilterControl } from "@/components/ui/filter-bar-controle";
import { ViewTabsPill } from "@/components/ui/filter-bar-abas";
import {
  BotaoPainelCompacto,
  LimparFiltros,
  LINHA_COMPACTA,
  PainelCompacto,
  ResumoCompacto,
  ROTULO_DO_PAINEL,
  rotuloAcimaNoPainel,
} from "@/components/ui/filter-bar-compacta";

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
   * campo de busca fica sempre aberto no computador (768px ou mais). No celular, a
   * busca é sempre a lupa da barra compacta, que abre o campo na linha com um `X`
   * que limpa e fecha (v0.28.1).
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
  /**
   * Barra compacta do celular: texto da linha, depois da aba escolhida (ex.:
   * "4 contas" ou "2 de 4 contas"). A barra não conhece a lista; a tela conta.
   */
  resumoCelular?: string;
  /**
   * Botão que fecha o painel de filtros do celular (ex.: "Ver 2 contas").
   * Padrão: "Fechar".
   */
  rotuloFecharPainel?: string;
}

/** Rolagem horizontal dos filtros no computador, com a barra de rolagem escondida. */
const ROLAGEM_NO_COMPUTADOR =
  "md:min-w-0 md:flex-1 md:overflow-x-auto md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden";

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
  resumoCelular,
  rotuloFecharPainel = "Fechar",
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
  // `X` (change busca-um-x-por-campo, D3); o mesmo número vai no botão de
  // filtros do celular. Regra pura em `filtros-ativos.ts`.
  const ativos = contarFiltrosAtivos(filters, (k) => searchParams.get(k));

  // Barra compacta do celular: a busca fica na linha; os outros filtros e as
  // abas, no painel que desce.
  const [painelAberto, setPainelAberto] = useState(false);
  const painelId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoPainelRef = useRef<HTMLButtonElement>(null);
  const buscas = filters.filter((f) => f.type === "search");
  const filtrosDoPainel = filters.filter((f) => f.type !== "search");
  const temPainel = filtrosDoPainel.length > 0 || viewTabs.length > 0;

  function fecharPainel() {
    setPainelAberto(false);
    botaoPainelRef.current?.focus();
  }

  function clearAll() {
    setParams(limpezaDosFiltros(filters));
    for (const limpar of limpadoresLocais.current.values()) limpar();
    // Limpar filtros também apaga o estado persistido da tela, para que a
    // próxima abertura não restaure o filtro anterior.
    limparPersistido();
  }

  const controle = (filter: FilterConfig) => (
    <FilterControl
      filter={filter}
      searchParams={searchParams}
      setParams={setParams}
      buscaColapsavel={!buscaSempreAberta}
      registrarLimpador={registrarLimpador}
    />
  );

  // No computador, a ordem fixa é filtros ► contexto ► abas ► favorito, numa
  // linha só (`order`, porque os invólucros do celular ficam `contents`). O
  // menu de views salvas abre a zona de contexto (capability views-salvas).
  return (
    <div
      className={cn(
        "mb-5 flex flex-col md:flex-row md:items-center md:gap-3",
        permitirQuebra && "md:flex-wrap",
      )}
    >
      <div className={LINHA_COMPACTA}>
        <ResumoCompacto
          aba={viewTabs.find((t) => t.value === activeView)?.label}
          resumo={resumoCelular}
        />
        {(mostrarViews || contexto != null) && (
          <div className="flex shrink-0 items-center gap-3 md:order-3">
            {mostrarViews && telaKey && (
              <ViewsSalvasMenu
                telaKey={telaKey}
                filtros={filtrosConhecidos}
                paramsDeNavegacao={paramsDeNavegacao}
                local={recorteLocal}
              />
            )}
            {contexto}
          </div>
        )}
        {favorito != null && (
          <div className="flex shrink-0 items-center md:order-5">{favorito}</div>
        )}
        {buscas.map((filter) => (
          <div
            key={filter.key}
            className="flex min-w-0 shrink-0 max-md:has-[[data-busca-aberta]]:flex-1 md:order-1"
          >
            {controle(filter)}
          </div>
        ))}
        {temPainel && (
          <BotaoPainelCompacto
            botaoRef={botaoPainelRef}
            aberto={painelAberto}
            painelId={painelId}
            ativos={ativos}
            comAbas={viewTabs.length > 0}
            onClick={() => setPainelAberto((a) => !a)}
            aoFechar={fecharPainel}
          />
        )}
      </div>

      <PainelCompacto
        id={painelId}
        painelRef={painelRef}
        aberto={painelAberto}
        aoFechar={fecharPainel}
        rotuloFechar={rotuloFecharPainel}
      >
        {viewTabs.length > 0 && (
          <div className="flex flex-col gap-3 px-4 py-3.5 md:contents">
            <span className={cn(ROTULO_DO_PAINEL, "md:hidden")}>Visão</span>
            <div className="md:order-4 md:shrink-0">
              <ViewTabsPill
                viewTabs={viewTabs}
                activeView={activeView}
                viewParam={viewParam}
                setParams={setParams}
                compacta
              />
            </div>
          </div>
        )}
        {/* Filtros: no celular, um por linha, com o rótulo acima; no computador,
            linha única com rolagem horizontal (os menus vêm em portal e não são
            cortados). Opt-out `permitirQuebra` → flex-wrap. */}
        <div
          className={cn(
            "relative flex flex-col gap-3 px-4 py-3.5 md:order-2 md:flex-1 md:flex-row md:items-center md:gap-[10px] md:p-0",
            viewTabs.length > 0 && "max-md:border-t max-md:border-[var(--premium-mist)]",
            filtrosDoPainel.length === 0 && "max-md:hidden",
            permitirQuebra ? "md:flex-wrap" : ROLAGEM_NO_COMPUTADOR,
          )}
        >
          <span className={cn(ROTULO_DO_PAINEL, "flex min-h-6 items-center md:hidden")}>
            Filtros
          </span>
          {filtrosDoPainel.map((filter) => (
            <div
              key={filter.key}
              className="flex flex-col gap-1.5 max-md:*:w-full md:contents max-md:[&>:last-child]:min-h-11"
            >
              {rotuloAcimaNoPainel(filter) && (
                <span aria-hidden className={cn(ROTULO_DO_PAINEL, "md:hidden")}>
                  {filter.label}
                </span>
              )}
              {controle(filter)}
            </div>
          ))}
          {/* Funil com x, não `X`: o `X` fica reservado ao limpar de um campo,
              e o funil diz "filtros" (change busca-um-x-por-campo, D3). */}
          {ativos > 0 && <LimparFiltros onClick={clearAll} />}
        </div>
      </PainelCompacto>
    </div>
  );
}
