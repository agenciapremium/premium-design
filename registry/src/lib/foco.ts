/**
 * Foco em overlays modais (capability overlays-gestao-de-foco) — parte PURA.
 *
 * O hook `useDialogoFoco` faz o trabalho com o DOM; aqui ficam só as decisões
 * que não dependem dele, para poderem ser testadas por `node --test` sem
 * navegador (design D5):
 *
 *   node --test --experimental-strip-types src/lib/foco.test.ts
 */

/**
 * Candidatos a foco dentro de um painel. `[tabindex="-1"]` fica de fora: é
 * alcançável por `.focus()` programático, mas não pela tecla `Tab` — que é o
 * ciclo que o trap precisa reproduzir.
 */
export const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type DirecaoFoco = "frente" | "tras";

/**
 * Próximo elemento do ciclo de `Tab` dentro de um painel modal.
 *
 * - `atual` no fim da lista e direção "frente" devolve o primeiro (e vice-versa):
 *   é isso que impede o `Tab` de sair do painel.
 * - `atual` ausente ou fora da lista (foco perdido para o `body`, elemento que
 *   sumiu) devolve a ponta de entrada: o primeiro indo para a frente, o último
 *   indo para trás.
 * - Lista vazia devolve `null`; quem chama não previne o `Tab` nesse caso.
 */
export function proximoFocavel<T>(
  focaveis: readonly T[],
  atual: T | null,
  direcao: DirecaoFoco
): T | null {
  if (focaveis.length === 0) return null;
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  const i = atual === null ? -1 : focaveis.indexOf(atual);
  if (i === -1) return direcao === "frente" ? primeiro : ultimo;
  if (direcao === "frente") return i === focaveis.length - 1 ? primeiro : focaveis[i + 1];
  return i === 0 ? ultimo : focaveis[i - 1];
}

/**
 * Tipos de `input` que NÃO abrem teclado virtual (são gatilhos, não digitação).
 * Tudo o que não está aqui conta como campo de texto.
 */
const TIPOS_SEM_DIGITACAO = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

/**
 * O elemento é um campo de digitação? Em viewport estreita o foco inicial evita
 * esses campos, senão o teclado virtual cobre metade do painel ao abrir
 * (design, "Risks"). Recebe os dados já extraídos do elemento para continuar
 * puro.
 */
export function ehCampoDeTexto(el: {
  tag: string;
  tipo?: string | null;
  editavel?: boolean;
}): boolean {
  if (el.editavel) return true;
  const tag = el.tag.toUpperCase();
  if (tag === "TEXTAREA") return true;
  if (tag !== "INPUT") return false;
  return !TIPOS_SEM_DIGITACAO.has((el.tipo ?? "text").toLowerCase());
}
