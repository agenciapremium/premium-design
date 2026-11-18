"use client";

import type { FocusEvent, KeyboardEvent, RefObject } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Segmentos } from "@/components/ui/date-picker-datas";

type RefCampo = RefObject<HTMLInputElement | null>;

interface CampoSegmentosProps {
  /** Recebe o grupo, que é a âncora do calendário. */
  grupoRef: (el: HTMLDivElement | null) => void;
  fieldId: string;
  labelId: string;
  panelId: string;
  label?: string;
  ariaLabel?: string;
  seg: Segmentos;
  open: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  diaRef: RefCampo;
  mesRef: RefCampo;
  anoRef: RefCampo;
  iconeRef: RefObject<HTMLButtonElement | null>;
  onSegInput: (campo: keyof Segmentos, valor: string, proximo?: RefCampo) => void;
  onSegKeyDown: (e: KeyboardEvent, campo: keyof Segmentos, anterior?: RefCampo) => void;
  onSegBlur: (e: FocusEvent<HTMLInputElement>) => void;
  /** Ícone do calendário: abre ou fecha o painel. */
  onAlternar: () => void;
}

const segInputCls =
  "bg-transparent text-center tabular-nums text-[var(--premium-ink)] outline-none placeholder:text-[var(--premium-gray)] disabled:cursor-not-allowed";

/**
 * Campo do `DatePicker` (variante `field`): dia, mês e ano digitados em
 * segmentos, com auto-avanço, e o ícone que abre o calendário.
 */
export function CampoSegmentos({
  grupoRef,
  fieldId,
  labelId,
  panelId,
  label,
  ariaLabel,
  seg,
  open,
  disabled,
  error,
  className,
  diaRef,
  mesRef,
  anoRef,
  iconeRef,
  onSegInput,
  onSegKeyDown,
  onSegBlur,
  onAlternar,
}: CampoSegmentosProps) {
  return (
    <div
      ref={grupoRef}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : ariaLabel}
      className={cn(
        "flex w-full items-center gap-1 rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] pr-1 pl-[14px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[13px] transition-all duration-150",
        "focus-within:border-[var(--premium-ink)] focus-within:shadow-[0_0_0_2px_var(--yellow-50)]",
        open && "border-[var(--premium-ink)] shadow-[0_0_0_2px_var(--yellow-50)]",
        disabled && "opacity-60",
        error && "border-[var(--danger)]",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-0.5 py-[11px]">
        <input
          ref={diaRef}
          id={fieldId}
          type="text"
          inputMode="numeric"
          data-segmento-de={fieldId}
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
        <span aria-hidden className="text-[var(--premium-gray)]">
          /
        </span>
        <input
          ref={mesRef}
          type="text"
          inputMode="numeric"
          data-segmento-de={fieldId}
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
        <span aria-hidden className="text-[var(--premium-gray)]">
          /
        </span>
        <input
          ref={anoRef}
          type="text"
          inputMode="numeric"
          data-segmento-de={fieldId}
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
        onClick={onAlternar}
        className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-sm)] text-[var(--premium-gray)] transition-colors outline-none hover:text-[var(--premium-ink)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] disabled:cursor-not-allowed"
      >
        <Calendar size={15} />
      </button>
    </div>
  );
}
