"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatBR, segParaISO, splitISO, type Segmentos } from "@/components/ui/date-picker-datas";
import { CalendarioPainel } from "@/components/ui/date-picker-calendario";
import { CampoSegmentos } from "@/components/ui/date-picker-segmentos";

/** Evento sintético compatível com os call sites `onChange={(e) => ...e.target.value}`. */
export interface DateChangeEvent {
  target: { value: string; name?: string };
}

interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  /** Controlado: valor no formato yyyy-mm-dd (igual ao input nativo). */
  value?: string;
  defaultValue?: string;
  onChange?: (e: DateChangeEvent) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
  /**
   * `field` (padrão): campo de formulário completo (moldura de input) com **entrada por
   * teclado** em segmentos dd/mm/aaaa (auto-avanço) + ícone que abre o calendário.
   * `inline`: gatilho compacto sem moldura, para embutir em chips/células
   * (ex.: período do FilterBar) — só clique abre o calendário, sem digitação.
   */
  variant?: "field" | "inline";
  /** Rótulo acessível do gatilho quando não há `label` visível (ex.: inline). */
  ariaLabel?: string;
}

export function DatePicker({
  id,
  name,
  label,
  error,
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled,
  placeholder = "dd/mm/aaaa",
  min,
  max,
  className,
  variant = "field",
  ariaLabel,
}: DatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const labelId = `${fieldId}-lbl`;
  const panelId = `${fieldId}-cal`;
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const selected = controlled ? value : internal;
  const inline = variant === "inline";

  // Segmentos digitados (variant field): dd/mm/aaaa distintos do ISO comitado.
  const [seg, setSeg] = useState<Segmentos>(() => splitISO(value ?? defaultValue ?? ""));

  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{
    left: number;
    top: number;
    bottom: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const diaRef = useRef<HTMLInputElement>(null);
  const mesRef = useRef<HTMLInputElement>(null);
  const anoRef = useRef<HTMLInputElement>(null);
  const iconeRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Mês exibido: do valor selecionado, ou hoje.
  const base = selected && /^\d{4}-\d{2}-\d{2}$/.test(selected) ? selected : null;
  const [view, setView] = useState(() => {
    const d = base ? new Date(`${base}T00:00:00`) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const segFocado = () => {
    const a = typeof document !== "undefined" ? document.activeElement : null;
    return a === diaRef.current || a === mesRef.current || a === anoRef.current;
  };

  // Reconcilia os segmentos quando o valor comitado muda por fora e NENHUM segmento
  // está em foco (ajuste de estado durante o render — padrão recomendado do React,
  // https://react.dev/learn/you-might-not-need-an-effect — evita sobrescrever a digitação).
  const [selAnterior, setSelAnterior] = useState(selected);
  if (selected !== selAnterior) {
    setSelAnterior(selected);
    if (!segFocado()) setSeg(splitISO(selected));
  }

  // Ao abrir, reposiciona e sincroniza o mês com o valor atual.
  function abrir() {
    if (disabled) return;
    if (base) {
      const d = new Date(`${base}T00:00:00`);
      setView({ year: d.getFullYear(), month: d.getMonth() });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setRect({ left: r.left, top: r.top, bottom: r.bottom, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      fechar();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function fechar() {
    setOpen(false);
    onBlur?.();
  }

  // Esc no gatilho/painel fecha SÓ o calendário (stopPropagation): dentro de um
  // popover hospedeiro (ex.: prazos do workflow) ou SlideOver, o pai fica aberto.
  function onEscKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      fechar();
      (inline ? triggerRef.current : diaRef.current)?.focus();
    }
  }

  /** Comita o valor ISO sem mexer no painel/foco (usado pela digitação). */
  function comitarValor(iso: string) {
    if (!controlled) setInternal(iso);
    onChange?.({ target: { value: iso, name } });
  }

  /** Seleção pelo calendário (ou Hoje/Limpar): comita, preenche os segmentos e fecha. */
  function selecionar(iso: string) {
    comitarValor(iso);
    setSeg(splitISO(iso));
    setOpen(false);
    onBlur?.();
  }

  function desabilitado(iso: string) {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  }

  // Digitação num segmento: só dígitos, comprimento máx., auto-avanço ao encher, e
  // commit quando dia+mês+ano formam uma data válida dentro de min/max.
  function onSegInput(
    campo: keyof Segmentos,
    valor: string,
    proximo?: React.RefObject<HTMLInputElement | null>,
  ) {
    const maxLen = campo === "yyyy" ? 4 : 2;
    const v = valor.replace(/\D/g, "").slice(0, maxLen);
    const novo = { ...seg, [campo]: v };
    setSeg(novo);
    if (v.length === maxLen && proximo?.current) {
      proximo.current.focus();
      proximo.current.select();
    }
    if (!novo.dd && !novo.mm && !novo.yyyy) {
      comitarValor(""); // esvaziou tudo → limpar
      return;
    }
    const iso = segParaISO(novo);
    if (iso && !desabilitado(iso)) {
      comitarValor(iso);
      setView({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) - 1 });
    }
  }

  function onSegKeyDown(
    e: React.KeyboardEvent,
    campo: keyof Segmentos,
    anterior?: React.RefObject<HTMLInputElement | null>,
  ) {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      abrir();
      return;
    }
    // Backspace num segmento vazio volta o foco ao segmento anterior.
    if (e.key === "Backspace" && seg[campo] === "" && anterior?.current) {
      e.preventDefault();
      anterior.current.focus();
      anterior.current.select();
      return;
    }
    onEscKeyDown(e);
  }

  // Blur de um segmento: se o foco sai de verdade do campo (não vai a outro segmento,
  // ao ícone ou ao painel), reverte segmentos inválidos/incompletos e dispara onBlur.
  function onSegBlur(e: React.FocusEvent<HTMLInputElement>) {
    const alvo = e.relatedTarget as Node | null;
    const dentro =
      !!alvo &&
      (alvo === diaRef.current ||
        alvo === mesRef.current ||
        alvo === anoRef.current ||
        !!iconeRef.current?.contains(alvo) ||
        !!popRef.current?.contains(alvo));
    if (dentro) return;
    const preenchido = seg.dd || seg.mm || seg.yyyy;
    if (preenchido && segParaISO(seg) === null) setSeg(splitISO(selected));
    onBlur?.();
  }

  function navMes(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      const year = v.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  }

  return (
    <div className={inline ? "inline-flex" : "flex flex-col gap-[7px]"}>
      {!inline && label && (
        <label
          id={labelId}
          htmlFor={fieldId}
          className="text-[11px] font-bold tracking-wider text-[var(--premium-gray)] uppercase"
        >
          {label}
        </label>
      )}

      {inline ? (
        <button
          ref={(el) => {
            triggerRef.current = el;
          }}
          id={fieldId}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? fechar() : abrir())}
          onKeyDown={onEscKeyDown}
          className={cn(
            "inline-flex cursor-pointer items-center gap-[6px] rounded-[var(--r-sm)] py-[3px] text-left font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[12.5px] outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]",
            disabled && "cursor-not-allowed opacity-60",
            className,
          )}
        >
          <span className={selected ? "text-current" : "text-[var(--premium-gray)]"}>
            {selected ? formatBR(selected) : placeholder}
          </span>
        </button>
      ) : (
        <CampoSegmentos
          grupoRef={(el) => {
            triggerRef.current = el;
          }}
          fieldId={fieldId}
          labelId={labelId}
          panelId={panelId}
          label={label}
          ariaLabel={ariaLabel}
          seg={seg}
          open={open}
          disabled={disabled}
          error={error}
          className={className}
          diaRef={diaRef}
          mesRef={mesRef}
          anoRef={anoRef}
          iconeRef={iconeRef}
          onSegInput={onSegInput}
          onSegKeyDown={onSegKeyDown}
          onSegBlur={onSegBlur}
          onAlternar={() => (open ? fechar() : abrir())}
        />
      )}

      {name && <input type="hidden" name={name} value={selected} />}
      {error && <span className="text-[11px] text-[var(--danger)]">{error}</span>}

      {open && rect && typeof document !== "undefined" && (
        <CalendarioPainel
          popRef={popRef}
          panelId={panelId}
          rect={rect}
          view={view}
          selected={selected}
          onEscKeyDown={onEscKeyDown}
          onNavMes={navMes}
          onSelecionar={selecionar}
          desabilitado={desabilitado}
        />
      )}
    </div>
  );
}
