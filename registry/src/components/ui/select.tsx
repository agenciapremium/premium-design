"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePainelAncorado } from "@/lib/hooks/use-painel-ancorado";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectPainel, type ItemSelect } from "@/components/ui/select-painel";

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
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const comBusca = options.length >= BUSCA_A_PARTIR_DE;

  // Itens visíveis: placeholder (valor vazio) + opções filtradas pela busca.
  const itens = useMemo(() => {
    const base: ItemSelect[] = [];
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

  // Posição ancorada ao gatilho, atualizada em scroll/resize (SlideOver rola),
  // e fechamento por clique fora; Esc é tratado no onKeyDown do painel/gatilho.
  const rect = usePainelAncorado({
    aberto: open,
    gatilhoRef: triggerRef,
    painelRef: popRef,
    aoClicarFora: () => fechar(),
  });

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

  const inline = variant === "inline";

  return (
    <div className={inline ? "inline-flex" : "flex flex-col gap-[7px]"}>
      {!inline && label && (
        <label
          htmlFor={fieldId}
          className="text-[11px] font-bold tracking-wider text-[var(--premium-gray)] uppercase"
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
            ? "inline-flex cursor-pointer items-center gap-1 text-left font-[family-name:var(--font-ubuntu),system-ui,sans-serif] outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
            : cn(
                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] px-[14px] py-[11px] text-left font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[13px] transition-all duration-150 outline-none",
                "focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)]",
                open && "border-[var(--premium-ink)] shadow-[0_0_0_2px_var(--yellow-50)]",
                error && "border-[var(--danger)]",
              ),
          disabled && "cursor-not-allowed opacity-60",
          className,
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
              : "text-[var(--premium-gray)]",
          )}
        >
          {selectedLabel ?? placeholder ?? "Selecione..."}
        </span>
        <ChevronDown
          size={inline ? 13 : 15}
          className={cn(
            "shrink-0 transition-transform duration-150 motion-reduce:transition-none",
            inline ? "text-current opacity-70" : "text-[var(--premium-gray)]",
            open && "rotate-180",
          )}
        />
      </button>
      {name && <input type="hidden" name={name} value={selected} />}
      {!inline && error && <span className="text-[11px] text-[var(--danger)]">{error}</span>}

      {open && rect && typeof document !== "undefined" && (
        <SelectPainel
          popRef={popRef}
          buscaRef={buscaRef}
          itemRefs={itemRefs}
          rect={rect}
          inline={inline}
          comBusca={comBusca}
          busca={busca}
          onBusca={(termo) => {
            setBusca(termo);
            // Lista muda — destaque volta ao primeiro resultado.
            setHighlight(0);
          }}
          label={label}
          listboxId={listboxId}
          itens={itens}
          selected={selected}
          highlight={highlight}
          onHighlight={setHighlight}
          onSelecionar={selecionar}
          onPainelKeyDown={onPainelKeyDown}
        />
      )}
    </div>
  );
}
