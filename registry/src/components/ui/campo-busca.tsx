"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampoBuscaBase {
  id: string;
  value: string;
  onValueChange: (valor: string) => void;
  placeholder?: string;
  /** `md` 44px (padrão) · `sm` 36px, para colunas estreitas (ex.: árvore de Docs). */
  tamanho?: "md" | "sm";
  /** Efeito extra ao limpar (ex.: descartar um debounce pendente). */
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

/** Nome acessível obrigatório: pelo rótulo visível ou, sem ele, pelo `ariaLabel`. */
type CampoBuscaProps = CampoBuscaBase &
  ({ label: string; ariaLabel?: string } | { label?: undefined; ariaLabel: string });

const TAMANHO = {
  md: { campo: "h-11 pl-10 pr-10", lupa: 16, lupaPos: "left-[14px]", limparPos: "right-2" },
  sm: { campo: "h-9 pl-[34px] pr-9", lupa: 15, lupaPos: "left-3", limparPos: "right-1" },
} as const;

/**
 * Campo de busca solto na tela, fora da barra de filtros (change
 * `busca-um-x-por-campo`, design D2; premium-design v0.9.0, "Campo de busca").
 *
 * Regra: **um controle de limpar por campo, sempre o do sistema**. O "x" nativo
 * que Chrome e Safari desenham no `type="search"` é escondido pela regra base do
 * `globals.css`; o `X` daqui é o mesmo em todos os navegadores. O campo continua
 * `type="search"` (teclado "Buscar" no celular, `Esc` limpa, papel searchbox).
 *
 * Moldura igual à do `Input` (borda mist, raio md, foco ink + halo amarelo,
 * rótulo eyebrow 11px). Não estende o `Input` porque ícone à esquerda, ação à
 * direita e o limpar complicariam um primitivo usado em dezenas de formulários.
 * A busca **da** barra é o chip do `FilterBar`; busca dentro de picker segue o
 * padrão compacto próprio.
 */
export function CampoBusca({
  id,
  value,
  onValueChange,
  label,
  ariaLabel,
  placeholder,
  tamanho = "md",
  onClear,
  className,
  autoFocus,
}: CampoBuscaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = TAMANHO[tamanho];

  // Limpar devolve o foco ao campo: quem limpou costuma querer digitar de novo.
  function limpar() {
    onValueChange("");
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <div className={cn("flex flex-col gap-[7px]", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          size={t.lupa}
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--premium-gray)]",
            t.lupaPos
          )}
        />
        <input
          ref={inputRef}
          id={id}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label ? undefined : ariaLabel}
          autoFocus={autoFocus}
          className={cn(
            "w-full rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--premium-white)] text-[13px] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] text-[var(--premium-ink)] outline-none transition-all duration-150",
            "placeholder:text-[var(--premium-gray)]",
            "focus:border-[var(--premium-ink)] focus:shadow-[0_0_0_2px_var(--yellow-50)]",
            t.campo
          )}
        />
        {value !== "" && (
          <button
            type="button"
            onClick={limpar}
            aria-label="Limpar busca"
            aria-controls={id}
            className={cn(
              "absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--premium-gray)] transition-colors hover:text-[var(--premium-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)]",
              t.limparPos
            )}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
