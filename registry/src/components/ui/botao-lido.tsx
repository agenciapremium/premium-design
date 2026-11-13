"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Botão de lido (padrão "Botão de lido" do premium-design v0.10.0; capability
 * notificacao-card). Só ícone, dois estados:
 *
 * - **não lido**: `<button>` AMARELO (a marca, igual nos dois temas) com ícone
 *   preto; a dica diz a ação. É convite: sólido e chamativo.
 * - **lido**: indicador VERDE tonal (`--success-bg`/`--success`), sem foco e
 *   sem clique. É estado resolvido: pesa menos na lista.
 *
 * A troca pulsa, solta uma onda verde e desenha o ícone (keyframes `lido-*` em
 * globals.css, desligados sob movimento reduzido). Quando o botão focado vira
 * indicador, `onVirou` deixa o hospedeiro devolver o foco a um vizinho.
 */
export function BotaoLido({
  lido,
  onMarcar,
  rotulo,
  dica = "Marcar como lida",
  rotuloLido = "Lida",
  icone: Icone = CheckCheck,
  onVirou,
}: {
  lido: boolean;
  onMarcar: () => void;
  /** Nome acessível do botão, com o assunto (ex.: `Marcar "Título" como lida`). */
  rotulo: string;
  dica?: string;
  rotuloLido?: string;
  icone?: LucideIcon;
  /** Chamado quando o botão que tinha o foco vira indicador. */
  onVirou?: () => void;
}) {
  const botaoRef = useRef<HTMLButtonElement>(null);
  const tinhaFoco = useRef(false);
  // `vira` só quando a troca acontece diante da pessoa, nunca num card que já
  // chega lido. O estado anterior é guardado no render (padrão do React para
  // "valor anterior"), sem efeito que dispare render em cascata.
  const [anterior, setAnterior] = useState(lido);
  const [vira, setVira] = useState(false);
  if (anterior !== lido) {
    setAnterior(lido);
    setVira(lido);
  }

  useEffect(() => {
    if (lido && tinhaFoco.current) {
      tinhaFoco.current = false;
      onVirou?.();
    }
  }, [lido, onVirou]);

  const base =
    "relative z-[1] grid size-9 shrink-0 place-items-center rounded-full transition-[background-color,color,box-shadow,transform] duration-200";

  if (lido) {
    return (
      <span
        role="img"
        aria-label={rotuloLido}
        // A onda é a animação mais longa; as outras (e a do ícone, que sobe
        // por bolha) terminam antes e não podem cortá-la.
        onAnimationEnd={(e) => {
          if (e.animationName === "lidoOnda") setVira(false);
        }}
        className={cn(base, "bg-[var(--success-bg)] text-[var(--success)]", vira && "lido-vira")}
      >
        <Icone size={17} aria-hidden />
      </span>
    );
  }

  return (
    <Tooltip label={dica} side="left">
      <button
        ref={botaoRef}
        type="button"
        onClick={(e) => {
          // O card inteiro é link: o botão não pode disparar a navegação.
          e.preventDefault();
          e.stopPropagation();
          tinhaFoco.current = document.activeElement === botaoRef.current;
          onMarcar();
        }}
        aria-label={rotulo}
        className={cn(
          base,
          // Alvo de 40px sobre o círculo de 36px.
          "cursor-pointer before:absolute before:-inset-0.5 before:rounded-full before:content-['']",
          "bg-brand text-on-brand hover:bg-[var(--brand-amber)] hover:shadow-[var(--sh-gold)] active:scale-[.94]",
          // Anel duplo: um anel amarelo sumiria sobre o botão amarelo.
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--c-surface),0_0_0_5px_var(--premium-ink)]"
        )}
      >
        <Icone size={17} aria-hidden />
      </button>
    </Tooltip>
  );
}
