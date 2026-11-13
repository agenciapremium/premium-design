"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { motionPreset } from "@/lib/motion";
import { useDialogoFoco } from "@/lib/hooks/use-dialogo-foco";
import { estaNoTopo, registrarOverlay } from "@/lib/overlay-pilha";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Exibe uma barra de progresso indeterminada sob o cabecalho (ex.: auto-save). */
  loading?: boolean;
  /**
   * Rodapé fixo de ações (ui-guidelines §4.9): por convenção, Cancelar (ghost) à
   * esquerda e a ação primária (primary/dark) à direita. Fica fixo na base do
   * painel (não rola com o `children`). Opcional/retrocompatível.
   */
  footer?: ReactNode;
  /**
   * Ações exibidas no cabeçalho, imediatamente à direita do `title` (ex.: um
   * toggle de status). O nome acessível do painel continua vindo do `title`,
   * agora por `aria-labelledby` apontando para o `h2`.
   */
  headerActions?: ReactNode;
}

// Pilha global de SlideOvers abertos (empilhamento/aninhado — §4.9, §5.3).
// Só o topo da pilha responde a Esc; o scroll do body só é restaurado quando o
// último painel fecha. O empilhamento visual vem da ordem no DOM: o painel
// aninhado é descendente do painel de baixo (`fixed` cria contexto de
// empilhamento), portanto seu scrim/painel ficam acima do inferior.
// A pilha de overlays mora em `@/lib/overlay-pilha` (compartilhada com o
// `PainelCards`); os nomes seguem exportados daqui para os imports existentes.
export { estaNoTopo, temOverlayAberto } from "@/lib/overlay-pilha";

export function SlideOver({ open, onClose, title, children, loading = false, footer, headerActions }: SlideOverProps) {
  const id = useId();
  const tituloId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);

  // Renderizamos via portal no `document.body` para que o painel viva sempre no
  // contexto de empilhamento raiz — assim seu `z-50` fica garantidamente acima
  // do FAB global (z-40) mesmo quando a tela que o abre está sob um ancestral
  // que cria contexto de empilhamento próprio (transform/z-index/etc.).
  const mounted = useSyncExternalStore(semAssinatura, () => true, () => false);

  // Registro na pilha + trava de scroll do body (restaura no último a fechar).
  useEffect(() => {
    if (!open) return;
    return registrarOverlay(id);
  }, [open, id]);

  // Esc fecha apenas o painel do topo da pilha.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && estaNoTopo(id)) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, id, onClose]);

  // Foco gerenciado (capability overlays-gestao-de-foco): entra no primeiro
  // campo do conteúdo (ou no título, quando o painel é de leitura ou a viewport
  // é estreita), fica preso enquanto este painel é o topo da pilha e volta ao
  // gatilho ao fechar.
  useDialogoFoco({
    aberto: open && mounted,
    ref: painelRef,
    escopoInicial: conteudoRef,
    alternativo: tituloRef,
    estaNoTopo: () => estaNoTopo(id),
  });

  if (!mounted) return null;

  // Scrim e painel são irmãos diretos do AnimatePresence (cada um com seu preset),
  // para que ambos animem a saída antes do desmonte. A pilha, a trava de scroll e
  // a devolução de foco são geridas nos efeitos acima (keyed em `open`), disparando
  // no início do fechamento — não ao fim da animação de saída.
  return createPortal(
    <AnimatePresence>
      {open && [
        <m.div
          key="scrim"
          {...motionPreset("scrim")}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          // Fora do reforço `inert`: o scrim precisa continuar clicável para
          // fechar o painel (capability overlays-gestao-de-foco).
          data-foco-livre=""
        />,
        <m.div
          key="panel"
          {...motionPreset("slideOver")}
          ref={painelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tituloId}
          tabIndex={-1}
          className="focus:outline-none fixed right-4 top-4 bottom-4 z-50 w-[480px] max-w-[calc(100vw-2rem)] bg-[var(--premium-white)] rounded-[var(--r-xl)] shadow-[var(--sh-lg)] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--premium-mist)]">
            <div className="flex min-w-0 items-center gap-3">
              {/* tabIndex -1: alvo do foco de leitura (painel sem campo) e do
                  foco inicial em viewport estreita, sem entrar na ordem do Tab. */}
              <h2
                id={tituloId}
                ref={tituloRef}
                tabIndex={-1}
                className="text-[18px] font-bold truncate focus:outline-none"
              >
                {title}
              </h2>
              {headerActions}
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="w-8 h-8 rounded-[var(--r-md)] flex items-center justify-center text-[var(--premium-gray)] hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div
            className="h-[2px] w-full overflow-hidden bg-[var(--premium-bone)]"
            style={{ visibility: loading ? "visible" : "hidden" }}
            role="progressbar"
            aria-hidden={!loading}
            aria-label="Salvando"
          >
            <div className="autosave-bar h-full bg-[var(--premium-ink)]" />
          </div>
          <div ref={conteudoRef} className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--premium-mist)] px-6 py-4">
              {footer}
            </div>
          )}
        </m.div>,
      ]}
    </AnimatePresence>,
    document.body
  );
}

const semAssinatura = () => () => {};
