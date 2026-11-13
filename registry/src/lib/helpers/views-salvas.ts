/**
 * Regras puras das views salvas (capability views-salvas, design D1/D2).
 *
 * Uma view é o snapshot da query string da tela: os mesmos pares que já vão na
 * URL, sem a paginação. Nada aqui interpreta filtro: montar, comparar e
 * serializar a query é tudo o que a capability precisa saber, e é o que permite
 * ao mesmo código valer para qualquer tela com `telaKey`.
 *
 * Este módulo é puro (sem React, sem banco, sem `window`), para o servidor, o
 * menu e os testes decidirem pela mesma regra.
 */

/** Parâmetro que nunca entra numa view: a página é do momento, não do recorte. */
const CHAVE_PAGINA = "pagina";

/**
 * Tamanho máximo do nome de uma view. Mora aqui, e não só no validator, para o
 * menu de views (peça do catálogo do premium-design) não importar o validator
 * de preferências, que puxa o vocabulário de demandas (change
 * catalogo-componentes-premium-design, D6). `@/lib/validators/preferencias`
 * reexporta.
 */
export const VIEW_NOME_MAX = 40;

/**
 * Forma canônica do nome para comparar duplicatas: sem espaços nas pontas, sem
 * caixa e sem acento. "Atrasadas NL" e "atrasadas nl" são o MESMO nome: é assim
 * que o servidor recusa e é assim que o diálogo desabilita o confirmar, para as
 * duas superfícies decidirem pela mesma regra.
 */
export function normalizaNomeView(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Query de uma view a partir dos parâmetros atuais da tela: tudo o que está na
 * URL (filtros, `view`, `sort`, `aba`) menos a paginação e os valores vazios.
 *
 * `navegacao` são os parâmetros que dizem onde a tela está, e não o recorte (o
 * mês exibido no calendário do time): a tela os declara pela prop
 * `paramsDeNavegacao` da `FilterBar`, e eles também ficam fora (change
 * calendario-time-filtros, D7).
 */
export function montarQueryDeView(params: URLSearchParams, navegacao: readonly string[] = []): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    if (k === CHAVE_PAGINA || v === "" || navegacao.includes(k)) continue;
    out[k] = v;
  }
  return out;
}

/**
 * Query para aplicar uma view: a da view mais os parâmetros de navegação que já
 * estão na URL, para aplicar em dezembro continuar em dezembro (D7).
 */
export function queryAoAplicarView(
  query: Record<string, string>,
  params: URLSearchParams,
  navegacao: readonly string[] = [],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of navegacao) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  return { ...out, ...query };
}

/** Duas queries são iguais quando têm as mesmas chaves com os mesmos valores. */
export function mesmaQuery(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => b[k] === a[k]);
}

/**
 * A view está ativa? Compara a query salva com a da tela, ambas sem a página: é
 * o que faz o menu marcar "Atrasadas NL" logo depois de aplicá-la, e desmarcar
 * assim que qualquer filtro muda. Sem os parâmetros de navegação, a view segue
 * ativa em qualquer mês do calendário (D7).
 */
export function viewEstaAtiva(
  query: Record<string, string>,
  params: URLSearchParams,
  navegacao: readonly string[] = [],
): boolean {
  return mesmaQuery(query, montarQueryDeView(params, navegacao));
}

/** Query serializada na ordem das chaves, para a URL da view e para o link. */
export function queryString(query: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) params.set(k, v);
  return params.toString();
}

/** URL relativa da view (caminho da tela + query). */
export function caminhoDaView(pathname: string, query: Record<string, string>): string {
  const qs = queryString(query);
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Opções conhecidas de um filtro da tela, no formato mínimo de que a checagem de
 * "filtro indisponível" precisa. A `FilterBar` converte a sua configuração para
 * cá; assim o menu não depende do tipo `FilterConfig` (e não há import circular).
 */
export interface FiltroConhecido {
  key: string;
  label: string;
  /** O valor na URL é uma lista separada por vírgula (multiselect). */
  multiplo: boolean;
  /** Valores que a tela oferece hoje. */
  valores: string[];
}

/**
 * Filtros da view que apontam para uma opção que não existe mais (o projeto foi
 * excluído, o cliente saiu da carteira). A view continua aplicável: a `FilterBar`
 * ignora valor fora das opções e aquele campo fica vazio. O menu só avisa,
 * discretamente, para a pessoa entender por que o recorte mudou (design, Risks).
 */
export function filtrosIndisponiveis(
  query: Record<string, string>,
  filtros: FiltroConhecido[]
): string[] {
  const fora: string[] = [];
  for (const f of filtros) {
    const bruto = query[f.key];
    if (!bruto) continue;
    const valores = f.multiplo ? bruto.split(",").filter(Boolean) : [bruto];
    const conhecidos = new Set(f.valores);
    if (valores.some((v) => !conhecidos.has(v))) fora.push(f.label);
  }
  return fora;
}

// --- Precedência da abertura da tela (design D4) ----------------------------
//
// Mora aqui, no módulo puro, para o servidor (`helpers/filtros-iniciais.ts`), o
// cliente e os testes decidirem pela mesma regra.

/** Espelho cru dos searchParams de uma page do App Router. */
export type SearchParamsBrutos = Record<string, string | string[] | undefined>;

/**
 * Parâmetros que existem na URL mas NÃO são filtro: paginação, visão, aba,
 * ordenação, janela de histórico e os que abrem um overlay sobre a tela
 * (`card`/`quadro` em Meus cards).
 *
 * A lista espelha o que `useFiltrosPersistidos` ignora no cliente, onde a
 * pergunta é feita ao contrário (só as chaves declaradas em `filters` contam).
 * Como o servidor não conhece a configuração da `FilterBar`, ele decide pela
 * lista negativa e erra sempre para o lado conservador: diante de um parâmetro
 * desconhecido ele NÃO aplica nada e deixa o cliente restaurar, em vez de
 * recortar uma página que a URL não pediu.
 */
export const PARAMS_FORA_DO_FILTRO = new Set([
  "pagina",
  "view",
  "aba",
  "sort",
  "historico",
  "card",
  "quadro",
]);

/** Valor presente na URL (string não vazia; array conta pelo primeiro item). */
function temValor(v: string | string[] | undefined): boolean {
  const um = Array.isArray(v) ? v[0] : v;
  return typeof um === "string" && um !== "";
}

/** A URL já traz algum filtro? Se traz, ela manda e nada é restaurado. */
export function temFiltroNaUrl(sp: SearchParamsBrutos): boolean {
  return Object.entries(sp).some(([k, v]) => !PARAMS_FORA_DO_FILTRO.has(k) && temValor(v));
}

export interface EntradaFiltrosIniciais {
  sp: SearchParamsBrutos;
  /** Query da view padrão da tela, quando houver. */
  viewPadrao?: Record<string, string>;
  /** Último filtro persistido da tela, quando houver. */
  ultimoFiltro?: Record<string, string>;
}

export interface FiltrosIniciais {
  origem: "url" | "view" | "ultimo" | "nenhum";
  sp: SearchParamsBrutos;
}

/**
 * Núcleo puro da precedência (testável sem banco). Devolve o `sp` efetivo: o da
 * URL quando ela traz filtros, senão o da view padrão, senão o do último filtro,
 * senão o próprio `sp`.
 *
 * A query aplicada é MESCLADA sobre o `sp` da URL, não o substitui: parâmetros
 * fora do filtro que já estavam ali (a página de um link, por exemplo) seguem
 * valendo, a menos que a própria view os defina.
 */
export function resolverQueryInicial({
  sp,
  viewPadrao,
  ultimoFiltro,
}: EntradaFiltrosIniciais): FiltrosIniciais {
  if (temFiltroNaUrl(sp)) return { origem: "url", sp };
  if (viewPadrao && Object.keys(viewPadrao).length > 0) {
    return { origem: "view", sp: { ...sp, ...viewPadrao } };
  }
  if (ultimoFiltro && Object.keys(ultimoFiltro).length > 0) {
    return { origem: "ultimo", sp: { ...sp, ...ultimoFiltro } };
  }
  return { origem: "nenhum", sp };
}
