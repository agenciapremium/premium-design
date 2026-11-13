"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE } from "@/lib/motion";
import { useToast } from "@/lib/hooks/use-toast";
import { linkMarkdown } from "@/lib/helpers/link-markdown";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Atalho que copia o **link interno** de um registro para compartilhar com a
 * equipe — distinto do link de aprovação do cliente, que é público.
 *
 * Primitivo único: demanda e atividade consomem daqui. A lógica é a mesma nas
 * duas (montar a URL, copiar, confirmar, trocar o ícone por um instante); o que
 * muda é o caminho e os rótulos. Duas cópias significariam a próxima correção de
 * formato acontecendo em só uma delas.
 *
 * O formato Markdown e o porquê dos `<>` no destino estão documentados em
 * `lib/helpers/link-markdown.ts`, que é puro e testado à parte.
 *
 * Em linhas e cards clicáveis, `stopNavigation` impede que o clique dispare a
 * navegação da linha (mesmo padrão do `FavoritoStar`).
 */
export function CopiarLink({
  caminho,
  titulo,
  fallback,
  rotuloAcao,
  mensagemSucesso,
  stopNavigation = false,
}: {
  /** Caminho interno do registro, com a barra inicial (ex.: `/atividades/abc`). */
  caminho: string;
  titulo: string;
  /** Rótulo usado quando o título é vazio (ex.: "Atividade"). */
  fallback: string;
  /** Vira `aria-label` e `title` (ex.: "Copiar link da atividade"). */
  rotuloAcao: string;
  mensagemSucesso: string;
  stopNavigation?: boolean;
}) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);

  async function copiar(e: React.MouseEvent) {
    if (stopNavigation) {
      e.preventDefault();
      e.stopPropagation();
    }
    const markdown = linkMarkdown({
      origem: window.location.origin,
      caminho,
      titulo,
      fallback,
    });
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiado(true);
      toast.success(mensagemSucesso);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      toast.warning("Não foi possível copiar o link.");
    }
  }

  return (
    <Tooltip label={rotuloAcao} side="top">
      <button
        type="button"
        onClick={copiar}
        aria-label={rotuloAcao}
        className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--r-sm)] text-[var(--premium-gray)] transition-colors hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)] cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={copiado ? "ok" : "idle"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="flex items-center justify-center"
          >
            {copiado ? <Check size={13} className="text-[var(--success)]" /> : <Link2 size={13} />}
          </m.span>
        </AnimatePresence>
      </button>
    </Tooltip>
  );
}
