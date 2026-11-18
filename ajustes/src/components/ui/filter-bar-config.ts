/**
 * Tipos e regras puras da `FilterBar`: a configuração de cada filtro e de cada
 * aba, e a busca e o limite das opções dos filtros de seleção.
 */
import type { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type FilterType = "select" | "multiselect" | "daterange" | "toggle" | "search" | "faixa";

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
  /** Chave usada na URL (para `daterange` e `faixa` vira `<key>De` e `<key>Ate`). */
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
  /**
   * Limites da `faixa` (filtro de faixa numérica, "de" e "até"). Obrigatórios
   * quando o tipo é `faixa`: o valor fora deles vai para o limite mais próximo.
   */
  min?: number;
  max?: number;
  /** Incremento dos campos da `faixa`. Padrão 1. */
  passo?: number;
  /**
   * Busca fora da URL (`search`): com a função, o termo fica só no estado do
   * componente e chega aqui com o mesmo atraso da busca pela URL, e `""` ao
   * limpar. Não vai para a URL, para os filtros persistidos nem para as views
   * salvas. Para buscas com dado pessoal (nome, e-mail). Pode mudar a cada
   * render: a barra a guarda em ref.
   */
  aoBuscar?: (termo: string) => void;
}

/** Atualizações de URL de um filtro, somando as chaves dependentes quando ele é limpo. */
export function comDependentes(
  filter: FilterConfig,
  valor: string | null,
): Record<string, string | null> {
  const updates: Record<string, string | null> = { [filter.key]: valor };
  if (valor === null) for (const k of filter.limpaJunto ?? []) updates[k] = null;
  return updates;
}

export function mostrarBuscaPara(filter: FilterConfig): boolean {
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
export function filtrarOpcoes(filter: FilterConfig, termo: string): FilterOption[] {
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

/** Leitura dos parâmetros da URL, como o `useSearchParams` devolve. */
export type ParamsDaUrl = ReturnType<typeof useSearchParams>;

/** Escrita na URL: `null` remove a chave. */
export type EscreverParams = (updates: Record<string, string | null>) => void;
