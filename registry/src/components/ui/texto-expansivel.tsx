"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Colapsa qualquer conteúdo (texto plano ou HTML rico) a uma prévia de altura
 * limitada e exibe um botão "ver mais"/"ver menos" no canto inferior direito —
 * apenas quando o conteúdo realmente transborda a prévia (change
 * descricao-ver-mais-atividade-cards, capability quadros-texto-ver-mais).
 *
 * Mede `scrollHeight` (que ignora o clip do `overflow-hidden`, logo é estável
 * entre recolher/expandir) contra `alturaRecolhida`, recalculando via
 * `ResizeObserver` — o transbordo depende da largura, que muda com o modal/janela.
 * Mede em px em vez de `line-clamp` para funcionar igual no texto plano
 * (`whitespace-pre-wrap`) e no Markdown multi-bloco (`.md-view`).
 *
 * A transição de altura usa Motion (change animacoes-motion-overlays): anima
 * `height` entre a prévia e a altura natural (`auto`, ~200 ms, curva `--ease`),
 * instantânea sob `prefers-reduced-motion`. Ao terminar de expandir, a altura fica
 * em `auto` (conteúdo editável pode crescer livremente). O `overflow` só clipa
 * enquanto recolhido ou em trânsito — expandido e parado fica visível, para não
 * cortar o anel de foco nem o popover de link do editor.
 */
export function TextoExpansivel({
  children,
  className,
  alturaRecolhida = 140,
  fadeColor = "var(--c-surface)",
  expandirAoFocar = false,
  acoes,
}: {
  children: ReactNode;
  className?: string;
  /** Altura máxima (px) da prévia recolhida. */
  alturaRecolhida?: number;
  /** Cor de fundo do bloco, usada no gradiente de fade (token semântico, sem hex). */
  fadeColor?: string;
  /**
   * Expande automaticamente quando algo dentro recebe foco. Necessário quando o
   * conteúdo é editável (ex.: `RichEditor` da descrição): sem isso, o clamp cortaria
   * a área de edição e o cursor sumiria abaixo da dobra. Clicar no campo (que o foca)
   * abre por completo, como pedido.
   */
  expandirAoFocar?: boolean;
  /**
   * Ações do consumidor renderizadas na MESMA linha do controle "ver mais",
   * alinhadas à direita (change melhorias-ux, D7). Ex.: o botão "Salvar" da
   * descrição em edição. Quando presente, a linha aparece mesmo sem transbordo.
   */
  acoes?: ReactNode;
}) {
  const conteudoRef = useRef<HTMLDivElement>(null);
  const [expandido, setExpandido] = useState(false);
  const [transborda, setTransborda] = useState(false);
  const [alturaConteudo, setAlturaConteudo] = useState<number>(alturaRecolhida);
  // Clipe extra durante a animação de expandir (evita o conteúdo "vazar" enquanto
  // cresce); desligado ao completar para não cortar foco/popover no estado final.
  const [animando, setAnimando] = useState(false);
  const conteudoId = useId();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = conteudoRef.current;
    if (!el) return;
    // Margem pequena evita "piscar" o botão quando o conteúdo fica quase no limite.
    const avaliar = () => {
      setAlturaConteudo(el.scrollHeight);
      setTransborda(el.scrollHeight > alturaRecolhida + 4);
    };
    avaliar();
    const observer = new ResizeObserver(avaliar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [alturaRecolhida, children]);

  const recolhido = transborda && !expandido;
  const clipar = recolhido || animando;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className="relative"
        onFocusCapture={expandirAoFocar ? () => setExpandido(true) : undefined}
      >
        <m.div
          ref={conteudoRef}
          id={conteudoId}
          initial={false}
          animate={{ maxHeight: recolhido ? alturaRecolhida : alturaConteudo }}
          transition={{ duration: prefersReduced ? 0 : 0.2, ease: EASE }}
          onAnimationStart={() => setAnimando(true)}
          onAnimationComplete={() => setAnimando(false)}
          style={{ overflow: clipar ? "hidden" : "visible" }}
        >
          {children}
        </m.div>
        {recolhido && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
            style={{ background: `linear-gradient(to bottom, transparent, ${fadeColor})` }}
          />
        )}
      </div>

      {/* Controle antes do slot: "ver mais" fica à ESQUERDA das ações (Salvar). */}
      {(transborda || acoes) && (
        <div className="flex items-center justify-end gap-2">
          {transborda && (
            <button
              type="button"
              onClick={() => setExpandido((v) => !v)}
              aria-expanded={expandido}
              aria-controls={conteudoId}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-[var(--r-sm)] px-1 text-[12px] text-[var(--premium-steel)] transition-colors hover:text-[var(--c-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)]"
            >
              <ChevronDown
                size={14}
                aria-hidden
                className={cn(
                  "transition-transform duration-200 ease-[var(--ease)] motion-reduce:transition-none",
                  expandido && "rotate-180"
                )}
              />
              {expandido ? "ver menos" : "ver mais"}
            </button>
          )}
          {acoes}
        </div>
      )}
    </div>
  );
}
