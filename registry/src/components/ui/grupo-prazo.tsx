import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho de um grupo por prazo, com a lista logo abaixo (ui-guidelines §4.33).
 *
 * Nasceu dentro de "Meus cards" (capability quadros-minha-visao) e foi extraído
 * para cá quando o bloco "Meu dia" do Dashboard passou a agrupar pela mesma
 * ideia (capability dashboard-meu-dia): título em caixa alta, contagem em
 * pílula discreta e os itens numa `<ul>`. Duas telas com o mesmo desenho e duas
 * cópias do markup divergem no primeiro ajuste.
 *
 * O componente não sabe o que é um item: recebe os `<li>` prontos. Assim
 * "Meus cards" segue com o seu botão que abre o modal, e o Dashboard com a sua
 * linha clicável e a ação de concluir.
 */

/** Tom do título; sublinha a urgência sem depender só da cor (§7). */
export type TomGrupoPrazo = "neutro" | "atencao" | "critico";

const TOM_TITULO: Record<TomGrupoPrazo, string> = {
  neutro: "text-[var(--premium-steel)]",
  atencao: "text-[var(--warning)]",
  critico: "text-[var(--danger)]",
};

const TOM_CONTAGEM: Record<TomGrupoPrazo, string> = {
  neutro: "bg-[var(--premium-bone)] text-[var(--premium-steel)]",
  atencao: "bg-[var(--warning-bg)] text-[var(--warning)]",
  critico: "bg-[var(--danger-bg)] text-[var(--danger)]",
};

export function GrupoPrazo({
  titulo,
  contagem,
  tom = "neutro",
  nivel = 2,
  rodape,
  className,
  children,
}: {
  titulo: string;
  contagem: number;
  tom?: TomGrupoPrazo;
  /** Nível do cabeçalho, para o grupo não quebrar a hierarquia da página (§7). */
  nivel?: 2 | 3;
  /** Rodapé opcional do grupo (links "ver tudo", por exemplo). */
  rodape?: ReactNode;
  className?: string;
  /** Os itens `<li>` do grupo. */
  children: ReactNode;
}) {
  const Titulo = nivel === 2 ? "h2" : "h3";
  return (
    <section aria-label={titulo} className={className}>
      <Titulo className="mb-2 flex items-center gap-2 px-1 text-[12px] font-bold uppercase tracking-wider">
        <span className={TOM_TITULO[tom]}>{titulo}</span>
        <span
          className={cn(
            "rounded-full px-[7px] py-[1px] text-[11px] font-bold",
            TOM_CONTAGEM[tom]
          )}
        >
          {contagem}
        </span>
      </Titulo>
      <ul className="flex flex-col gap-2">{children}</ul>
      {rodape && <div className="mt-2 px-1">{rodape}</div>}
    </section>
  );
}
