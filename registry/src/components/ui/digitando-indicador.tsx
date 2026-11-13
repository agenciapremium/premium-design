"use client";

/**
 * Linha "<nome> está digitando…" da presença efêmera (capability
 * realtime-presenca-digitacao / D3). Renderiza junto à thread de comentários e
 * **some sozinha** quando a lista esvazia (o chamador expira os sinais ~5s após o
 * último). Nada renderiza quando vazio. Só tokens semânticos; os três pontos
 * pulsam e respeitam `prefers-reduced-motion`. `aria-live="polite"` anuncia sem
 * roubar o foco. pt-BR acentuado.
 */

const listaNomes = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" });

export function DigitandoIndicador({
  nomes,
  className,
}: {
  nomes: string[];
  className?: string;
}) {
  if (nomes.length === 0) return null;

  const texto =
    nomes.length === 1
      ? `${nomes[0]} está digitando…`
      : `${listaNomes.format(nomes)} estão digitando…`;

  return (
    <div
      aria-live="polite"
      className={`flex items-center gap-2 text-[12px] italic text-[var(--premium-gray)] ${className ?? ""}`}
    >
      <span className="flex items-end gap-0.5" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1 w-1 rounded-full bg-[var(--premium-silver)] motion-safe:animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="truncate">{texto}</span>
    </div>
  );
}
