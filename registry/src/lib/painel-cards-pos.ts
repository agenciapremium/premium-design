/**
 * Posição do painel de cards flutuantes (capability painel-cards-flutuantes,
 * design D1). Conta pura: recebe o retângulo do gatilho e a largura da janela
 * e devolve onde o painel fica, sem tocar no DOM.
 *
 * Ancorado: o X (40px) fica centralizado sobre o gatilho, e a borda direita dos
 * cards alinha com a borda direita do X. Abaixo de 768px, ou sem gatilho
 * visível (aberto pelo menu móvel do portal), o painel fica "livre": largura da
 * tela com margens fixas, resolvidas no CSS do primitivo.
 */

export const PAINEL_LARGURA = 420;
export const PAINEL_BREAKPOINT = 768;
/** Lado do botão de fechar (e da faixa do topo). */
export const PAINEL_FECHAR = 40;
/** Folga mínima entre o painel e a borda da janela. */
const MARGEM = 8;

export interface RetanguloGatilho {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type PosicaoPainel = { modo: "ancorado"; topo: number; direita: number } | { modo: "livre" };

export function posicaoPainel(gatilho: RetanguloGatilho | null, larguraJanela: number): PosicaoPainel {
  if (larguraJanela < PAINEL_BREAKPOINT) return { modo: "livre" };
  if (!gatilho || gatilho.width <= 0 || gatilho.height <= 0) return { modo: "livre" };

  const centroX = gatilho.left + gatilho.width / 2;
  const centroY = gatilho.top + gatilho.height / 2;
  const topo = Math.max(MARGEM, Math.round(centroY - PAINEL_FECHAR / 2));
  const direitaBruta = Math.round(larguraJanela - centroX - PAINEL_FECHAR / 2);
  // O painel inteiro precisa caber: gatilho muito à esquerda empurra para dentro.
  const direita = Math.min(Math.max(MARGEM, direitaBruta), larguraJanela - PAINEL_LARGURA - MARGEM);
  return { modo: "ancorado", topo, direita };
}
