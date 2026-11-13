import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, Ref } from "react";
import { DatePicker, type DateChangeEvent } from "@/components/ui/date-picker";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /**
   * Texto fixo exibido dentro do campo, antes do valor (ex.: DDI "+55").
   * Não faz parte do valor editável — o caret nunca entra nele.
   */
  prefixo?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, error, className, id, prefixo, ...props }: InputProps) {
  // Campos de data usam o calendário custom (alinhado ao design do Tasks) no
  // lugar do date picker nativo do navegador.
  if (props.type === "date") {
    const { value, defaultValue, onChange, onBlur, name, disabled, placeholder, min, max } = props;
    return (
      <DatePicker
        id={id}
        name={name}
        label={label}
        error={error}
        value={value as string | undefined}
        defaultValue={defaultValue as string | undefined}
        onChange={onChange as unknown as ((e: DateChangeEvent) => void) | undefined}
        onBlur={onBlur as unknown as (() => void) | undefined}
        disabled={disabled}
        placeholder={placeholder}
        min={min as string | undefined}
        max={max as string | undefined}
        className={className}
      />
    );
  }
  // Erro ligado ao campo para leitor de tela (anunciado junto do rótulo).
  const erroId = error && id ? `${id}-erro` : undefined;
  const aria = error
    ? { "aria-invalid": true as const, "aria-describedby": erroId ?? props["aria-describedby"] }
    : {};
  if (prefixo) {
    return (
      <div className="flex flex-col gap-[7px]">
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex w-full items-center border border-[var(--premium-mist)] rounded-[var(--r-md)] px-[14px] transition-all duration-150",
            "focus-within:border-[var(--premium-ink)] focus-within:shadow-[0_0_0_2px_var(--yellow-50)]",
            error && "border-[var(--danger)]"
          )}
        >
          <span className="select-none pr-1.5 text-[13px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[var(--premium-gray)]">
            {prefixo}
          </span>
          <input
            id={id}
            className={cn(
              "w-full bg-transparent py-[11px] text-[13px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[var(--premium-ink)] outline-none",
              "placeholder:text-[var(--premium-gray)]",
              className
            )}
            {...props}
            {...aria}
          />
        </div>
        {error && <span id={erroId} className="text-[11px] text-[var(--danger)]">{error}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full border border-[var(--premium-mist)] rounded-[var(--r-md)] px-[14px] py-[11px] text-[13px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[var(--premium-ink)] outline-none transition-all duration-150",
          "focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)]",
          "placeholder:text-[var(--premium-gray)]",
          error && "border-[var(--danger)]",
          className
        )}
        {...props}
        {...aria}
      />
      {error && (
        <span id={erroId} className="text-[11px] text-[var(--danger)]">{error}</span>
      )}
    </div>
  );
}
