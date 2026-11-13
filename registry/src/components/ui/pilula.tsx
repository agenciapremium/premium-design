"use client";

import { Fragment, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { m } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionPreset } from "@/lib/motion";
import { popoverPos } from "@/lib/popover-pos";

/*
 * Pílula: fonte única do desenho de chip (ui-guidelines §3.4, padrão "Pílula de
 * ação e de seleção" do premium-design v0.10.0). A `FilterBar` importa as classes
 * daqui; o painel de cards flutuantes (capability painel-cards-flutuantes) usa
 * os componentes, com alvo de 40px e sombra para flutuar.
 */

// Pílula de filtro: espelha `.chip-filter` do protótipo (border-radius pill,
// fundo branco, borda mist, ícone cinza, texto steel; hover → borda steel).
export const chipBase =
  "relative inline-flex items-center gap-[7px] h-9 px-[14px] rounded-full border text-[13px] font-medium cursor-pointer transition-colors duration-150 whitespace-nowrap";
export const chipIdle =
  "bg-[var(--premium-white)] border-[var(--premium-mist)] text-[var(--premium-steel)] hover:border-[var(--premium-steel)]";
export const chipActive =
  "bg-[var(--premium-white)] border-[var(--premium-ink)] text-[var(--premium-ink)]";
// Pílula "ligada" (toggle ativo): espelha `.chip-auto` (fundo escuro, ícone amarelo).
// Fundo escuro fixo (--brand-ink) nos dois temas para o ícone amarelo ler;
// a borda --premium-ink vira contorno claro no escuro, destacando o chip.
export const chipOn = "bg-[var(--brand-ink)] border-[var(--premium-ink)] text-white";

/** Superfície dos menus de filtro (dropdown da `FilterBar` e da `PilulaSelect`). */
export const dropdownPanelClass =
  "z-[60] min-w-[200px] max-h-[320px] overflow-y-auto bg-[var(--premium-paper)] border border-[var(--premium-mist)] rounded-[var(--r-md)] shadow-[var(--sh-md)] p-1";

const focoPilula =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50),0_0_0_3px_var(--premium-ink)]";

interface VarianteProps {
  /** Recorte aplicado (borda e texto ink). */
  ativa?: boolean;
  /** Toggle ligado (fundo escuro fixo). */
  ligada?: boolean;
  /** Flutua sobre scrim: alvo de 40px e `--sh-md`. */
  flutuante?: boolean;
  /** Some com fade e sai da ordem do Tab, sem deslocar os vizinhos. */
  oculta?: boolean;
}

export function classesPilula({ ativa, ligada, flutuante, oculta }: VarianteProps, className?: string) {
  return cn(
    chipBase,
    ligada ? chipOn : ativa ? chipActive : chipIdle,
    focoPilula,
    flutuante && "pilula-flutuante h-auto min-h-10 shadow-[var(--sh-md)]",
    // `pilula-oculta` (globals.css) atrasa o `visibility` até o fade acabar.
    oculta && "pilula-oculta",
    className
  );
}

type PilulaProps = VarianteProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Pilula({ ativa, ligada, flutuante, oculta, className, type = "button", ...props }: PilulaProps) {
  return (
    <button
      {...props}
      type={type}
      aria-hidden={oculta || props["aria-hidden"]}
      tabIndex={oculta ? -1 : props.tabIndex}
      className={classesPilula({ ativa, ligada, flutuante, oculta }, className)}
    />
  );
}

export function PilulaLink({
  href,
  ativa,
  flutuante,
  className,
  children,
  onClick,
}: VarianteProps & { href: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={classesPilula({ ativa, flutuante }, className)}>
      {children}
    </Link>
  );
}

/**
 * Estado de um dropdown renderizado em **portal** com `position: fixed`
 * (capability filter-bar-busca-layout-global), necessário para não ser cortado
 * pela rolagem horizontal da barra. Fecha por clique fora / `Esc`, e reposiciona
 * em scroll/resize. Espelha o padrão de `multi-select.tsx`.
 */
export function useDropdownPortal() {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(ev: MouseEvent) {
      const t = ev.target as Node | null;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    function reposition() {
      setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  function abrir() {
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setOpen((o) => !o);
  }

  return { open, setOpen, rect, triggerRef, panelRef, abrir };
}

export function SingleSelectItem({
  checked,
  label,
  onClick,
  contagem,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  /** Número à direita (ex.: não lidas da categoria). Zero ou ausente não aparece. */
  contagem?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-selected={checked}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-[7px] rounded-[var(--r-sm)] text-[13px] text-left text-[var(--premium-ink)] hover:bg-[var(--premium-bone)] cursor-pointer",
        "focus-visible:outline-none focus-visible:bg-[var(--premium-bone)]",
        checked && "font-medium"
      )}
    >
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {contagem ? (
        <span className="shrink-0 text-[11px] font-bold tabular-nums text-[var(--premium-gray)]">{contagem}</span>
      ) : null}
      {checked && <Check size={13} className="shrink-0" />}
    </button>
  );
}

export interface OpcaoPilula<V extends string> {
  valor: V;
  rotulo: string;
  /** Rótulo exibido na pílula quando a opção está escolhida (o menu usa `rotulo`). */
  rotuloCurto?: string;
  contagem?: number;
  /** Rótulo de seção exibido antes desta opção (eyebrow + divisória). */
  secao?: string;
}

/**
 * Pílula de seleção única (padrão "Pílula de ação e de seleção"): gatilho em
 * pílula com ícone, rótulo truncado, contagem e chevron; menu da `FilterBar`
 * com seções, contagem por opção e navegação por setas.
 *
 * O `Esc` com o menu aberto fecha só o menu: o evento sai com
 * `preventDefault`, e overlays que o hospedam (o `PainelCards`) ignoram teclas
 * já tratadas.
 */
export function PilulaSelect<V extends string>({
  rotulo,
  valor,
  opcoes,
  onEscolher,
  icone: Icone,
  contagem,
  ativa,
  flutuante,
  largura,
  className,
}: {
  /** Nome acessível do menu e prefixo do nome do gatilho. */
  rotulo: string;
  valor: V;
  opcoes: OpcaoPilula<V>[];
  onEscolher: (v: V) => void;
  icone?: LucideIcon;
  /** Contagem exibida na pílula (selo ink). Zero não aparece. */
  contagem?: number;
  ativa?: boolean;
  flutuante?: boolean;
  /**
   * Largura fixa em px. Com ela, escolher outra opção não muda o tamanho da
   * pílula nem empurra as vizinhas; o rótulo trunca só se não couber. Combine
   * com `rotuloCurto` nas opções.
   */
  largura?: number;
  className?: string;
}) {
  const { open, setOpen, rect, triggerRef, panelRef, abrir } = useDropdownPortal();
  const atual = opcoes.find((o) => o.valor === valor);
  // Onde o menu abre, decidido no clique (ler ref no render é proibido). Dentro
  // de um diálogo modal, DENTRO dele: fora, o `aria-modal` tiraria o menu da
  // árvore de acessibilidade e o `inert` do overlay o alcançaria. O diálogo não
  // tem transform, então o `position: fixed` do menu segue relativo à janela.
  const [destino, setDestino] = useState<HTMLElement | null>(null);
  function alternar() {
    setDestino(triggerRef.current?.closest<HTMLElement>('[role="dialog"][aria-modal="true"]') ?? document.body);
    abrir();
  }

  // Ao abrir, o foco vai para a opção escolhida (ou a primeira).
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      const painel = panelRef.current;
      const alvo =
        painel?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ??
        painel?.querySelector<HTMLElement>('[role="option"]');
      alvo?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open, panelRef]);

  function fecharDevolvendoFoco() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function escolher(v: V) {
    fecharDevolvendoFoco();
    if (v !== valor) onEscolher(v);
  }

  function aoTeclarMenu(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      fecharDevolvendoFoco();
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    const itens = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    if (!itens.length) return;
    const i = itens.indexOf(document.activeElement as HTMLElement);
    let proximo: number | null = null;
    if (e.key === "ArrowDown") proximo = (i + 1) % itens.length;
    else if (e.key === "ArrowUp") proximo = (i - 1 + itens.length) % itens.length;
    else if (e.key === "Home") proximo = 0;
    else if (e.key === "End") proximo = itens.length - 1;
    if (proximo === null) return;
    e.preventDefault();
    itens[proximo].focus();
  }

  const nomeGatilho = `${rotulo}: ${atual?.rotulo ?? ""}${contagem ? `, ${contagem} não lidas` : ""}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={alternar}
        onKeyDown={(e) => {
          if (open && e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          } else if (!open && e.key === "ArrowDown") {
            e.preventDefault();
            alternar();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={nomeGatilho}
        style={largura ? { width: largura } : undefined}
        className={classesPilula({ ativa, flutuante }, cn(largura ? "max-w-full" : "max-w-[190px]", className))}
      >
        {Icone && <Icone size={14} aria-hidden className="shrink-0 text-[var(--premium-gray)]" />}
        <span className={cn("min-w-0 truncate", largura ? "flex-1 text-left" : undefined)}>
          {atual?.rotuloCurto ?? atual?.rotulo}
        </span>
        {contagem ? (
          <span
            aria-hidden
            className="shrink-0 text-[11px] font-bold bg-[var(--premium-ink)] text-[var(--premium-paper)] rounded-full px-[6px] min-w-[18px] text-center tabular-nums"
          >
            {contagem > 99 ? "99+" : contagem}
          </span>
        ) : null}
        <ChevronDown
          size={14}
          aria-hidden
          className={cn(
            "-mr-1 shrink-0 text-[var(--premium-gray)] transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>
      {open &&
        rect &&
        destino &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            role="listbox"
            aria-label={rotulo}
            onKeyDown={aoTeclarMenu}
            style={popoverPos(rect, Math.max(rect.width, 250), 320)}
            className={dropdownPanelClass}
          >
            {opcoes.map((o, i) => (
              // Sem contêiner por opção: filho de `listbox` é `option`; divisória
              // e rótulo de seção ficam fora da árvore acessível.
              <Fragment key={o.valor}>
                {o.secao && (
                  <>
                    {i > 0 && <div aria-hidden className="mx-[2px] my-1 border-t border-[var(--premium-mist)]" />}
                    <div aria-hidden className="eyebrow px-2 pb-[2px] pt-[6px]">
                      {o.secao}
                    </div>
                  </>
                )}
                <SingleSelectItem
                  checked={o.valor === valor}
                  label={o.rotulo}
                  contagem={o.contagem}
                  onClick={() => escolher(o.valor)}
                />
              </Fragment>
            ))}
          </m.div>,
          destino
        )}
    </>
  );
}
