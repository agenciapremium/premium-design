"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Controle único de paginação (capability `paginacao-tabelas`): Anterior ·
 * "Página X de Y" · Próxima. Escreve `?pagina=` na URL preservando os demais
 * parâmetros (filtros/ordenação), no mesmo padrão de `FilterBar`/`SortControls`
 * (`router.replace` + `scroll: false`).
 *
 * - Oculto quando há uma página ou menos (`paginas <= 1`).
 * - Botões desabilitados nos limites (Anterior na 1; Próxima na última).
 * - Navegável por teclado, com foco visível e rótulos acessíveis; cores por
 *   token semântico (tema claro/escuro).
 *
 * O `param` permite paginar listas independentes na mesma tela (ex.: tokens,
 * webhooks e OAuth clients), cada uma com sua própria chave.
 */
/**
 * Respiro no fim da listagem. Precisa ser **padding** do último elemento em fluxo,
 * e não margem nem padding do `<main>`:
 *
 * - `margin-bottom` do último filho NÃO entra na área rolável (medido em Chrome:
 *   respiro 0px), então `mb-*` aqui não teria efeito nenhum.
 * - `padding-bottom` do `<main>` também não aparece, porque `template.tsx` é
 *   `h-full` e o conteúdo alto transborda POR FORA da caixa dele — o padding do
 *   contêiner fica acima do conteúdo transbordado.
 * - Mexer no `<main>`/`template` para consertar isso quebra as telas full-height:
 *   qualquer espaço depois da caixa da página faz o `<main>` rolar, e o Kanban de
 *   Quadros deixa de travar na altura da tela.
 *
 * Daí o respiro morar aqui: é conteúdo, rola junto, e não alcança tela full-height
 * nenhuma (nenhuma delas rende paginação).
 */
const RESPIRO_FIM = "pb-[26px]";

export function Pagination({
  pagina,
  paginas,
  param = "pagina",
}: {
  pagina: number;
  paginas: number;
  param?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Uma página ou menos: os controles somem, mas o respiro do fim da listagem
  // permanece (RESPIRO_FIM abaixo) — do contrário a última linha encostaria na
  // borda inferior justamente nas listas curtas.
  if (paginas <= 1) return <div className={RESPIRO_FIM} aria-hidden />;

  function irPara(novaPagina: number) {
    const sp = new URLSearchParams(searchParams.toString());
    if (novaPagina <= 1) sp.delete(param);
    else sp.set(param, String(novaPagina));
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const botao =
    "inline-flex items-center gap-1 h-9 px-3 rounded-[var(--r-md)] border border-[var(--premium-mist)] text-[13px] font-medium text-[var(--premium-ink)] cursor-pointer transition-colors hover:border-[var(--premium-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--premium-ink)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--premium-mist)]";

  return (
    <nav
      className={`flex items-center justify-end gap-2 mt-4 ${RESPIRO_FIM}`}
      aria-label="Paginação"
    >
      <button
        type="button"
        className={botao}
        disabled={pagina <= 1}
        onClick={() => irPara(pagina - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft size={15} /> Anterior
      </button>
      <span
        className="text-[13px] text-[var(--premium-gray)] px-1"
        aria-live="polite"
      >
        Página {pagina} de {paginas}
      </span>
      <button
        type="button"
        className={botao}
        disabled={pagina >= paginas}
        onClick={() => irPara(pagina + 1)}
        aria-label="Próxima página"
      >
        Próxima <ChevronRight size={15} />
      </button>
    </nav>
  );
}
