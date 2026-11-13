import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Banner de erro inline para submit/ação (ui-guidelines §5.8). Padrão único de
 * erro geral de formulário — erros de campo ficam associados ao próprio campo
 * (`Input error=`); erro nunca usa toast nem janela nativa.
 */
export function FormErrorBanner({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-[var(--r-md)] border border-[var(--danger)] bg-[var(--danger-bg)] px-3 py-2 text-[12.5px] text-[var(--c-ink)]",
        className
      )}
    >
      <AlertCircle size={15} className="mt-[1px] shrink-0 text-[var(--danger)]" />
      <span className="min-w-0">{message}</span>
    </div>
  );
}
