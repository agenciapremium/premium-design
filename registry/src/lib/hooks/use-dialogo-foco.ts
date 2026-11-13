"use client";

import { useEffect, useRef } from "react";
import { SELETOR_FOCAVEIS, ehCampoDeTexto, proximoFocavel, type DirecaoFoco } from "@/lib/foco";

/**
 * Foco gerenciado de overlay (capability overlays-gestao-de-foco). Um hook só,
 * usado por TODO overlay com `aria-modal="true"` (slide-over, diálogo de
 * confirmação, busca global, lightbox, modal de card) e, no modo sem trap, por
 * popovers que precisam apenas devolver o foco ao gatilho.
 *
 * O que ele faz, na ordem (design D1):
 *   1. guarda quem tinha o foco antes de abrir;
 *   2. no frame seguinte move o foco para o alvo inicial dentro do painel;
 *   3. enquanto aberto e no topo da pilha, cicla `Tab`/`Shift+Tab` dentro do painel;
 *   4. marca o resto da página como `inert` (reforço progressivo, D4);
 *   5. ao fechar, desfaz o `inert` e devolve o foco ao gatilho.
 *
 * NÃO substitui o `Esc` de cada overlay (que já existe e respeita a pilha) nem
 * mexe em animação, tamanho ou empilhamento.
 */

/** Ref de elemento aceita pelo hook (compatível com `useRef<HTMLDivElement>(null)`). */
type RefElemento = { current: HTMLElement | null };

/**
 * Alvo de foco: uma ref, um seletor CSS resolvido dentro do painel, `"primeiro"`
 * (primeiro focável do escopo) ou `"nenhum"` (não mexe no foco ao abrir).
 */
export type AlvoFoco = RefElemento | string | "primeiro" | "nenhum";

export interface DialogoFocoOpcoes {
  /** O overlay está aberto? Vira `false` no INÍCIO do fechamento, não ao fim da animação. */
  aberto: boolean;
  /** Contêiner do painel: o elemento que carrega `role="dialog"`. */
  ref: RefElemento;
  /** Alvo do foco ao abrir. Padrão: primeiro focável do escopo. */
  inicial?: AlvoFoco;
  /** Onde procurar o "primeiro" focável (ex.: o corpo do slide-over, sem o cabeçalho). */
  escopoInicial?: RefElemento;
  /**
   * Alvo de reserva: usado quando o inicial não existe (painel de leitura) e
   * quando a viewport é estreita e o inicial é campo de digitação (evita abrir o
   * teclado virtual). Tipicamente o título do painel ou o botão de fechar.
   */
  alternativo?: AlvoFoco;
  /**
   * Em viewport estreita, desvia o foco inicial de campos de digitação para não
   * abrir o teclado virtual (padrão: ligado). Desligue quando digitar É a razão
   * do overlay (busca global).
   */
  evitarTecladoVirtual?: boolean;
  /** Prende o `Tab` no painel. `true` para modal; `false` para popover não modal. */
  prender?: boolean;
  /** Consulta a pilha de overlays: só o topo prende. */
  estaNoTopo?: () => boolean;
  /** Liga o reforço `inert` no restante da página (padrão: ligado). */
  reforcoInert?: boolean;
  /** Roda depois que o foco volta ao gatilho. */
  aoFechar?: () => void;
}

/**
 * Chave geral do reforço `inert` (design D4). O ciclo de `Tab` é a garantia; o
 * `inert` é reforço para leitor de tela e ponteiro. Se algum efeito colateral
 * aparecer (FAB arrastável, portal de terceiro), basta desligar aqui.
 */
const REFORCO_INERT_LIGADO = true;

/** Abaixo disso o foco inicial foge de campos de digitação (teclado virtual). */
const VIEWPORT_ESTREITA = "(max-width: 767px)";

/** Nós que nunca recebem `inert`: não são conteúdo alcançável por foco. */
const TAGS_FORA_DO_INERT = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"]);

/**
 * Pilha dos overlays que prendem o foco, na ordem de abertura. Só o último
 * responde ao `Tab` — assim um `ConfirmDialog` aberto sobre um `SlideOver` (ou um
 * painel aninhado) assume o ciclo sem que o de baixo puxe o foco de volta.
 */
const pilhaDeTrap: object[] = [];

/** O elemento pode receber `Tab` (existe, tem caixa e não está desabilitado)? */
function visivel(el: HTMLElement): boolean {
  return el.isConnected && el.getClientRects().length > 0;
}

function focaveisVisiveis(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS)).filter(visivel);
}

function primeiroFocavel(escopo: HTMLElement): HTMLElement | null {
  return focaveisVisiveis(escopo)[0] ?? null;
}

function resolverAlvo(
  alvo: AlvoFoco | undefined,
  container: HTMLElement,
  escopo: HTMLElement
): HTMLElement | null {
  if (!alvo || alvo === "nenhum") return null;
  if (alvo === "primeiro") return primeiroFocavel(escopo);
  if (typeof alvo === "string") {
    const achado = container.querySelector<HTMLElement>(alvo);
    if (!achado) return null;
    // Seletor que aponta para um invólucro (ex.: a caixa do título): o alvo real
    // é o primeiro focável dentro dele.
    return achado.matches(SELETOR_FOCAVEIS) ? achado : (primeiroFocavel(achado) ?? achado);
  }
  // Ref: é escolha explícita de quem chama, então vale mesmo com tabindex -1
  // (é assim que o título do painel recebe o foco de leitura).
  return alvo.current;
}

function ehCampoDeTextoEl(el: HTMLElement): boolean {
  return ehCampoDeTexto({
    tag: el.tagName,
    tipo: el instanceof HTMLInputElement ? el.type : null,
    editavel: el.isContentEditable,
  });
}

function tentarFocar(el: HTMLElement | null): boolean {
  if (!el || typeof el.focus !== "function") return false;
  el.focus();
  return document.activeElement === el;
}

function focoInicial(o: DialogoFocoOpcoes) {
  const container = o.ref.current;
  if (!container) return;
  const escopo = o.escopoInicial?.current ?? container;
  let alvo = resolverAlvo(o.inicial ?? "primeiro", container, escopo);

  // Viewport estreita: campo de digitação abriria o teclado virtual sobre o
  // painel recém-aberto, então o foco vai para o alternativo (o título).
  const estreita =
    (o.evitarTecladoVirtual ?? true) &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(VIEWPORT_ESTREITA).matches;
  if (alvo && estreita && ehCampoDeTextoEl(alvo)) {
    alvo = resolverAlvo(o.alternativo, container, escopo) ?? container;
  }
  if (o.inicial === "nenhum" && !alvo) return;

  // Cadeia de reserva: alvo → alternativo (título/fechar) → o próprio painel,
  // que sempre aceita o foco (tabindex -1). Painel de leitura cai no título.
  for (const candidato of [alvo, resolverAlvo(o.alternativo, container, escopo), container]) {
    if (!candidato) continue;
    if (candidato === container && !container.hasAttribute("tabindex")) {
      container.setAttribute("tabindex", "-1");
    }
    if (tentarFocar(candidato)) return;
  }
}

/**
 * Reforço `inert` (D4): marca os irmãos do painel, subindo até o `body`, para
 * que leitor de tela e ponteiro não alcancem a página atrás. Devolve só o que
 * ESTE overlay marcou — o que já estava inerte pertence a um overlay de fora e
 * não pode ser liberado por aqui.
 *
 * Ficam de fora: o próprio caminho do painel, os scrims (`data-foco-livre`, que
 * precisam continuar clicáveis para fechar) e as regiões `aria-live` (o toast
 * continua anunciando e podendo ser dispensado com um painel aberto).
 */
function marcarInerte(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  if (typeof HTMLElement === "undefined" || !("inert" in HTMLElement.prototype)) return [];
  const marcados: HTMLElement[] = [];
  let no: HTMLElement | null = container;
  while (no && no !== document.body && no.parentElement) {
    const pai: HTMLElement = no.parentElement;
    for (const irmao of Array.from(pai.children)) {
      if (irmao === no || !(irmao instanceof HTMLElement)) continue;
      if (TAGS_FORA_DO_INERT.has(irmao.tagName)) continue;
      if (irmao.inert) continue;
      if (irmao.hasAttribute("data-foco-livre")) continue;
      if (irmao.hasAttribute("aria-live") || irmao.querySelector("[aria-live]")) continue;
      irmao.inert = true;
      marcados.push(irmao);
    }
    no = pai;
  }
  return marcados;
}

function devolverFoco(anterior: HTMLElement | null) {
  if (anterior && typeof anterior.focus === "function" && visivel(anterior)) {
    anterior.focus();
    return;
  }
  // Gatilho não existe mais: o foco vai para o corpo do documento, sem erro.
  const ativo = document.activeElement as HTMLElement | null;
  if (ativo && ativo !== document.body) ativo.blur?.();
}

export function useDialogoFoco(opcoes: DialogoFocoOpcoes) {
  const { aberto } = opcoes;
  // As opções ficam num ref: o efeito depende só de `aberto`, senão qualquer
  // render do consumidor reinstalaria tudo e reposicionaria o foco no meio da
  // digitação.
  const opcoesRef = useRef(opcoes);
  // Sincroniza depois do commit (nunca durante o render) e antes do efeito
  // principal, que está declarado abaixo.
  useEffect(() => {
    opcoesRef.current = opcoes;
  });

  useEffect(() => {
    if (!aberto) return;
    const inicio = opcoesRef.current;
    const prender = inicio.prender ?? true;
    const anterior = document.activeElement as HTMLElement | null;
    const marca = {};
    if (prender) pilhaDeTrap.push(marca);

    // Foco inicial no próximo frame: o painel acabou de montar e a animação de
    // entrada já começou, então os focáveis do conteúdo já existem.
    const raf = requestAnimationFrame(() => focoInicial(opcoesRef.current));

    const inertes =
      REFORCO_INERT_LIGADO && (inicio.reforcoInert ?? true) ? marcarInerte(inicio.ref.current) : [];

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      const o = opcoesRef.current;
      const container = o.ref.current;
      if (!container) return;
      // Só o overlay do topo prende: o de baixo (ou o painel pai) fica quieto.
      if (pilhaDeTrap[pilhaDeTrap.length - 1] !== marca) return;
      if (o.estaNoTopo && !o.estaNoTopo()) return;

      // Recalculados a cada Tab: o painel ganha e perde controles enquanto está
      // aberto (auto-save, campos condicionais).
      const lista = focaveisVisiveis(container);
      if (lista.length === 0) return;

      const ativo = document.activeElement as HTMLElement | null;
      const direcao: DirecaoFoco = e.shiftKey ? "tras" : "frente";
      const dentro = !!ativo && container.contains(ativo);

      if (!dentro) {
        // Foco em outro overlay ou num popover em portal (calendário do
        // DatePicker): quem manda é ele. Só recuperamos o foco realmente perdido.
        const perdido = !ativo || ativo === document.body || ativo === document.documentElement;
        if (!perdido) return;
        const alvo = proximoFocavel(lista, null, direcao);
        if (!alvo) return;
        e.preventDefault();
        alvo.focus();
        return;
      }

      const i = ativo ? lista.indexOf(ativo) : -1;
      const noExtremo = direcao === "frente" ? i === lista.length - 1 : i === 0;
      // No meio do painel a ordem natural do DOM já resolve: não prevenimos o
      // Tab (editores ricos e widgets compostos continuam recebendo a tecla).
      if (i !== -1 && !noExtremo) return;
      const alvo = proximoFocavel(lista, i === -1 ? null : ativo, direcao);
      if (!alvo) return;
      e.preventDefault();
      alvo.focus();
    }

    if (prender) document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      if (prender) {
        document.removeEventListener("keydown", onKeyDown);
        const i = pilhaDeTrap.lastIndexOf(marca);
        if (i !== -1) pilhaDeTrap.splice(i, 1);
      }
      // O inert sai ANTES da devolução: o gatilho pode estar no painel de baixo,
      // que este overlay havia marcado.
      for (const el of inertes) el.inert = false;
      devolverFoco(anterior);
      opcoesRef.current.aoFechar?.();
    };
  }, [aberto]);
}
