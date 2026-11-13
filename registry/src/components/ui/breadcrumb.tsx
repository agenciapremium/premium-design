import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  /** Quando ausente, o item é tratado como o atual (texto, não navegável). */
  href?: string;
}

/**
 * Navegação hierárquica das telas de detalhe (ui-guidelines §4.23), no lugar do
 * botão "Voltar". Níveis intermediários são links; o último é o item atual
 * (`aria-current="page"`). Cores só por token; tema claro/escuro pelos tokens.
 *
 * `trailing` (opcional) renderiza um elemento inline logo após o último item —
 * ex.: um atalho de copiar link ao lado do nome da entidade.
 *
 * `compact` (opcional): variante reduzida para o header — fonte menor, sem
 * margem inferior e em linha única (não quebra), pensada para ficar logo abaixo
 * do subtítulo da página.
 */
export function Breadcrumb({
  items,
  trailing,
  compact,
}: {
  items: BreadcrumbItem[];
  trailing?: ReactNode;
  compact?: boolean;
}) {
  return (
    <nav aria-label="Trilha de navegação" className={compact ? "mt-[3px]" : "mb-2"}>
      <ol
        className={
          compact
            ? "flex flex-nowrap items-center gap-[3px] text-[10px] font-medium overflow-hidden"
            : "flex flex-wrap items-center gap-[5px] text-[12px] font-medium"
        }
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={`inline-flex items-center ${compact ? "py-[1px]" : "py-[3px]"} text-[var(--premium-steel)] transition-colors hover:text-[var(--premium-ink)] focus-visible:outline-none focus-visible:rounded-[var(--r-sm)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={`inline-flex items-center ${compact ? "py-[1px] truncate max-w-[260px]" : "py-[3px]"} ${
                      isLast ? "text-[var(--premium-ink)]" : "text-[var(--premium-steel)]"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="flex items-center text-[var(--premium-silver)]">
                  <ChevronRight size={compact ? 11 : 14} />
                </li>
              )}
            </Fragment>
          );
        })}
        {trailing && <li className="flex items-center ml-[2px]">{trailing}</li>}
      </ol>
    </nav>
  );
}
