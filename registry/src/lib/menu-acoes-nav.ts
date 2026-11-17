/**
 * Regras puras do `MenuAcoes` (change almoxarifado-item-painel-layout, D1):
 * a navegação por teclado entre os itens habilitados (roving tabindex), a
 * altura estimada do painel e a âncora alinhada à direita do gatilho.
 *
 * Isomórfico e sem dependências: a peça `menu-acoes.tsx` usa estas funções e
 * o teste (`menu-acoes-nav.test.ts`) as exercita sem DOM.
 */

/** Teclas de navegação tratadas pelo menu. */
export type TeclaNavegacao = "ArrowDown" | "ArrowUp" | "Home" | "End";

export function ehTeclaNavegacao(tecla: string): tecla is TeclaNavegacao {
  return tecla === "ArrowDown" || tecla === "ArrowUp" || tecla === "Home" || tecla === "End";
}

/** O mínimo de um item para decidir a navegação: o motivo de desabilitado, se houver. */
export interface ItemNavegavel {
  desabilitado?: string | false;
}

/** Os itens de todos os grupos numa lista só, na ordem em que aparecem. */
export function achatarGrupos<T>(grupos: { itens: T[] }[]): T[] {
  return grupos.flatMap((g) => g.itens);
}

export function itemHabilitado(item: ItemNavegavel): boolean {
  return !item.desabilitado;
}

/** Índice do primeiro item habilitado, ou -1 se nenhum estiver. */
export function primeiroHabilitado(itens: ItemNavegavel[]): number {
  return itens.findIndex(itemHabilitado);
}

/** Índice do último item habilitado, ou -1 se nenhum estiver. */
export function ultimoHabilitado(itens: ItemNavegavel[]): number {
  for (let i = itens.length - 1; i >= 0; i--) if (itemHabilitado(itens[i])) return i;
  return -1;
}

/**
 * Próximo índice a receber o foco. Setas andam um item habilitado por vez e dão
 * a volta nas pontas; Home e End vão ao primeiro e ao último habilitado. Item
 * desabilitado é sempre pulado. Sem nenhum habilitado, devolve -1.
 *
 * `atual` pode ser -1 (nada focado ainda): a seta para baixo vai ao primeiro e
 * a seta para cima, ao último.
 */
export function proximoIndice(itens: ItemNavegavel[], atual: number, tecla: TeclaNavegacao): number {
  if (tecla === "Home") return primeiroHabilitado(itens);
  if (tecla === "End") return ultimoHabilitado(itens);
  const n = itens.length;
  if (n === 0) return -1;
  const passo = tecla === "ArrowDown" ? 1 : -1;
  let i = atual < 0 || atual >= n ? (passo === 1 ? -1 : n) : atual;
  for (let k = 0; k < n; k++) {
    i = (i + passo + n) % n;
    if (itemHabilitado(itens[i])) return i;
  }
  return -1;
}

/** Altura de cada parte do painel, em px (itens de 40px, rótulo, divisória e padding). */
export const MENU_ALTURA_ITEM = 40;
export const MENU_ALTURA_ROTULO = 28;
export const MENU_ALTURA_DIVISORIA = 9;
export const MENU_PADDING = 12;

/**
 * Altura estimada do painel, para o `popoverPos` decidir o lado e o limite:
 * itens, rótulos de grupo, divisórias entre grupos e o padding.
 */
export function alturaEstimadaMenu(grupos: { rotulo?: string; itens: unknown[] }[]): number {
  const visiveis = grupos.filter((g) => g.itens.length > 0);
  let h = MENU_PADDING;
  visiveis.forEach((g, i) => {
    if (i > 0) h += MENU_ALTURA_DIVISORIA;
    if (g.rotulo) h += MENU_ALTURA_ROTULO;
    h += g.itens.length * MENU_ALTURA_ITEM;
  });
  return h;
}

/**
 * Retângulo de âncora para o `popoverPos` alinhar o painel à DIREITA do
 * gatilho: o `popoverPos` posiciona pela borda esquerda e prende à tela, então
 * basta deslocar a esquerda para `right - largura`.
 */
export function ancoraDireita(
  rect: { left: number; right: number; top: number; bottom: number },
  largura: number,
): { left: number; top: number; bottom: number; width: number } {
  return { left: rect.right - largura, top: rect.top, bottom: rect.bottom, width: largura };
}
