/**
 * Sincronização entre o campo de busca da `FilterBar` e a URL (change
 * filter-bar-busca-digitacao-estavel, D2).
 *
 * O campo grava o termo na URL com debounce, e a URL só muda quando a resposta
 * do servidor chega. Se a pessoa digita mais uma letra nesse intervalo, a
 * resposta atrasada traz o termo antigo: copiá-lo para o campo apaga o que
 * acabou de ser digitado. Por isso o campo só adota a URL quando ela mudou E
 * não há escrita do próprio campo a caminho (debounce correndo ou navegação
 * ainda sem confirmar). Mudanças externas ("Limpar filtros", view salva) entram
 * assim que a busca assenta.
 */

export interface SincroniaBuscaUrl {
  /** Valor da busca na URL confirmada (`useSearchParams`). */
  urlValue: string;
  /** Último valor da URL que o campo já adotou. */
  urlAnterior: string;
  /** Debounce correndo ou navegação disparada pelo campo ainda pendente. */
  escritaPendente: boolean;
}

/** O campo deve passar a mostrar o valor da URL? */
export function campoAdotaUrl({ urlValue, urlAnterior, escritaPendente }: SincroniaBuscaUrl): boolean {
  return urlValue !== urlAnterior && !escritaPendente;
}
