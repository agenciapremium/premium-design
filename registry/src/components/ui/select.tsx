"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { Check, ChevronDown, Search } from "lucide-react";
import { motionPreset } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Evento sintético compatível com os call sites `onChange={(e) => ...e.target.value}`. */
export interface SelectChangeEvent {
  target: { value: string; name?: string };
}

export interface SelectOption {
  value: string;
  label: string;
  /** Visível, mas não selecionável (ex.: projeto em StandBy). */
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  options: SelectOption[];
  /** Item de valor vazio no topo da lista (equivale à option vazia do nativo). */
  placeholder?: string;
  /** Controlado. */
  value?: string;
  defaultValue?: string;
  onChange?: (e: SelectChangeEvent) => void;
  disabled?: boolean;
  /** Advisory (`aria-required`): a validação obrigatória é a do servidor/Zod. */
  required?: boolean;
  className?: string;
  /**
   * `field` (padrão): campo de formulário completo (moldura de input).
   * `inline`: gatilho compacto sem moldura, para embutir em células/pílulas
   * (ex.: status na tabela de atividades) — o chamador estiliza via className.
   */
  variant?: "field" | "inline";
  /** Rótulo acessível do gatilho quando não há `label` visível (ex.: inline). */
  ariaLabel?: string;
  /** Estilo inline do gatilho (ex.: cor do texto da pílula de status). */
  style?: React.CSSProperties;
}

/** A partir deste tamanho a lista ganha campo de busca (como o picker de responsável). */
const BUSCA_A_PARTIR_DE = 8;

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Select custom do Design System (substitui o `<select>` nativo) — mesmo padrão
 * dos popovers flutuantes do workflow (responsável / nova etapa, ui-guidelines
 * §4.7, §4.11): painel portal com `--sh-lg`, itens de 40px com hover bone e
 * busca filtrável em listas longas. API compatível com o antigo Select nativo
 * (`options`, `placeholder`, `value`/`defaultValue`, `onChange` com
 * `e.target.value`, `name` espelhado em hidden input para FormData).
 *
 * Acessível: `role="combobox"` + `role="listbox"`, navegação ↑/↓/Enter/Esc,
 * foco visível, alvo ≥ 40px; fecha por Esc/clique fora; reposiciona em
 * scroll/resize (funciona dentro do SlideOver rolável).
 */
export function Select({
  id,
  name,
  label,
  error,
  options,
  placeholder,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  className,
  variant = "field",
  ariaLabel,
  style,
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const listboxId = `${fieldId}-listbox`;
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const selected = controlled ? value : internal;
  const selectedLabel = options.find((o) => o.value === selected)?.label;

  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [rect, setRect] = useState<{ left: number; bottom: number; width: number } | null>(null);
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const comBusca = options.length >= BUSCA_A_PARTIR_DE;

  // Itens visíveis: placeholder (valor vazio) + opções filtradas pela busca.
  const itens = useMemo(() => {
    const base: (SelectOption & { isPlaceholder?: boolean })[] = [];
    const termo = norm(busca.trim());
    if (placeholder && !termo) base.push({ value: "", label: placeholder, isPlaceholder: true });
    for (const o of options) {
      if (!termo || norm(o.label).includes(termo)) base.push(o);
    }
    return base;
  }, [options, placeholder, busca]);

  function abrir() {
    if (disabled) return;
    setBusca("");
    // Destaque inicial no item selecionado (offset do placeholder, lista cheia).
    const idx = options.findIndex((o) => o.value === selected && selected !== "");
    setHighlight(idx >= 0 ? idx + (placeholder ? 1 : 0) : 0);
    setOpen(true);
  }

  function fechar(devolverFoco = false) {
    setOpen(false);
    if (devolverFoco) triggerRef.current?.focus();
  }

  function selecionar(v: string) {
    if (!controlled) setInternal(v);
    onChange?.({ target: { value: v, name } });
    fechar(true);
  }

  // Posição ancorada ao gatilho; atualiza em scroll/resize (SlideOver rola).
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setRect({ left: r.left, bottom: r.bottom, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Fecha por clique fora; Esc é tratado no onKeyDown do painel/gatilho.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      fechar();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Foco inicial: busca (quando existe) ou item destacado.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      if (comBusca) buscaRef.current?.focus();
      else itemRefs.current[highlight]?.focus();
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Mantém o item destacado visível ao navegar pelo teclado.
  useEffect(() => {
    if (!open) return;
    itemRefs.current[highlight]?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  function mover(delta: number) {
    if (itens.length === 0) return;
    setHighlight((h) => {
      const next = Math.min(itens.length - 1, Math.max(0, h + delta));
      if (!comBusca) itemRefs.current[next]?.focus();
      return next;
    });
  }

  function onPainelKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation(); // dentro de SlideOver, fecha só o select
      fechar(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      mover(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      mover(-1);
    } else if (e.key === "Home" && !comBusca) {
      e.preventDefault();
      setHighlight(0);
      itemRefs.current[0]?.focus();
    } else if (e.key === "End" && !comBusca) {
      e.preventDefault();
      setHighlight(itens.length - 1);
      itemRefs.current[itens.length - 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = itens[highlight];
      if (item && !item.disabled) selecionar(item.value);
    } else if (e.key === "Tab") {
      fechar();
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir();
    }
  }

  const maxAltura = 320;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const inline = variant === "inline";

  return (
    <div className={inline ? "inline-flex" : "flex flex-col gap-[7px]"}>
      {!inline && label && (
        <label
          htmlFor={fieldId}
          className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]"
        >
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-required={required || undefined}
        aria-label={ariaLabel ?? label}
        style={style}
        onClick={() => (open ? fechar() : abrir())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          inline
            ? "inline-flex items-center gap-1 text-left font-[family-name:var(--font-ubuntu),system-ui,sans-serif] outline-none cursor-pointer focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
            : cn(
                "w-full flex items-center justify-between gap-2 border border-[var(--premium-mist)] rounded-[var(--r-md)] px-[14px] py-[11px] text-[13px] text-left font-[family-name:var(--font-ubuntu),system-ui,sans-serif] outline-none transition-all duration-150 bg-[var(--c-surface)] cursor-pointer",
                "focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)]",
                open && "border-[var(--premium-ink)] shadow-[0_0_0_2px_var(--yellow-50)]",
                error && "border-[var(--danger)]"
              ),
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            // `min-w-0` deixa o `truncate` cortar dentro do gatilho flex (inline
            // ou field) — sem ele, o rótulo longo transborda em vez de reticenciar.
            "min-w-0 truncate",
            selectedLabel
              ? inline
                ? "text-current"
                : "text-[var(--premium-ink)]"
              : "text-[var(--premium-gray)]"
          )}
        >
          {selectedLabel ?? placeholder ?? "Selecione..."}
        </span>
        <ChevronDown
          size={inline ? 13 : 15}
          className={cn(
            "shrink-0 transition-transform duration-150 motion-reduce:transition-none",
            inline ? "text-current opacity-70" : "text-[var(--premium-gray)]",
            open && "rotate-180"
          )}
        />
      </button>
      {name && <input type="hidden" name={name} value={selected} />}
      {!inline && error && <span className="text-[11px] text-[var(--danger)]">{error}</span>}

      {open && rect && typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={popRef}
            {...motionPreset("menu")}
            // Marcador para popovers hospedeiros ignorarem cliques aqui dentro
            // (o painel vive em portal, fora da árvore DOM do hospedeiro).
            data-select-pop=""
            onKeyDown={onPainelKeyDown}
            style={{
              position: "fixed",
              left: Math.max(8, Math.min(rect.left, vw - Math.max(rect.width, inline ? 200 : 0) - 8)),
              top: Math.min(rect.bottom + 6, vh - maxAltura),
              width: Math.max(rect.width, inline ? 200 : 0),
            }}
            className="z-[60] rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-2 shadow-[var(--sh-lg)]"
          >
            {comBusca && (
              <div className="relative mb-2">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--premium-gray)]"
                />
                <input
                  ref={buscaRef}
                  type="text"
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    // Lista muda — destaque volta ao primeiro resultado.
                    setHighlight(0);
                  }}
                  placeholder="Buscar..."
                  aria-label={label ? `Buscar em ${label}` : "Buscar opção"}
                  className="w-full rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] py-2 pl-8 pr-3 text-[13px] focus:border-[var(--premium-ink)] focus:outline-none focus:shadow-[0_0_0_2px_var(--yellow-50)]"
                />
              </div>
            )}
            <div
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="max-h-[256px] overflow-y-auto kanban-col-scroll flex flex-col"
            >
              {itens.map((o, i) => {
                const ativo = o.value === selected && !o.isPlaceholder;
                return (
                  <button
                    key={`${o.value}-${i}`}
                    ref={(el) => { itemRefs.current[i] = el; }}
                    type="button"
                    role="option"
                    aria-selected={ativo}
                    aria-disabled={o.disabled || undefined}
                    disabled={o.disabled}
                    tabIndex={comBusca ? -1 : undefined}
                    onClick={() => {
                      if (!o.disabled) selecionar(o.value);
                    }}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "flex min-h-[40px] w-full items-center gap-2 rounded-[var(--r-md)] px-3 text-left text-[13px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]",
                      o.isPlaceholder ? "text-[var(--premium-gray)]" : "text-[var(--c-ink)]",
                      o.disabled && "cursor-not-allowed text-[var(--premium-gray)]",
                      i === highlight && "bg-[var(--premium-bone)]",
                      ativo && "font-medium"
                    )}
                  >
                    <span className="flex-1 min-w-0 truncate">{o.label}</span>
                    {ativo && <Check size={15} className="shrink-0 text-[var(--premium-ink)]" />}
                  </button>
                );
              })}
              {itens.length === 0 && (
                <div className="py-6 text-center text-[12.5px] text-[var(--premium-gray)]">
                  Nenhuma opção encontrada.
                </div>
              )}
            </div>
          </m.div>,
          document.body
        )}
    </div>
  );
}
