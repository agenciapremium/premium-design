"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { m } from "motion/react";
import { SmilePlus, Loader2 } from "lucide-react";
import { motionPreset } from "@/lib/motion";
import { popoverPos } from "@/lib/popover-pos";

/**
 * EmojiPicker — primitivo do design system (capability `emoji-picker`).
 *
 * Encapsula a biblioteca **emoji-mart** (decisão do usuário em 02/07/2026, após
 * o gate de inviabilidade do `@atlaskit/emoji` — ver a change tasks-emoji-atlaskit):
 * busca, categorias e tom de pele nativos, dataset LOCAL (sem serviços remotos),
 * i18n pt e emojis **nativos** (a seleção devolve o caractere unicode). Nenhum
 * consumidor importa emoji-mart diretamente — só este wrapper.
 *
 * - Carregamento sob demanda: o painel pesado entra por `next/dynamic`
 *   (`ssr:false`) só quando o popover abre — fora do bundle inicial do board.
 * - Fallback gracioso: a linha de **atalhos frequentes** fica sempre visível;
 *   se o painel falhar ao carregar/inicializar, o usuário ainda reage por ela —
 *   reagir NUNCA quebra.
 * - Tema: segue a classe `dark` do documento (o tema ATIVO do Tasks, não o do
 *   sistema — o app tem toggle próprio).
 * - Posicionamento: o painel renderiza em **portal no `document.body`** com
 *   posição `fixed` calculada por `popoverPos` (flip/clamp na viewport) e
 *   `z-[60]` — nunca é cortado por ancestrais com `overflow` (coluna de
 *   comentários rolável, modal `overflow-hidden`); change melhorias-ux, D8.
 * - Acessibilidade: gatilho com alvo ≥ 40px, foco visível e aria; Esc fecha e
 *   devolve o foco ao gatilho (docs/design-system/ui-guidelines.md §7, §9, §11).
 */

/** Tamanho estimado do painel (frequentes + emoji-mart 7 col) p/ flip/clamp. */
const PAINEL_EMOJI_W = 300;
const PAINEL_EMOJI_H = 380;

/** Atalhos frequentes de reação (os 6 emojis historicamente fixos). */
export const EMOJIS_FREQUENTES = ["👍", "❤️", "😄", "🎉", "👀", "🚀"] as const;

// Painel emoji-mart carregado dinamicamente, sem SSR, com skeleton de loading.
const EmojiPickerPanel = dynamic(() => import("./emoji-picker-panel"), {
  ssr: false,
  loading: () => <PanelLoading />,
});

interface EmojiPickerProps {
  /** Chamado com o caractere unicode do emoji escolhido; o popover fecha. */
  onSelect: (emoji: string) => void;
  /** Atalhos de 1 clique exibidos acima do painel. */
  frequentes?: readonly string[];
  disabled?: boolean;
  /** Rótulo acessível do gatilho. */
  triggerLabel?: string;
  /** Alinhamento horizontal do popover em relação ao gatilho. */
  align?: "start" | "end";
  /** Classe extra do gatilho (para casar com o layout do consumidor). */
  triggerClassName?: string;
}

export function EmojiPicker({
  onSelect,
  frequentes = EMOJIS_FREQUENTES,
  disabled = false,
  triggerLabel = "Adicionar reação",
  align = "start",
  triggerClassName,
}: EmojiPickerProps) {
  const [aberto, setAberto] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dark = useDarkTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora / com Esc (devolvendo o foco ao gatilho); reposiciona
  // em scroll/resize (o painel vive em portal com posição fixa — segue o gatilho
  // quando a coluna de comentários rola), como os demais popovers do modal.
  useEffect(() => {
    if (!aberto) return;
    function onDown(ev: MouseEvent) {
      const t = ev.target as Node | null;
      if (painelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setAberto(false);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setAberto(false);
        triggerRef.current?.focus();
      }
    }
    function reposicionar() {
      setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposicionar, true);
    window.addEventListener("resize", reposicionar);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposicionar, true);
      window.removeEventListener("resize", reposicionar);
    };
  }, [aberto]);

  function alternar() {
    if (disabled) return;
    if (aberto) {
      setAberto(false);
      return;
    }
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setAberto(true);
  }

  function escolher(emoji: string) {
    setAberto(false);
    onSelect(emoji);
  }

  // Posição fixa via helper (flip vertical + clamp na viewport). Para `align:end`
  // alinha a borda direita do painel ao gatilho; caso contrário, a esquerda.
  const pos = rect
    ? popoverPos(
        {
          left: align === "end" ? rect.right - PAINEL_EMOJI_W : rect.left,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
        },
        PAINEL_EMOJI_W,
        PAINEL_EMOJI_H,
      )
    : null;

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={alternar}
        disabled={disabled}
        className={
          triggerClassName ??
          "flex h-10 w-10 items-center justify-center rounded-full text-[var(--premium-steel)] transition-colors hover:bg-[var(--premium-bone)] hover:text-[var(--c-ink)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)]"
        }
      >
        <SmilePlus size={15} />
      </button>

      {aberto &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={painelRef}
            {...motionPreset("menu")}
            role="dialog"
            aria-label="Seletor de emoji"
            // Largura é do conteúdo (`w-max`), por isso não repassa `width`.
            // `top` OU `bottom`: aberto acima, a base encosta no gatilho.
            style={{ position: pos.position, top: pos.top, bottom: pos.bottom, left: pos.left, maxHeight: pos.maxHeight }}
            className="z-[60] w-max max-w-[calc(100vw-1rem)] overflow-y-auto rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-1.5 shadow-[var(--sh-md)]"
          >
            {/* Atalhos frequentes — sempre presentes (também é o fallback se o
                painel completo falhar ao carregar). */}
            <div className="flex flex-wrap gap-0.5 pb-1.5">
              {frequentes.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-label={`Reagir com ${e}`}
                  onClick={() => escolher(e)}
                  className="flex h-10 w-10 items-center justify-center rounded-[var(--r-sm)] text-[16px] transition-colors hover:bg-[var(--premium-bone)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)]"
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Painel completo (busca/categorias/tom de pele) — lazy, ssr:false.
                Em erro de carregamento, degrada para só os atalhos acima. */}
            <PanelErrorBoundary>
              <EmojiPickerPanel onSelect={escolher} dark={dark} />
            </PanelErrorBoundary>
          </m.div>,
          document.body,
        )}
    </div>
  );
}

/** Lê o tema ativo (classe `dark` no <html>) e reage a mudanças do toggle. */
function useDarkTheme(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const ler = () => setDark(root.classList.contains("dark"));
    ler();
    const obs = new MutationObserver(ler);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function PanelLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando emojis"
      className="flex h-[18rem] w-[17.5rem] items-center justify-center text-[var(--premium-steel)]"
    >
      <Loader2 size={20} className="animate-spin" aria-hidden />
    </div>
  );
}

/**
 * ErrorBoundary do painel: se o import dinâmico ou a inicialização do emoji-mart
 * falhar, registra no console e não renderiza nada — os atalhos frequentes acima
 * seguem disponíveis, então a reação continua funcionando.
 */
class PanelErrorBoundary extends Component<{ children: ReactNode }, { falhou: boolean }> {
  state = { falhou: false };
  static getDerivedStateFromError() {
    return { falhou: true };
  }
  componentDidCatch(erro: unknown) {
    console.error("EmojiPicker: falha ao carregar o painel de emojis", erro);
  }
  render() {
    if (this.state.falhou) {
      return (
        <p className="px-2 pb-1 text-[11px] text-[var(--premium-steel)]">
          Busca de emojis indisponível. Use os atalhos acima.
        </p>
      );
    }
    return this.props.children;
  }
}
