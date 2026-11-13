"use client";

import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { painelVariantes, type PainelCustom } from "@/lib/motion";
import { useDialogoFoco } from "@/lib/hooks/use-dialogo-foco";
import { estaNoTopo, registrarOverlay } from "@/lib/overlay-pilha";
import { posicaoPainel } from "@/lib/painel-cards-pos";

interface PainelCardsProps {
  open: boolean;
  onClose: () => void;
  /** Nome do diálogo (h2 visualmente oculto, alvo do foco ao abrir). */
  titulo: string;
  /** Gatilho que abriu o painel: o X fica sobre ele (design D1). */
  ancoraRef?: RefObject<HTMLElement | null>;
  /** Pílulas do topo, à esquerda do X. Cada filho vira uma peça animada. */
  topo?: ReactNode;
  /** Pílulas da base, alinhadas à direita. Sem filhos, a base não existe. */
  base?: ReactNode;
  /** Nome acessível do X. */
  rotuloFechar?: string;
  /** Quantos itens a lista mostra: a base entra depois da cascata deles. */
  totalItens?: number;
  /**
   * Mude o valor (ex.: um contador) para a lista voltar ao topo, como quando
   * chega um item novo em tempo real.
   */
  rolarAoTopo?: number;
  /** Lista: filhos envoltos em `PainelCardsItem`. */
  children: ReactNode;
}

const PainelContexto = createContext<{ reduzido: boolean }>({ reduzido: false });

const semAssinatura = () => () => {};

/**
 * Painel de cards flutuantes (capability painel-cards-flutuantes; padrão do
 * premium-design v0.10.0). Diálogo modal SEM moldura: topo com pílulas e o X,
 * lista de cards soltos e base com pílulas, cada peça com superfície própria
 * sobre o scrim. Primeiro uso: a central de notificações do sino.
 *
 * Reaproveita o contrato de overlay do `SlideOver`: pilha compartilhada
 * (`overlay-pilha`), `Esc` só no topo, foco gerenciado por `useDialogoFoco`
 * (entra no título oculto, fica preso, volta ao gatilho) e trava de rolagem.
 * A animação é por peça (`painelVariantes`): o X gira no lugar do gatilho, as
 * pílulas deslizam dele, os itens descem em cascata e a base sobe por último;
 * ao fechar, tudo sai de baixo para cima em até 260ms.
 */
export function PainelCards({
  open,
  onClose,
  titulo,
  ancoraRef,
  topo,
  base,
  rotuloFechar = "Fechar",
  totalItens = 0,
  rolarAoTopo,
  children,
}: PainelCardsProps) {
  const id = useId();
  const tituloId = useId();
  const reduzido = useReducedMotion() ?? false;
  const painelRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);

  // Portal só no cliente (o `body` não existe no servidor).
  const mounted = useSyncExternalStore(semAssinatura, () => true, () => false);

  // Pilha + trava de rolagem, e a posição medida DEPOIS da trava (sumir a
  // barra de rolagem da página pode deslocar o gatilho). Layout effect: a
  // posição é escrita no DOM antes da primeira pintura, sem salto.
  useLayoutEffect(() => {
    if (!open || !mounted) return;
    const liberar = registrarOverlay(id);
    function posicionar() {
      const el = painelRef.current;
      if (!el) return;
      const r = ancoraRef?.current?.getBoundingClientRect() ?? null;
      const pos = posicaoPainel(r, window.innerWidth);
      el.dataset.modo = pos.modo;
      if (pos.modo === "ancorado") {
        el.style.setProperty("--painel-topo", `${pos.topo}px`);
        el.style.setProperty("--painel-direita", `${pos.direita}px`);
      }
    }
    posicionar();
    window.addEventListener("resize", posicionar);
    return () => {
      window.removeEventListener("resize", posicionar);
      liberar();
    };
  }, [open, mounted, id, ancoraRef]);

  // `Esc` fecha só quando o painel é o topo da pilha E a tecla nasceu nele (ou
  // com o foco solto). Com uma confirmação ou o menu de uma pílula por cima, o
  // foco está neles: quem responde são eles (regra da gaveta de ferramentas).
  useEffect(() => {
    if (!open) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (!estaNoTopo(id)) return;
      const alvo = e.target as Node | null;
      const dentro = !!alvo && !!painelRef.current?.contains(alvo);
      const solto = !alvo || alvo === document.body || alvo === document.documentElement;
      if (!dentro && !solto) return;
      onClose();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [open, id, onClose]);

  useDialogoFoco({
    aberto: open && mounted,
    ref: painelRef,
    inicial: tituloRef,
    alternativo: tituloRef,
    estaNoTopo: () => estaNoTopo(id),
  });

  // Degradê na borda que ainda tem conteúdo (`data-mais`, CSS em
  // `.pilha-rolagem`). Escrito direto no DOM: medir a cada rolagem não pode
  // custar um render.
  const medir = useCallback(() => {
    const el = listaRef.current;
    if (!el) return;
    const acima = el.scrollTop > 2;
    const abaixo = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    const mais = acima && abaixo ? "ambos" : acima ? "acima" : abaixo ? "abaixo" : "";
    if (mais) el.dataset.mais = mais;
    else delete el.dataset.mais;
  }, []);
  useEffect(() => {
    if (!open || !mounted) return;
    const lista = listaRef.current;
    const conteudo = conteudoRef.current;
    if (!lista || !conteudo || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => medir());
    ro.observe(lista);
    ro.observe(conteudo);
    return () => ro.disconnect();
  }, [open, mounted, medir]);

  useEffect(() => {
    if (!rolarAoTopo) return;
    listaRef.current?.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
  }, [rolarAoTopo, reduzido]);

  if (!mounted) return null;

  const c: PainelCustom = { reduzido };
  const pecasTopo = Children.toArray(topo);
  const pecasBase = Children.toArray(base);

  return createPortal(
    <AnimatePresence>
      {open && [
        <m.div
          key="scrim"
          variants={painelVariantes.scrim}
          custom={c}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          // Fora do reforço `inert`: o scrim continua clicável para fechar.
          data-foco-livre=""
        />,
        <m.div
          key="painel"
          ref={painelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tituloId}
          tabIndex={-1}
          initial="hidden"
          animate="visible"
          exit="exit"
          // `data-modo` só existe quando ancorado, escrito pelo layout effect
          // (nunca pelo JSX, para um render não desfazer a medida).
          className={cn(
            "fixed z-50 flex flex-col gap-3 outline-none",
            // Livre (celular, ou sem gatilho visível): largura da tela.
            "left-4 right-4 top-3 max-h-[calc(100dvh-24px)]",
            // Ancorado: X sobre o gatilho, 420px (design D1/D2).
            "data-[modo=ancorado]:left-auto data-[modo=ancorado]:right-[var(--painel-direita)] data-[modo=ancorado]:top-[var(--painel-topo)] data-[modo=ancorado]:w-[420px] data-[modo=ancorado]:max-h-[calc(100dvh-2*var(--painel-topo))]"
          )}
        >
          <PainelContexto.Provider value={{ reduzido }}>
            <h2 id={tituloId} ref={tituloRef} tabIndex={-1} className="sr-only">
              {titulo}
            </h2>

            <div className="flex shrink-0 items-center gap-2">
              {pecasTopo.map((peca, i) => (
                <m.div
                  key={i}
                  variants={painelVariantes.pilula}
                  // i = 0 é a pílula mais perto do X: ela sai dele primeiro.
                  custom={{ reduzido, i: pecasTopo.length - 1 - i }}
                  className="flex min-w-0 shrink"
                >
                  {peca}
                </m.div>
              ))}
              <m.button
                type="button"
                variants={painelVariantes.fechar}
                custom={c}
                onClick={onClose}
                aria-label={rotuloFechar}
                className={cn(
                  "relative ml-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full",
                  "border border-[var(--premium-mist)] bg-[var(--premium-white)] text-[var(--premium-steel)] shadow-[var(--sh-md)]",
                  "transition-colors duration-150 hover:border-[var(--premium-ink)] hover:text-[var(--premium-ink)]",
                  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50),0_0_0_3px_var(--premium-ink)]"
                )}
              >
                <X size={18} aria-hidden />
              </m.button>
            </div>

            {/* Folga de 20px nas laterais e 12px em cima e embaixo (padding +
                margem negativa): a sombra e o hover dos cards não são cortados
                pela rolagem. A folga é da lista, então clicar nela não fecha. */}
            <div
              ref={listaRef}
              onScroll={medir}
              className="pilha-rolagem -mx-5 -my-3 min-h-0 flex-[0_1_auto] px-5 py-3"
            >
              <div ref={conteudoRef} className="flex flex-col gap-2">
                {children}
              </div>
            </div>

            {pecasBase.length > 0 && (
              <div className="flex shrink-0 items-center justify-end gap-2">
                {pecasBase.map((peca, i) => (
                  <m.div
                    key={i}
                    variants={painelVariantes.base}
                    custom={{ reduzido, i: totalItens }}
                    // A primeira peça da base (quando há mais de uma) vai para a
                    // esquerda: é a ação secundária (ex.: ativar o sistema).
                    className={cn("flex min-w-0", pecasBase.length > 1 && i === 0 && "mr-auto")}
                  >
                    {peca}
                  </m.div>
                ))}
              </div>
            )}
          </PainelContexto.Provider>
        </m.div>,
      ]}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Item da lista do painel (card ou rótulo de dia). `indice` de cima para baixo
 * e `total` da lista dirigem a cascata de entrada e a saída de baixo para cima;
 * `chega` marca o item que acabou de chegar em tempo real (entra pela direita).
 */
export function PainelCardsItem({
  indice,
  total,
  chega = false,
  itemId,
  className,
  children,
}: {
  indice: number;
  total: number;
  chega?: boolean;
  /** Identifica o item no DOM (`data-item-id`), para o hospedeiro recolhê-lo. */
  itemId?: string;
  className?: string;
  children: ReactNode;
}) {
  const { reduzido } = useContext(PainelContexto);
  return (
    <m.div
      data-item-id={itemId}
      variants={painelVariantes.item}
      custom={{ reduzido, i: indice, j: total - 1 - indice, chega } satisfies PainelCustom}
      style={{ originX: 1, originY: 0 }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/** Rótulo de dia do painel: pílula pequena (texto solto sobre o scrim não passa AA). */
export function PainelCardsRotulo({ children }: { children: ReactNode }) {
  return (
    <h3 className="inline-flex h-6 items-center self-start rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] px-[10px] text-[10px] font-bold uppercase tracking-[.2em] text-[var(--premium-gray)] shadow-[var(--sh-sm)]">
      {children}
    </h3>
  );
}
