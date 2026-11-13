"use client";

import { Children, cloneElement, isValidElement, useId } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Texto exibido no balao. */
  label: string;
  /** Elemento gatilho (o conteudo sobre o qual o tooltip aparece). */
  children: ReactNode;
  /** Lado em que o balao aparece em relacao ao gatilho. */
  side?: "right" | "top" | "bottom" | "left";
  /** Classe aplicada ao wrapper (ex.: largura). */
  className?: string;
  /** Classe aplicada ao balao (ex.: gating por estado). */
  bubbleClassName?: string;
  /**
   * Atraso do hover, em ms. Sem valor, herda o padrão de 300 ms (e obedece a um
   * contêiner `data-tooltip-group`, que zera o atraso entre ícones vizinhos).
   * Com valor, a instância decide sozinha e ignora o grupo.
   */
  delay?: number;
  /**
   * Desliga o balão sem mexer no layout: o wrapper continua ali, só a dica some.
   * Use em gatilho desabilitado e em texto truncado que, na largura atual, cabe
   * inteiro (`useTruncado`).
   */
  disabled?: boolean;
  /**
   * Envolve com `div` em vez de `span`, para gatilho que não é conteúdo de
   * frase (um `h2`, por exemplo): `span` só aceita conteúdo de frase, e o
   * aninhamento inválido some do HTML gerado.
   */
  bloco?: boolean;
}

/**
 * Dica contextual do design system — o **único** mecanismo de dica da interface
 * (o `title` nativo é barrado por lint: não aparece no foco por teclado, ignora
 * o tema e cada navegador o desenha de um jeito).
 *
 * 100% CSS (sem lib, sem portal): aparece no hover do mouse com atraso de
 * 300 ms e no foco por teclado na hora (`group-focus-within`), porque quem
 * navega por Tab quer a dica imediatamente. O balão recebe `id` e o gatilho
 * passa a apontar para ele por `aria-describedby` (ids já existentes são
 * somados, nunca sobrescritos), então o leitor de tela lê a dica como descrição
 * do controle.
 *
 * Dentro de contêiner com `overflow: hidden`, o balão é recortado; a saída é
 * tornar o wrapper `position: static` para o bloco-contêiner do balão passar a
 * ser um ancestral fora do scroller (padrão da sidebar, ver
 * docs/design-system/componentes.md).
 */
export function Tooltip({
  label,
  children,
  side = "right",
  className,
  bubbleClassName,
  delay,
  disabled = false,
  bloco = false,
}: TooltipProps) {
  const id = useId();
  // Filho único e elemento React: dá para injetar `aria-describedby` nele por
  // cloneElement. Fora disso (texto puro, fragmento, vários filhos) o vínculo
  // vai para o wrapper — o balão continua aparecendo, sem mexer na ordem de Tab.
  const filho = Children.count(children) === 1 ? Children.toArray(children)[0] : null;
  const filhoElemento = filho && isValidElement(filho) ? filho : null;
  const descritoPor = filhoElemento
    ? [(filhoElemento.props as { "aria-describedby"?: string })["aria-describedby"], id]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const gatilho =
    !disabled && filhoElemento
      ? cloneElement(filhoElemento as ReactElement<{ "aria-describedby"?: string }>, {
          "aria-describedby": descritoPor,
        })
      : children;

  // O balão é absoluto e precisa de um ancestral posicionado — normalmente o
  // próprio wrapper, com `relative`. Quando o chamador já posiciona o wrapper
  // (um botão flutuante `absolute`, por exemplo), esse wrapper JÁ é o ancestral
  // posicionado e o `relative` sobra: `cn` não resolve conflito e, no CSS
  // gerado, `relative` venceria o `absolute` do chamador.
  const posicionadoPeloChamador = /(^|\s)(absolute|fixed|sticky|static)(\s|$)/.test(className ?? "");

  const envoltorio = {
    // `focus-within:[--tt-delay:0ms]`: quem chega pelo teclado nunca espera, mesmo
    // com o ponteiro parado em cima (aí as duas regras do balão valem ao mesmo
    // tempo, e é o valor da variável que decide, não a ordem delas no CSS).
    className: cn(
      "group/tooltip inline-flex focus-within:[--tt-delay:0ms]",
      !posicionadoPeloChamador && "relative",
      className,
    ),
    "aria-describedby": !disabled && !filhoElemento ? id : undefined,
    style: delay === undefined ? undefined : ({ "--tt-delay": `${delay}ms` } as CSSProperties),
  };

  const conteudo = (
    <>
      {gatilho}
      {!disabled && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-[var(--r-sm)] border border-white/10 bg-[var(--brand-ink)] px-2 py-1 text-[12px] font-medium text-[var(--brand-on-ink)] shadow-[var(--sh-md)]",
            "opacity-0 transition-opacity duration-100 [transition-delay:0ms]",
            "group-hover/tooltip:opacity-100 group-hover/tooltip:[transition-delay:var(--tt-delay,300ms)]",
            "group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:[transition-delay:0ms]",
            side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
            side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
            side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
            side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
            bubbleClassName,
          )}
        >
          {label}
        </span>
      )}
    </>
  );

  return bloco ? <div {...envoltorio}>{conteudo}</div> : <span {...envoltorio}>{conteudo}</span>;
}
