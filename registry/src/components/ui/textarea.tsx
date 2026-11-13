import { cn } from "@/lib/utils";
import type { Ref, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** Como no `Input`: quem monta o campo às vezes precisa levar o foco até ele. */
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
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
      <textarea
        id={id}
        className={cn(
          "w-full border border-[var(--premium-mist)] rounded-[var(--r-md)] px-[14px] py-[11px] text-[13px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[var(--premium-ink)] outline-none resize-vertical min-h-[76px] transition-all duration-150",
          "focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)]",
          error && "border-[var(--danger)]",
          className
        )}
        {...props}
      />
      {error && <span className="text-[11px] text-[var(--danger)]">{error}</span>}
    </div>
  );
}
