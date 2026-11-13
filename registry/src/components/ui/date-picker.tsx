"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { popoverPos, PAINEL_W, PAINEL_H_EST } from "@/lib/popover-pos";
import { motionPreset } from "@/lib/motion";

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

const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
/** "yyyy-mm-dd" → "dd/mm/aaaa" (date-only, sem fuso). */
function formatBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}
function toISO(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

type Segmentos = { dd: string; mm: string; yyyy: string };
const SEG_VAZIO: Segmentos = { dd: "", mm: "", yyyy: "" };

/** "yyyy-mm-dd" → segmentos { dd, mm, yyyy }; vazio se não for ISO válido. */
function splitISO(iso: string): Segmentos {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { dd: m[3], mm: m[2], yyyy: m[1] } : { ...SEG_VAZIO };
}

/** dia/mês/ano → ISO "yyyy-mm-dd" válido ou null. Date-only, sem `new Date(texto)`. */
function segParaISO(seg: Segmentos): string | null {
  if (!seg.dd || !seg.mm || seg.yyyy.length !== 4) return null;
  const dia = Number(seg.dd);
  const mes = Number(seg.mm);
  const ano = Number(seg.yyyy);
  if (mes < 1 || mes > 12) return null;
  // Dia 0 do mês seguinte (mês 1-based aqui) = último dia do mês → cobre bissexto.
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) return null;
  return toISO(ano, mes - 1, dia);
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
  const [rect, setRect] = useState<{ left: number; top: number; bottom: number; width: number } | null>(null);
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
    proximo?: React.RefObject<HTMLInputElement | null>
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
    anterior?: React.RefObject<HTMLInputElement | null>
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

  // Grade do mês.
  const firstDow = new Date(view.year, view.month, 1).getDay();
  const diasNoMes = new Date(view.year, view.month + 1, 0).getDate();
  const hojeISO = (() => {
    const d = new Date();
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  })();
  const celulas: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  function navMes(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      const year = v.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  }

  const segInputCls =
    "bg-transparent text-center tabular-nums text-[var(--premium-ink)] outline-none placeholder:text-[var(--premium-gray)] disabled:cursor-not-allowed";

  return (
    <div className={inline ? "inline-flex" : "flex flex-col gap-[7px]"}>
      {!inline && label && (
        <label id={labelId} htmlFor={fieldId} className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]">
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
            "inline-flex items-center gap-[6px] rounded-[var(--r-sm)] py-[3px] text-[12.5px] text-left font-[family-name:var(--font-ubuntu),system-ui,sans-serif] outline-none cursor-pointer focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]",
            disabled && "opacity-60 cursor-not-allowed",
            className
          )}
        >
          <span className={selected ? "text-current" : "text-[var(--premium-gray)]"}>
            {selected ? formatBR(selected) : placeholder}
          </span>
        </button>
      ) : (
        <div
          ref={(el) => {
            triggerRef.current = el;
          }}
          role="group"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : ariaLabel}
          className={cn(
            "w-full flex items-center gap-1 border border-[var(--premium-mist)] rounded-[var(--r-md)] pl-[14px] pr-1 text-[13px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] transition-all duration-150 bg-[var(--c-surface)]",
            "focus-within:border-[var(--premium-ink)] focus-within:shadow-[0_0_0_2px_var(--yellow-50)]",
            open && "border-[var(--premium-ink)] shadow-[0_0_0_2px_var(--yellow-50)]",
            disabled && "opacity-60",
            error && "border-[var(--danger)]",
            className
          )}
        >
          <div className="flex flex-1 items-center gap-0.5 py-[11px]">
            <input
              ref={diaRef}
              id={fieldId}
              type="text"
              inputMode="numeric"
              aria-label="Dia"
              placeholder="dd"
              value={seg.dd}
              disabled={disabled}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => onSegInput("dd", e.target.value, mesRef)}
              onKeyDown={(e) => onSegKeyDown(e, "dd")}
              onBlur={onSegBlur}
              className={cn(segInputCls, "w-[2.2ch]")}
            />
            <span aria-hidden className="text-[var(--premium-gray)]">/</span>
            <input
              ref={mesRef}
              type="text"
              inputMode="numeric"
              aria-label="Mês"
              placeholder="mm"
              value={seg.mm}
              disabled={disabled}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => onSegInput("mm", e.target.value, anoRef)}
              onKeyDown={(e) => onSegKeyDown(e, "mm", diaRef)}
              onBlur={onSegBlur}
              className={cn(segInputCls, "w-[2.2ch]")}
            />
            <span aria-hidden className="text-[var(--premium-gray)]">/</span>
            <input
              ref={anoRef}
              type="text"
              inputMode="numeric"
              aria-label="Ano"
              placeholder="aaaa"
              value={seg.yyyy}
              disabled={disabled}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => onSegInput("yyyy", e.target.value)}
              onKeyDown={(e) => onSegKeyDown(e, "yyyy", mesRef)}
              onBlur={onSegBlur}
              className={cn(segInputCls, "w-[4.2ch]")}
            />
          </div>
          <button
            ref={iconeRef}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={open ? "Fechar calendário" : "Abrir calendário"}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => (open ? fechar() : abrir())}
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[var(--r-sm)] text-[var(--premium-gray)] outline-none transition-colors hover:text-[var(--premium-ink)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] disabled:cursor-not-allowed cursor-pointer"
          >
            <Calendar size={15} />
          </button>
        </div>
      )}

      {name && <input type="hidden" name={name} value={selected} />}
      {error && <span className="text-[11px] text-[var(--danger)]">{error}</span>}

      {open && rect && typeof document !== "undefined" &&
        createPortal(
          <m.div
            ref={popRef}
            {...motionPreset("menu")}
            id={panelId}
            role="dialog"
            aria-label="Selecionar data"
            // Marcador para popovers hospedeiros ignorarem cliques aqui dentro
            // (o calendário vive em portal, fora da árvore DOM do hospedeiro).
            data-datepicker-pop=""
            onKeyDown={onEscKeyDown}
            style={popoverPos(rect, PAINEL_W, PAINEL_H_EST)}
            className="z-[60] overflow-y-auto rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-3 shadow-[var(--sh-lg)]"
          >
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => navMes(-1)} aria-label="Mês anterior" className="p-1.5 rounded-[var(--r-sm)] hover:bg-[var(--premium-bone)] text-[var(--premium-gray)] hover:text-[var(--premium-ink)] cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[12.5px] font-bold">{MESES[view.month]} {view.year}</span>
              <button type="button" onClick={() => navMes(1)} aria-label="Próximo mês" className="p-1.5 rounded-[var(--r-sm)] hover:bg-[var(--premium-bone)] text-[var(--premium-gray)] hover:text-[var(--premium-ink)] cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DIAS.map((d, i) => (
                <div key={i} className="h-6 flex items-center justify-center text-[10px] font-bold uppercase text-[var(--premium-gray)]">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {celulas.map((dia, i) => {
                if (dia === null) return <div key={i} className="h-8" />;
                const iso = toISO(view.year, view.month, dia);
                const isSel = iso === selected;
                const isHoje = iso === hojeISO;
                const off = desabilitado(iso);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={off}
                    onClick={() => selecionar(iso)}
                    className={cn(
                      "h-8 rounded-[var(--r-sm)] text-[12px] flex items-center justify-center transition-colors cursor-pointer",
                      isSel
                        ? "bg-[var(--yellow)] text-black font-bold"
                        : "hover:bg-[var(--premium-bone)] text-[var(--premium-ink)]",
                      !isSel && isHoje && "ring-1 ring-inset ring-[var(--premium-silver)] font-bold",
                      off && "opacity-30 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--premium-mist)]">
              <button type="button" onClick={() => selecionar(hojeISO)} className="text-[11.5px] font-medium text-[var(--premium-ink)] hover:underline cursor-pointer">Hoje</button>
              {selected && (
                <button type="button" onClick={() => selecionar("")} className="text-[11.5px] text-[var(--premium-gray)] hover:text-[var(--danger)] cursor-pointer">Limpar</button>
              )}
            </div>
          </m.div>,
          document.body
        )}
    </div>
  );
}
