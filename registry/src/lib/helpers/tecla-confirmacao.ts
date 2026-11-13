/**
 * Teclado do `ConfirmDialog` (change catalogo-filterbar-faixa-busca-correcoes,
 * D4; spec primitivos-contraste-e-teclado, "Enter do ConfirmDialog respeita
 * campo de várias linhas").
 *
 * Módulo puro (sem React, sem DOM): o diálogo e o teste decidem pela mesma
 * função. `Esc` cancela em qualquer foco. `Enter` confirma, menos num campo de
 * várias linhas (`textarea` ou elemento editável), onde ele quebra a linha e
 * quem confirma é Ctrl+Enter (Cmd+Enter no macOS).
 */

/** O mínimo do evento de teclado de que a regra precisa. */
export interface TeclaDoDialogo {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  /** Elemento com foco quando a tecla foi pressionada (`event.target`). */
  alvo: { tagName?: string; isContentEditable?: boolean } | null;
}

export type AcaoDaTecla = "confirmar" | "cancelar" | "nenhuma";

/** O foco está num campo em que Enter quebra a linha? */
export function campoDeVariasLinhas(alvo: TeclaDoDialogo["alvo"]): boolean {
  if (!alvo) return false;
  return alvo.tagName?.toUpperCase() === "TEXTAREA" || alvo.isContentEditable === true;
}

/** O que a tecla faz no diálogo de confirmação. */
export function acaoDaTecla({ key, ctrlKey, metaKey, alvo }: TeclaDoDialogo): AcaoDaTecla {
  if (key === "Escape") return "cancelar";
  if (key !== "Enter") return "nenhuma";
  if (campoDeVariasLinhas(alvo) && !ctrlKey && !metaKey) return "nenhuma";
  return "confirmar";
}
