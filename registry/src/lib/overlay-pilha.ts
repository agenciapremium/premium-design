/**
 * Pilha dos overlays modais que respondem ao `Esc` pela ordem de abertura
 * (capability overlays-gestao-de-foco). Nasceu privada no `SlideOver`; saiu
 * para cá quando o `PainelCards` (capability painel-cards-flutuantes) passou a
 * precisar da mesma pilha: um slide-over aberto a partir do painel, ou o painel
 * aberto sobre um slide-over, fecham só o de cima.
 *
 * Módulo de estado de página (um array por aba), sem React.
 */

const pilha: string[] = [];

/**
 * Registra o overlay `id` no topo da pilha e trava a rolagem do corpo.
 * Devolve a função que o retira (e destrava a rolagem quando a pilha esvazia).
 */
export function registrarOverlay(id: string): () => void {
  pilha.push(id);
  document.body.style.overflow = "hidden";
  return () => {
    const i = pilha.lastIndexOf(id);
    if (i !== -1) pilha.splice(i, 1);
    if (pilha.length === 0) document.body.style.overflow = "";
  };
}

/**
 * O overlay `id` é o topo da pilha? Usado pelo foco gerenciado
 * (`useDialogoFoco`) e pelo `Esc`: só o overlay do topo prende o `Tab` e fecha.
 */
export function estaNoTopo(id: string): boolean {
  return pilha.length > 0 && pilha[pilha.length - 1] === id;
}

/**
 * Há algum diálogo modal na tela agora? (capability atalhos-teclado, design D1.)
 *
 * O provedor de atalhos consulta isto antes de disparar qualquer tecla: com um
 * painel aberto, a pessoa está no meio de uma tarefa, e abrir outra coisa por
 * cima é perder o que ela estava fazendo.
 *
 * Duas fontes porque há dois tipos de overlay: os que se registram na pilha
 * acima (`SlideOver`, `PainelCards`) e os modais que montam o próprio
 * `role="dialog"` sem passar por ela (busca global, confirmação, lightbox,
 * modal de card, o drawer da sidebar no celular). A consulta ao DOM cobre os
 * dois casos, mas custa uma `querySelector` por tecla, por isso a pilha
 * responde primeiro.
 */
export function temOverlayAberto(): boolean {
  if (pilha.length > 0) return true;
  if (typeof document === "undefined") return false;
  return !!document.querySelector('[role="dialog"][aria-modal="true"]');
}
