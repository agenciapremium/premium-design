import { cn } from "@/lib/utils";

/**
 * Blocos de skeleton compartilhados pelos `loading.tsx` das rotas (capability
 * rotas-erro-e-carregamento, design D4).
 *
 * Regra do design system: carregamento de rota comunica a ESTRUTURA da tela em
 * blocos cinzas, nunca um spinner de página inteira (ui-guidelines §5.7 e
 * padroes-de-interacao.md, "Estados de carregamento"). Spinner só dentro de
 * botão durante submit. Um lint barra `animate-spin` nos arquivos de
 * carregamento de rota.
 *
 * Todo bloco é `aria-hidden`: é forma, não conteúdo, e leitor de tela não deve
 * anunciar nada. O pulso fica sob `motion-safe`, então desaparece com
 * `prefers-reduced-motion: reduce` (ui-guidelines §7).
 *
 * Cor: `--premium-bone` (superfície rebaixada) sobre `--premium-white`, os dois
 * calibrados nos temas claro e escuro (§9).
 */

/** Classe comum a todo bloco. Sem raio: cada bloco define o seu (§2.8). */
const BLOCO = "bg-[var(--premium-bone)] motion-safe:animate-pulse";

/**
 * Linha (texto, campo, chip). O raio vem do prop `raio` e não do `className`,
 * porque `cn()` não resolve conflito de utilitário (ui-guidelines §2.8).
 */
export function SkeletonLinha({
  largura = "100%",
  altura = 12,
  raio = "sm",
  className,
}: {
  largura?: number | string;
  altura?: number | string;
  raio?: "sm" | "md" | "pilula";
  className?: string;
}) {
  const raios = {
    sm: "rounded",
    md: "rounded-[var(--r-md)]",
    pilula: "rounded-full",
  } as const;
  return (
    <div
      aria-hidden
      className={cn(BLOCO, raios[raio], className)}
      style={{ width: largura, height: altura }}
    />
  );
}

/** Bloco de card (stat, painel, card de configuração). */
export function SkeletonCard({
  altura = 104,
  className,
}: {
  altura?: number | string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(BLOCO, "rounded-[var(--r-lg)]", className)}
      style={{ height: altura }}
    />
  );
}

/** Tabela: faixa de cabeçalho mais `linhas` de `colunas` células. */
export function SkeletonTabela({
  linhas = 8,
  colunas = 4,
  className,
}: {
  linhas?: number;
  colunas?: number;
  className?: string;
}) {
  const grade = { gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` };
  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--premium-white)]",
        className
      )}
    >
      <div
        className="grid gap-4 border-b border-[var(--premium-mist)] bg-[var(--premium-bone)] px-4 py-[13px]"
        style={grade}
      >
        {Array.from({ length: colunas }).map((_, c) => (
          <div
            key={c}
            className="h-3 rounded bg-[var(--premium-mist)] motion-safe:animate-pulse"
          />
        ))}
      </div>
      <div>
        {Array.from({ length: linhas }).map((_, l) => (
          <div
            key={l}
            className="grid gap-4 border-b border-[var(--premium-mist)] px-4 py-[15px] last:border-b-0"
            style={grade}
          >
            {Array.from({ length: colunas }).map((_, c) => (
              <div key={c} className={cn(BLOCO, "h-3 rounded")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Board: `colunas` trilhas com `cards` cartões cada. */
export function SkeletonKanban({
  colunas = 4,
  cards = 3,
  className,
}: {
  colunas?: number;
  cards?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("flex gap-4 overflow-hidden", className)}>
      {Array.from({ length: colunas }).map((_, c) => (
        <div
          key={c}
          className="w-[290px] shrink-0 rounded-[var(--r-lg)] bg-[var(--premium-bone)]/60 p-3"
        >
          <div className={cn(BLOCO, "mb-3 h-4 w-1/2 rounded")} />
          <div className="space-y-2">
            {Array.from({ length: cards }).map((_, k) => (
              <div
                key={k}
                className="h-[84px] rounded-[var(--r-md)] bg-[var(--premium-white)] motion-safe:animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
