"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/lib/hooks/use-toast";
import { EASE } from "@/lib/motion";
import { tokenize, type CodeLang } from "./code-highlight";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  /** Conteúdo bruto do trecho (é o que vai para a área de transferência). */
  code: string;
  /** Linguagem para o realce (padrão: text, sem realce). */
  language?: CodeLang;
  /** Rótulo exibido no cabeçalho (ex.: "curl", "JavaScript", "Payload"). */
  label?: string;
  className?: string;
}

const LANG_LABEL: Record<CodeLang, string> = {
  bash: "curl",
  json: "JSON",
  javascript: "JavaScript",
  text: "Código",
};

/**
 * Bloco de código com realce de sintaxe e botão de copiar (capability
 * doc-code-block). Cores só por token de code theme (sem hex). Feedback de
 * cópia via `useToast` (§4.19/§4.20) — requer `ToastProvider` na árvore.
 * Acessível: botão com `aria-label`, alvo ≥ 40px, foco visível.
 */
export function CodeBlock({ code, language = "text", label, className }: CodeBlockProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const tokens = tokenize(code, language);
  const heading = label ?? LANG_LABEL[language];

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copiado.");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.warning("Não foi possível copiar. Copie manualmente.");
    }
  }

  return (
    <div
      className={cn(
        "rounded-[var(--r-md)] border overflow-hidden my-3",
        className
      )}
      style={{ background: "var(--code-bg)", borderColor: "var(--code-border)" }}
    >
      <div
        className="flex items-center justify-between gap-2 pl-3.5 pr-2 py-1.5 border-b"
        style={{ borderColor: "var(--code-border)" }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "var(--code-comment)" }}
        >
          {heading}
        </span>
        <Tooltip label="Copiar" side="left">
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Código copiado" : "Copiar código"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--r-md)] cursor-pointer transition-all hover:text-[var(--brand-yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-yellow)]"
            style={{ color: "var(--code-fg)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={copied ? "ok" : "idle"}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="flex items-center justify-center"
              >
                {copied ? (
                  <Check size={16} style={{ color: "var(--success)" }} />
                ) : (
                  <Copy size={16} />
                )}
              </m.span>
            </AnimatePresence>
          </button>
        </Tooltip>
      </div>
      <pre
        className="code-scroll overflow-x-auto px-3.5 py-3 m-0 text-[12.5px] leading-[1.65]"
        style={{ color: "var(--code-fg)" }}
      >
        <code className="font-mono whitespace-pre">
          {tokens.map((t, i) =>
            t.cls ? (
              <span key={i} className={t.cls}>
                {t.text}
              </span>
            ) : (
              <span key={i}>{t.text}</span>
            )
          )}
        </code>
      </pre>
    </div>
  );
}
