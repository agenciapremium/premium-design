import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CLASSE_CARD } from "@/components/ui/card";

/**
 * Card de seção de configurações (change catalogo-componentes-premium-design,
 * D9): um link em forma de card que leva a uma seção. Anatomia vinda do
 * Diagnóstico Premium, com os tokens do Tasks:
 *
 * - ícone num quadrado de 40px sobre a superfície rebaixada;
 * - título (17px, bold) que ocupa a linha, selo "Nova" opcional e chevron;
 * - texto auxiliar (14px);
 * - selo de estado opcional (ex.: "Ligado"/"Desligado"), por último.
 *
 * Vai dentro de `GradeCardsSecao` (é um `<li>`). O ícone é `ReactNode`, e não
 * um componente de ícone, porque a landing do Tasks o renderiza no servidor e o
 * passa a um componente cliente.
 */
export function CardSecao({
  href,
  icone,
  titulo,
  texto,
  selo,
  nova = false,
}: {
  href: string;
  /** Ícone já renderizado (ex.: `<Users size={20} />`). */
  icone: ReactNode;
  titulo: string;
  texto: string;
  /** Situação da seção, desenhada abaixo do texto. */
  selo?: ReactNode;
  /** Mostra o selo "Nova" ao lado do título. */
  nova?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          CLASSE_CARD,
          "flex h-full flex-col gap-3 p-5 text-[var(--premium-ink)] no-underline transition-colors duration-150 ease-[var(--ease)] hover:border-[var(--premium-gray)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--premium-ink)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--r-md)] bg-[var(--premium-bone)] text-[var(--premium-ink)]"
          >
            {icone}
          </span>
          <strong className="flex-1 text-[17px] font-bold">{titulo}</strong>
          {nova && (
            <span className="rounded-[var(--r-pill)] bg-[var(--brand-yellow)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--brand-ink)]">
              Nova
            </span>
          )}
          <ChevronRight aria-hidden size={18} className="shrink-0" />
        </span>
        <span className="text-[14px] leading-relaxed text-[var(--premium-steel)]">{texto}</span>
        {selo && <span>{selo}</span>}
      </Link>
    </li>
  );
}

/** Grade dos cards de seção: 1, 2 ou 3 colunas conforme a largura. */
export function GradeCardsSecao({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>{children}</ul>;
}
