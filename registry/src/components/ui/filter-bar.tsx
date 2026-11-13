"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { m } from "motion/react";
import { Check, ChevronDown, FunnelX, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { mostrarLimparFiltros } from "@/lib/helpers/filtros-ativos";
import { campoAdotaUrl } from "@/lib/helpers/busca-filtro-url";
import { motionPreset } from "@/lib/motion";
import { navegarComTransicao } from "@/lib/view-transition";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip } from "@/components/ui/tooltip";
import { popoverPos } from "@/lib/popover-pos";
import { useSetParams } from "@/lib/hooks/use-set-params";
import {
  chipActive,
  chipBase,
  chipIdle,
  chipOn,
  dropdownPanelClass,
  SingleSelectItem,
  useDropdownPortal,
} from "@/components/ui/pilula";
import { useFiltrosPersistidos } from "@/lib/hooks/use-filtros-persistidos";
import { ViewsSalvasMenu } from "@/components/ui/views-salvas-menu";
import { useFiltrosPersistencia } from "@/components/ui/filtros-persistencia";
import type { FiltroConhecido } from "@/lib/helpers/views-salvas";

export type FilterType = "select" | "multiselect" | "daterange" | "toggle" | "search";

export interface FilterOption {
  value: string;
  label: string;
}

// Busca acento/caixa-insensível — mesmo padrão de multi-select.tsx / select.tsx.
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** A partir deste tamanho a lista ganha campo de busca automaticamente. */
const BUSCA_A_PARTIR_DE = 8;

/**
 * Limite padrão de opções exibidas (sem termo) quando a busca está disponível e a
 * lista é longa — padrão global (capability filter-bar-busca-layout-global), no mesmo
 * espírito do filtro "Projeto" da Gestão de Demandas. `limiteVisivel` por filtro
 * sobrescreve; nunca corta quando não há busca (itens ficariam inacessíveis).
 */
const LIMITE_VISIVEL_PADRAO = 6;

export interface FilterConfig {
  /** Chave usada na URL (para `daterange` vira `<key>De` e `<key>Ate`). */
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  icon?: LucideIcon;
  /** Texto exibido quando nenhum valor está selecionado (tipos select). */
  placeholder?: string;
  /**
   * Força (ou oculta) o campo de busca nas opções (`select`/`multiselect`).
   * Default: automático — aparece quando há ao menos `BUSCA_A_PARTIR_DE` opções.
   */
  searchable?: boolean;
  /**
   * Limite de opções exibidas **enquanto não há termo de busca** (ex.: 5). Ao
   * digitar, a busca abrange a lista completa (não só as visíveis por padrão).
   */
  limiteVisivel?: number;
  /**
   * Chaves de URL que saem junto quando este filtro é limpo (`select` e
   * `multiselect`), na mesma escrita. Para filtros que só fazem sentido com
   * este preenchido (ex.: "Onde está" depende de "Responsável"), de modo que
   * não sobre parâmetro órfão na URL nem no filtro persistido.
   */
  limpaJunto?: string[];
}

/** Atualizações de URL de um filtro, somando as chaves dependentes quando ele é limpo. */
function comDependentes(filter: FilterConfig, valor: string | null): Record<string, string | null> {
  const updates: Record<string, string | null> = { [filter.key]: valor };
  if (valor === null) for (const k of filter.limpaJunto ?? []) updates[k] = null;
  return updates;
}

function mostrarBuscaPara(filter: FilterConfig): boolean {
  return filter.searchable ?? (filter.options?.length ?? 0) >= BUSCA_A_PARTIR_DE;
}

/**
 * Limite efetivo de itens visíveis (sem termo). Usa `limiteVisivel` quando o filtro o
 * define; senão aplica `LIMITE_VISIVEL_PADRAO` **apenas quando a busca está
 * disponível** (do contrário os itens ocultos ficariam inacessíveis) e a lista é maior
 * que o limite. `null` = não cortar.
 */
function limiteEfetivo(filter: FilterConfig): number | null {
  if (filter.limiteVisivel != null) return filter.limiteVisivel;
  if (!mostrarBuscaPara(filter)) return null;
  const n = filter.options?.length ?? 0;
  return n > LIMITE_VISIVEL_PADRAO ? LIMITE_VISIVEL_PADRAO : null;
}

/**
 * Aplica busca/limite às opções de um filtro select/multiselect, preservando a
 * ordem fornecida pela tela (a FilterBar nunca reordena). Sem termo, corta no limite
 * efetivo; com termo, filtra a lista inteira.
 */
function filtrarOpcoes(filter: FilterConfig, termo: string): FilterOption[] {
  const opcoes = filter.options ?? [];
  const t = norm(termo.trim());
  if (t) return opcoes.filter((o) => norm(o.label).includes(t));
  const lim = limiteEfetivo(filter);
  return lim != null ? opcoes.slice(0, lim) : opcoes;
}

export interface TabConfig {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Contagem exibida ao lado do rótulo (ex.: abas "Todas 128" da Tabela). */
  count?: number;
}

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

  // Chaves de URL que contam como filtro (daterange expande em De/Ate). Base
  // tanto da restauração quanto do salvamento persistido.
  const filterKeys = useMemo(
    () =>
      filters.flatMap((f) =>
        f.type === "daterange" ? [`${f.key}De`, `${f.key}Ate`] : [f.key]
      ),
    [filters]
  );

  const { limpar: limparPersistido } = useFiltrosPersistidos({ telaKey, filterKeys, local: recorteLocal });

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
    [filters]
  );

  const setParams = useSetParams({ local: recorteLocal });

  // "Limpar filtros" só quando limpa mais do que a busca, que já tem o próprio
  // `X` (change busca-um-x-por-campo, D3). Regra pura em `filtros-ativos.ts`.
  const mostrarLimpar = mostrarLimparFiltros(filters, (k) => searchParams.get(k));

  function clearAll() {
    const updates: Record<string, string | null> = {};
    for (const f of filters) {
      if (f.type === "daterange") {
        updates[`${f.key}De`] = null;
        updates[`${f.key}Ate`] = null;
      } else {
        updates[f.key] = null;
      }
    }
    setParams(updates);
    // Limpar filtros também apaga o estado persistido da tela, para que a
    // próxima abertura não restaure o filtro anterior.
    limparPersistido();
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 mb-5",
        permitirQuebra && "flex-wrap"
      )}
    >
      {/* Filtros — esquerda. Padrão: linha única com rolagem horizontal (os dropdowns
          são portados, então não são cortados). Opt-out `permitirQuebra` → flex-wrap. */}
      <div
        className={cn(
          "flex items-center gap-[10px]",
          permitirQuebra
            ? "flex-wrap"
            : "min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {filters.map((filter) => (
          <FilterControl
            key={filter.key}
            filter={filter}
            searchParams={searchParams}
            setParams={setParams}
            buscaColapsavel={!buscaSempreAberta}
          />
        ))}
        {/* Ícone de funil com x, não `X`: o `X` fica reservado ao limpar de um
            campo, e o funil diz "filtros" (change busca-um-x-por-campo, D3). */}
        {mostrarLimpar && (
          <Tooltip label="Limpar filtros" side="bottom">
            <button
              onClick={clearAll}
              aria-label="Limpar filtros"
              className="shrink-0 w-9 h-9 rounded-full bg-[var(--yellow)] text-black flex items-center justify-center cursor-pointer shadow-[var(--sh-gold)] hover:bg-[var(--gold)] active:bg-[var(--amber)] transition-colors"
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
        <div
          className={cn(
            "flex items-center gap-3 shrink-0",
            permitirQuebra && "flex-wrap"
          )}
        >
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
            <ViewTabsPill viewTabs={viewTabs} activeView={activeView} viewParam={viewParam} setParams={setParams} />
          )}
          {favorito}
        </div>
      )}
    </div>
  );
}

/**
 * Grupo de tabs de visão com pílula deslizante (CSS, medida por ref — sem
 * `layoutId`/`domMax`) e troca de conteúdo via View Transitions quando disponível
 * (change animacoes-graficos-abas-transicoes).
 *
 * A `FilterBar` renderiza um grupo (o `viewParam` da tela) no cluster da direita.
 * Exportado para telas que precisam de um **segundo** grupo de abas em outro
 * lugar do layout e em outro param — caso das abas "Todas/Para hoje/Atrasadas"
 * (`?aba=`) da visão Tabela de demandas, que ficam acima da tabela. Reusar este
 * componente (com `useSetParams`) mantém uma só implementação de estado de aba em
 * searchParam, com o mesmo visual e o mesmo reset de página.
 */
export function ViewTabsPill({
  viewTabs,
  activeView,
  viewParam,
  setParams,
}: {
  viewTabs: TabConfig[];
  activeView: string | undefined;
  viewParam: string;
  setParams: (updates: Record<string, string | null>) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const btn = activeView ? btnRefs.current[activeView] : null;
    const list = listRef.current;
    if (!btn || !list) return;
    const atualizar = () => setInd({ left: btn.offsetLeft, width: btn.offsetWidth });
    atualizar();
    const ro = new ResizeObserver(atualizar);
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeView, viewTabs.length]);

  return (
    <div ref={listRef} className="relative flex gap-1 bg-[var(--premium-bone)] p-1 rounded-[var(--r-md)]">
      {ind && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-[var(--r-sm)] bg-[var(--premium-white)] shadow-[var(--sh-sm)] transition-[left,width] duration-200 ease-[var(--ease)] motion-reduce:transition-none"
          style={{ left: ind.left, width: ind.width }}
        />
      )}
      {viewTabs.map((tab) => {
        const active = tab.value === activeView;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              btnRefs.current[tab.value] = el;
            }}
            onClick={() => navegarComTransicao(() => setParams({ [viewParam]: tab.value }))}
            // Anuncia a opção ativa ao leitor de tela (change qg-cliente, spec
            // qg-cliente-lista): o destaque visual sozinho não basta.
            aria-pressed={active}
            className={cn(
              "relative z-[1] px-4 py-2 rounded-[var(--r-sm)] text-[13px] font-medium flex items-center gap-[7px] cursor-pointer transition-colors",
              active ? "text-[var(--premium-ink)] font-bold" : "text-[var(--premium-steel)]"
            )}
          >
            {Icon && <Icon size={15} />} {tab.label}
            {tab.count != null && (
              <span className="text-[11px] text-[var(--premium-gray)]">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FilterControl({
  filter,
  searchParams,
  setParams,
  buscaColapsavel,
}: {
  filter: FilterConfig;
  searchParams: ReturnType<typeof useSearchParams>;
  setParams: (updates: Record<string, string | null>) => void;
  buscaColapsavel: boolean;
}) {
  const Icon = filter.icon;

  if (filter.type === "search") {
    return (
      <SearchFilterControl
        filter={filter}
        searchParams={searchParams}
        setParams={setParams}
        colapsavel={buscaColapsavel}
      />
    );
  }

  if (filter.type === "toggle") {
    const active = searchParams.get(filter.key) === "1";
    return (
      <button
        onClick={() => setParams({ [filter.key]: active ? null : "1" })}
        aria-pressed={active}
        className={cn(chipBase, active ? chipOn : chipIdle)}
      >
        {Icon && <Icon size={14} className={active ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]"} />}
        {filter.label}
      </button>
    );
  }

  if (filter.type === "daterange") {
    const de = searchParams.get(`${filter.key}De`) ?? "";
    const ate = searchParams.get(`${filter.key}Ate`) ?? "";
    const active = Boolean(de || ate);
    return (
      <div className={cn(chipBase, active ? chipActive : chipIdle, "cursor-default")}>
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span className="text-[var(--premium-gray)]">{filter.label}</span>
        <DatePicker
          variant="inline"
          value={de}
          max={ate || undefined}
          onChange={(e) => setParams({ [`${filter.key}De`]: e.target.value || null })}
          placeholder="Início"
          ariaLabel={`${filter.label}: data inicial`}
        />
        <span className="text-[var(--premium-gray)]">–</span>
        <DatePicker
          variant="inline"
          value={ate}
          min={de || undefined}
          onChange={(e) => setParams({ [`${filter.key}Ate`]: e.target.value || null })}
          placeholder="Fim"
          ariaLabel={`${filter.label}: data final`}
        />
      </div>
    );
  }

  if (filter.type === "multiselect") {
    return (
      <MultiSelectControl filter={filter} searchParams={searchParams} setParams={setParams} />
    );
  }

  // select (padrão) — pílula com dropdown custom (mesmo painel do multiselect).
  return (
    <SingleSelectControl filter={filter} searchParams={searchParams} setParams={setParams} />
  );
}

// Filtro de busca por palavra-chave: input textual persistido na URL
// (`<key>`), com debounce para não thrashar o histórico enquanto digita. Tokens
// semânticos, foco visível e contraste AA em claro/escuro.
function SearchFilterControl({
  filter,
  searchParams,
  setParams,
  colapsavel,
}: {
  filter: FilterConfig;
  searchParams: ReturnType<typeof useSearchParams>;
  setParams: (updates: Record<string, string | null>) => void;
  colapsavel: boolean;
}) {
  const Icon = filter.icon ?? Search;
  const urlValue = searchParams.get(filter.key) ?? "";
  const [valor, setValor] = useState(urlValue);
  const [urlAnterior, setUrlAnterior] = useState(urlValue);
  const [expandido, setExpandido] = useState(false);
  // Escrita do campo a caminho da URL: o debounce correndo (`digitando`) ou a
  // navegação disparada por ele ainda sem confirmar (`navegando`). Estado, não
  // ref, porque é lido durante o render.
  const [digitando, setDigitando] = useState(false);
  const [navegando, startNavegacao] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reflete mudanças externas da URL (ex.: "Limpar filtros") no campo, sem
  // efeito: padrão "ajuste de estado durante o render" do React (rastreia o
  // último valor da URL via estado, não ref). Só quando não há escrita do campo
  // a caminho: a URL muda quando a resposta do servidor chega, e a resposta
  // atrasada de uma escrita anterior traz o termo antigo, que apagaria o que
  // acabou de ser digitado (change filter-bar-busca-digitacao-estavel).
  if (campoAdotaUrl({ urlValue, urlAnterior, escritaPendente: digitando || navegando })) {
    setUrlAnterior(urlValue);
    setValor(urlValue);
  }

  const active = valor.trim().length > 0;
  // Aberto quando: não-colapsável (opt-out), expandido manualmente, ou há termo.
  const aberto = !colapsavel || expandido || active;

  // Foca o input ao expandir (capability filter-bar-busca-layout-global).
  useEffect(() => {
    if (aberto && expandido) inputRef.current?.focus();
  }, [aberto, expandido]);

  function onChange(v: string) {
    setValor(v);
    setDigitando(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDigitando(false);
      // Na transição, `navegando` fica verdadeiro até a URL confirmar.
      startNavegacao(() => setParams({ [filter.key]: v.trim() || null }));
    }, 300);
  }

  function limpar() {
    setValor("");
    setDigitando(false);
    if (timer.current) clearTimeout(timer.current);
    startNavegacao(() => setParams({ [filter.key]: null }));
    setExpandido(false);
  }

  // Um único elemento que cresce suavemente: a lupa fica sempre visível e o campo
  // anima a largura/opacidade de 0 → 200px ao abrir (capability
  // filter-bar-busca-layout-global). `overflow-hidden` esconde o campo recolhido.
  return (
    <div
      className={cn(
        chipBase,
        active ? chipActive : chipIdle,
        "shrink-0 overflow-hidden",
        aberto ? "cursor-text gap-2" : "cursor-pointer gap-0"
      )}
      onClick={() => {
        if (colapsavel && !aberto) setExpandido(true);
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          if (colapsavel && !aberto) {
            e.stopPropagation();
            setExpandido(true);
          }
        }}
        aria-label={filter.label}
        aria-expanded={aberto}
        tabIndex={aberto ? -1 : 0}
        className="flex shrink-0 items-center justify-center focus-visible:outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)]"
      >
        <Icon size={18} className="text-[var(--premium-gray)]" />
      </button>
      <input
        ref={inputRef}
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (!valor.trim()) setExpandido(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !valor.trim()) setExpandido(false);
        }}
        placeholder={filter.placeholder ?? filter.label}
        aria-label={filter.label}
        aria-hidden={!aberto}
        tabIndex={aberto ? 0 : -1}
        style={{ width: aberto ? 200 : 0, opacity: aberto ? 1 : 0 }}
        className="bg-transparent text-[13px] text-[var(--premium-ink)] placeholder:text-[var(--premium-gray)] transition-[width,opacity] duration-200 ease-out focus:outline-none"
      />
      {/* O único controle de limpar do campo: o "x" nativo do type="search" é
          escondido pela regra base do globals.css (change busca-um-x-por-campo).
          Alvo de 24×24px (antes o ícone de 14px era o próprio alvo); o -mr
          devolve o respiro direito do chip. Limpar recolhe o chip, então o foco
          não volta ao campo, que some. */}
      {active && (
        <button
          type="button"
          onClick={limpar}
          aria-label="Limpar busca"
          className="-mr-[5px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--premium-gray)] hover:text-[var(--premium-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)]"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Campo de busca reusado pelos dropdowns de select/multiselect (foco visível,
// teclado e tokens semânticos claro/escuro).
function OpcoesBusca({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative mb-1">
      <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--premium-gray)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="Buscar..."
        aria-label={`Buscar em ${label}`}
        autoFocus
        className="w-full rounded-[var(--r-sm)] border border-[var(--premium-mist)] bg-[var(--premium-paper)] py-[6px] pl-7 pr-2 text-[13px] text-[var(--premium-ink)] focus:border-[var(--premium-ink)] focus:outline-none focus:shadow-[0_0_0_2px_var(--yellow-50)]"
      />
    </div>
  );
}

function SingleSelectControl({
  filter,
  searchParams,
  setParams,
}: {
  filter: FilterConfig;
  searchParams: ReturnType<typeof useSearchParams>;
  setParams: (updates: Record<string, string | null>) => void;
}) {
  const [busca, setBusca] = useState("");
  const { open, setOpen, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const Icon = filter.icon;
  const value = searchParams.get(filter.key) ?? "";
  const selectedLabel = filter.options?.find((o) => o.value === value)?.label;
  const mostrarBusca = mostrarBuscaPara(filter);
  const visiveis = filtrarOpcoes(filter, busca);

  function escolher(v: string | null) {
    setParams(comDependentes(filter, v));
    setBusca("");
    setOpen(false);
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        onClick={() => {
          setBusca("");
          abrir();
        }}
        aria-label={filter.label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(chipBase, value ? chipActive : chipIdle)}
      >
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span>{value && selectedLabel ? `${filter.label}: ${selectedLabel}` : filter.label}</span>
        <ChevronDown size={14} className="text-[var(--premium-gray)] -mr-1" />
      </button>
      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            role="listbox"
            aria-label={filter.label}
            style={popoverPos(rect, Math.max(rect.width, 220), 320)}
            className={dropdownPanelClass}
          >
            {mostrarBusca && <OpcoesBusca value={busca} onChange={setBusca} label={filter.label} />}
            {!busca && <SingleSelectItem checked={!value} label={filter.placeholder ?? "Todos"} onClick={() => escolher(null)} />}
            {visiveis.map((o) => (
              <SingleSelectItem key={o.value} checked={o.value === value} label={o.label} onClick={() => escolher(o.value)} />
            ))}
            {visiveis.length === 0 && (
              <div className="py-4 text-center text-[13px] text-[var(--premium-gray)]">Nenhum resultado.</div>
            )}
          </m.div>,
          document.body
        )}
    </div>
  );
}

function MultiSelectControl({
  filter,
  searchParams,
  setParams,
}: {
  filter: FilterConfig;
  searchParams: ReturnType<typeof useSearchParams>;
  setParams: (updates: Record<string, string | null>) => void;
}) {
  const [busca, setBusca] = useState("");
  const { open, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const Icon = filter.icon;
  const raw = searchParams.get(filter.key);
  const selected = raw ? raw.split(",").filter(Boolean) : [];
  const active = selected.length > 0;
  const mostrarBusca = mostrarBuscaPara(filter);
  const visiveis = filtrarOpcoes(filter, busca);

  function toggle(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    setParams(comDependentes(filter, next.length ? next.join(",") : null));
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        onClick={() => {
          setBusca("");
          abrir();
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(chipBase, active ? chipActive : chipIdle)}
      >
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span>{filter.label}</span>
        {active && (
          <span className="text-[11px] font-bold bg-[var(--premium-ink)] text-[var(--premium-paper)] rounded-full px-[6px] min-w-[16px] text-center">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className="text-[var(--premium-gray)] -mr-1" />
      </button>
      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            role="listbox"
            aria-label={filter.label}
            aria-multiselectable
            style={popoverPos(rect, Math.max(rect.width, 220), 320)}
            className={dropdownPanelClass}
          >
            {mostrarBusca && <OpcoesBusca value={busca} onChange={setBusca} label={filter.label} />}
            {visiveis.map((o) => {
              const checked = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  role="option"
                  aria-selected={checked}
                  className="w-full flex items-center gap-2 px-2 py-[7px] rounded-[var(--r-sm)] text-[13px] text-left text-[var(--premium-ink)] hover:bg-[var(--premium-bone)] cursor-pointer focus-visible:outline-none focus-visible:bg-[var(--premium-bone)]"
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0",
                      checked
                        ? "bg-[var(--premium-ink)] border-[var(--premium-ink)] text-[var(--premium-paper)]"
                        : "border-[var(--premium-mist)]"
                    )}
                  >
                    {checked && <Check size={12} />}
                  </span>
                  {o.label}
                </button>
              );
            })}
            {visiveis.length === 0 && (
              <div className="py-4 text-center text-[13px] text-[var(--premium-gray)]">Nenhum resultado.</div>
            )}
          </m.div>,
          document.body
        )}
    </div>
  );
}
