/**
 * Posicionamento de popovers/painéis renderizados em portal com
 * `position: fixed` (calendário do DatePicker, dropdown de pessoas, listas do
 * MultiSelect e da FilterBar, prazos do workflow…). Capability
 * `popover-posicionamento` (change popover-colado-ao-gatilho):
 *
 * - **Colado ao gatilho**: abrindo abaixo, `top` encosta na base do gatilho;
 *   abrindo acima, `bottom` encosta no topo dele. Ancorar pela borda faz o
 *   navegador encostar o painel no gatilho qualquer que seja a altura REAL —
 *   posicionar pelo topo com a altura ESTIMADA deixava um painel curto solto
 *   centenas de pixels acima do campo.
 * - **Flip vertical**: abre abaixo por padrão; vai para cima só quando falta
 *   espaço abaixo para a altura estimada e sobra mais espaço acima.
 * - **Altura limitada, nunca deslocada**: em vez de empurrar o painel para
 *   caber, devolve `maxHeight` com o espaço do lado escolhido (com piso) — só
 *   quando esse espaço é MENOR que a estimativa. Com espaço de sobra não há
 *   `maxHeight` inline, e o teto visual segue o `max-h-*` da classe de cada
 *   painel (inline venceria a classe e cortaria painel de estimativa baixa).
 * - **Clamp horizontal**: borda esquerda e direita a uma margem mínima da janela.
 *
 * A altura é uma **estimativa** (não medida) e só decide o lado e quando limitar.
 */

/** Largura padrão do calendário do DatePicker (px). */
export const PAINEL_W = 256;
/**
 * Altura estimada do calendário do DatePicker com a pior caixa (mês de 6
 * linhas), usada para decidir o flip vertical.
 */
export const PAINEL_H_EST = 330;

/** Subconjunto de DOMRect usado pelo cálculo (left/top/bottom/width). */
export interface AnchorRect {
  left: number;
  top: number;
  bottom: number;
  width?: number;
}

export interface PopoverStyle {
  position: "fixed";
  left: number;
  width: number;
  /** Abrindo abaixo: distância do topo da janela. */
  top?: number;
  /** Abrindo acima: distância da base da janela (a base do painel encosta no gatilho). */
  bottom?: number;
  /**
   * Presente só quando o espaço do lado escolhido é menor que a estimativa:
   * prevalece sobre o `max-h-*` da classe e o conteúdo rola por dentro.
   */
  maxHeight?: number;
}

/** Menor altura útil de um painel, mesmo com o gatilho espremido num canto. */
export const ALTURA_MIN_POPOVER = 120;

/**
 * Calcula o estilo `fixed` de um painel ancorado em `rect`: colado ao gatilho,
 * com flip vertical, altura limitada ao espaço disponível e clamp horizontal.
 *
 * @param rect      Retângulo do gatilho (getBoundingClientRect).
 * @param width     Largura do painel (px).
 * @param estHeight Altura estimada do painel (px) — decide o flip e quando limitar a altura.
 * @param gap       Espaço entre gatilho e painel (px). Padrão 6.
 * @param margin    Margem mínima de segurança das bordas da janela (px). Padrão 8.
 */
export function popoverPos(
  rect: AnchorRect,
  width: number,
  estHeight: number,
  gap = 6,
  margin = 8,
): PopoverStyle {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const left = Math.max(margin, Math.min(rect.left, vw - width - margin));

  const espacoAbaixo = vh - rect.bottom;
  const espacoAcima = rect.top;
  // Flip para cima só quando falta espaço abaixo E sobra mais espaço acima.
  const abrirAcima = espacoAbaixo < estHeight + gap && espacoAcima > espacoAbaixo;
  const espaco = (abrirAcima ? espacoAcima : espacoAbaixo) - gap - margin;
  const limite = espaco < estHeight ? { maxHeight: Math.max(ALTURA_MIN_POPOVER, espaco) } : {};

  return abrirAcima
    ? { position: "fixed", bottom: vh - rect.top + gap, left, width, ...limite }
    : { position: "fixed", top: rect.bottom + gap, left, width, ...limite };
}
