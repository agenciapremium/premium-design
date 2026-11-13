"use client";

import { useState } from "react";
import { getInitials, cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Foto do colaborador (Colaborador.avatarUrl); com ela, as iniciais não aparecem. */
  src?: string | null;
}

const sizeMap = {
  sm: "w-[26px] h-[26px] text-[10px]",
  md: "w-9 h-9 text-[13px]",
  lg: "w-11 h-11 text-[15px]",
};

/**
 * Iniciais (ou foto) de uma pessoa. O nome completo é o nome acessível — `alt`
 * na foto, `role="img"` + `aria-label` nas iniciais — e **não** vira balão aqui:
 * o avatar aparece empilhado (a sobreposição negativa depende de ele ser o
 * próprio item do flex) e muitas vezes já vive dentro de um `Tooltip` do
 * chamador, que sairia duplicado. Quem precisa da dica a põe no gatilho ao
 * redor (ver presenca-avatares.tsx e o editor de workflow).
 */
export function Avatar({ name, color = "var(--yellow)", size = "md", className, src }: AvatarProps) {
  // URL que falhou ao carregar (ex.: blob de store excluída/removida): cai para
  // as iniciais em vez do ícone de imagem quebrada. Guardar a URL — e não um
  // booleano — permite tentar de novo quando `src` muda (nova foto enviada).
  const [srcComErro, setSrcComErro] = useState<string | null>(null);

  if (src && src !== srcComErro) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto pequena servida pelo Blob; next/image não se aplica
      <img
        src={src}
        alt={name}
        onError={() => setSrcComErro(src)}
        className={cn("rounded-full object-cover shrink-0", sizeMap[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-black shrink-0",
        sizeMap[size],
        className
      )}
      style={{ background: color }}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
