"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLASSE_KBD } from "@/lib/kbd";
import { Tooltip } from "@/components/ui/tooltip";

export interface FabItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /**
   * Sequência de teclas que faz a mesma coisa (ex.: "c d"), exibida em `kbd` ao
   * lado do rótulo (capability atalhos-teclado, design D5). Sem a dica, o atalho
   * não é descoberto: ninguém adivinha uma tecla que a interface não mostra.
   */
  atalho?: string;
}

interface FabProps {
  /** Ação principal — primeira criação permitida (botão amarelo). */
  principal: FabItem;
  /** Ações secundárias (atalhos), reveladas ao expandir. */
  secundarias: FabItem[];
  /**
   * Sinal de intenção: o ponteiro entrou, o foco chegou ou o dedo tocou no FAB.
   * Quem hospeda usa para pré-carregar o que um formulário vai precisar antes
   * do clique (change fot-listas-enxutas, design D5). Pode disparar várias
   * vezes; quem recebe deve ser idempotente.
   */
  onIntencao?: () => void;
}

/**
 * Botão de ação flutuante (FAB) de criação, fixo no canto inferior direito.
 *
 * Minimalista: por padrão mostra só o botão principal amarelo. As ações
 * secundárias se revelam ao **passar o mouse** (ou foco) no desktop e ao
 * **tocar** no mobile (onde a principal também entra como primeiro item do
 * dial). O ícone permanece `plus` — no desktop o clique cria direto.
 *
 * Acessível: alvo ≥44px, foco visível, `aria-haspopup`/`aria-expanded`,
 * navegação por teclado (setas/Enter/Esc) e animação suprimida sob
 * `prefers-reduced-motion`. Estilo de marca fixo (amarelo + `--sh-gold`) nos
 * dois temas — docs/design-system/ui-guidelines.md §4.18.
 */
export function Fab({ principal, secundarias, onIntencao }: FabProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasHover, setHasHover] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Posição arrastável: deslocamento (px) a partir da âncora (canto inferior
  // direito). O usuário arrasta o FAB para alcançar algo embaixo dele. Persiste
  // em localStorage. x≤0 = move para a esquerda; y≤0 = move para cima.
  const STORAGE_KEY = "premium.fab.offset";
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        // Sync único da posição salva (localStorage) no mount — padrão aceito de
        // leitura de sistema externo; evita mismatch de hidratação (SSR sem window).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof v?.x === "number" && typeof v?.y === "number") setOffset(clampOffset(v));
      }
    } catch {
      /* sem persistência: começa na âncora padrão */
    }
  }, []);

  /** Mantém o FAB dentro da viewport. x≤0 (esquerda), y≤0 (cima). */
  function clampOffset(o: { x: number; y: number }) {
    if (typeof window === "undefined") return o;
    const maxLeft = Math.max(0, window.innerWidth - 120);
    const maxUp = Math.max(0, window.innerHeight - 160);
    return { x: Math.min(0, Math.max(-maxLeft, o.x)), y: Math.min(0, Math.max(-maxUp, o.y)) };
  }

  function onDragPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    justDragged.current = false; // toda interação começa limpa
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDragPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) {
      d.moved = true;
      setExpanded(false); // arrastar fecha o speed-dial
    }
    if (d.moved) setOffset(clampOffset({ x: d.baseX + dx, y: d.baseY + dy }));
  }

  function onDragPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
    if (d.moved) {
      justDragged.current = true; // suprime o clique que viria após o arraste
      setOffset((cur) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cur)); } catch { /* ignora */ }
        return cur;
      });
    }
  }

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    const update = () => setHasHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // No toque, a ação principal entra como primeiro item do dial.
  const items = hasHover ? secundarias : [principal, ...secundarias];

  const close = () => setExpanded(false);

  function handlePrincipalClick() {
    // Ignora o clique sintético que segue um arraste (não dispara criação).
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    if (hasHover) principal.onClick();
    else setExpanded((v) => !v);
  }

  function runItem(item: FabItem) {
    close();
    item.onClick();
  }

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onPointer(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [expanded]);

  function focusItem(idx: number) {
    const len = items.length;
    if (len === 0) return;
    itemRefs.current[(idx + len) % len]?.focus();
  }

  function onItemKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(idx - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(idx + 1);
    }
  }

  const labelClass =
    "text-[12px] font-bold uppercase tracking-wider bg-[var(--c-surface)] text-[var(--c-ink)] border border-[var(--premium-mist)] rounded-[var(--r-md)] px-3 py-[6px] shadow-[var(--sh-sm)] whitespace-nowrap";

  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col items-end"
      style={{
        right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
        bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      onMouseEnter={() => {
        onIntencao?.();
        if (hasHover) setExpanded(true);
      }}
      onMouseLeave={() => hasHover && setExpanded(false)}
      onPointerDown={() => onIntencao?.()}
      onFocus={() => {
        onIntencao?.();
        setExpanded(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
      }}
    >
      {/* Speed-dial: secundárias (e a principal, no modo toque) */}
      <div
        role="menu"
        aria-label="Ações de criação"
        className={cn(
          // Fora do fluxo: o dial não infla a área de hover do container —
          // só o botão amarelo dispara a expansão. O `pb-3` faz a ponte
          // (sem gap morto) entre o dial e o botão ao mover o mouse.
          "absolute bottom-full right-0 pb-3 flex flex-col items-end gap-3 origin-bottom",
          expanded ? "fab-dial-open" : "fab-dial-closed pointer-events-none"
        )}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center gap-3">
              <span className={cn(labelClass, "flex items-center gap-2")}>
                {item.label}
                {item.atalho && <kbd className={CLASSE_KBD}>{item.atalho}</kbd>}
              </span>
              <button
                ref={(el) => { itemRefs.current[idx] = el; }}
                role="menuitem"
                tabIndex={expanded ? 0 : -1}
                onClick={() => runItem(item)}
                onKeyDown={(e) => onItemKeyDown(e, idx)}
                aria-label={item.label}
                className="w-11 h-11 rounded-full bg-[var(--c-surface)] text-[var(--c-ink)] border border-[var(--premium-mist)] shadow-[var(--sh-md)] flex items-center justify-center cursor-pointer transition-colors hover:border-[var(--premium-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)]"
              >
                <Icon size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Botão principal — rótulo aparece ao expandir (desktop) */}
      <div className="flex items-center gap-3">
        {hasHover && (
          <span className={cn("fab-plabel flex items-center gap-2", expanded && "is-open", labelClass)}>
            {principal.label}
            {principal.atalho && <kbd className={CLASSE_KBD}>{principal.atalho}</kbd>}
          </span>
        )}
        <Tooltip label={`${principal.label} · arraste para mover`} side="left">
        <button
          type="button"
          onClick={handlePrincipalClick}
          onPointerDown={onDragPointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          aria-haspopup="menu"
          aria-expanded={expanded}
          aria-label={hasHover ? principal.label : "Abrir ações de criação"}
          style={{ touchAction: "none" }}
          className="w-14 h-14 rounded-full bg-[var(--yellow)] text-black shadow-[var(--sh-gold)] flex items-center justify-center cursor-grab active:cursor-grabbing transition-[background] duration-150 ease-[var(--ease)] hover:bg-[var(--gold)] active:bg-[var(--amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--premium-ink)]"
        >
          <Plus size={24} />
        </button>
        </Tooltip>
      </div>

      <style>{`
        .fab-dial-closed { opacity: 0; }
        .fab-plabel { opacity: 0; pointer-events: none; }
        .fab-plabel.is-open { opacity: 1; }
        @media (prefers-reduced-motion: no-preference) {
          .fab-dial-closed { transform: translateY(8px) scale(.96); }
          .fab-dial-open, .fab-dial-closed { transition: opacity .14s var(--ease), transform .14s var(--ease); }
          .fab-plabel { transition: opacity .14s var(--ease); }
        }
      `}</style>
    </div>
  );
}
