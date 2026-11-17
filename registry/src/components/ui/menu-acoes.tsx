"use client";

import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/utils";
import { motionPreset } from "@/lib/motion";
import { popoverPos } from "@/lib/popover-pos";
import { Tooltip } from "@/components/ui/tooltip";
import {
  achatarGrupos,
  alturaEstimadaMenu,
  ancoraDireita,
  ehTeclaNavegacao,
  primeiroHabilitado,
  proximoIndice,
  ultimoHabilitado,
} from "@/lib/menu-acoes-nav";

/** Uma ação do menu. */
export interface ItemMenuAcoes {
  /** Chave estável do item (também vira parte do `id` no DOM). */
  id: string;
  rotulo: string;
  icone?: LucideIcon;
  /** Chamado depois de o menu fechar e o foco voltar ao gatilho. */
  onSelect: () => void;
  /** Ação destrutiva: texto e ícone em `--danger`. */
  perigo?: boolean;
  /**
   * Motivo de o item estar desabilitado (vai na dica e no rótulo acessível).
   * `false`, vazio ou ausente: habilitado.
   */
  desabilitado?: string | false;
}

/** Um grupo de ações, com rótulo opcional; grupos vizinhos ganham divisória. */
export interface GrupoMenuAcoes {
  rotulo?: string;
  itens: ItemMenuAcoes[];
}

interface MenuAcoesProps {
  grupos: GrupoMenuAcoes[];
  /** Nome acessível do gatilho e do menu. Padrão: "Mais ações". */
  rotulo?: string;
  /** Conteúdo do gatilho. Padrão: o ícone "⋯" (`MoreHorizontal`). */
  gatilho?: ReactNode;
  /**
   * Classes do botão gatilho, que substituem as do padrão (40px com borda).
   * O `SlideOver` passa as do botão de fechar, para os dois formarem um par.
   */
  classeGatilho?: string;
  /** Largura do painel, em px. Padrão: 240. */
  largura?: number;
}

/** Gatilho padrão: 40×40, borda `--premium-mist`, como os botões de ícone do design system. */
const CLASSE_GATILHO_PADRAO =
  "w-10 h-10 shrink-0 rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--premium-white)] flex items-center justify-center text-[var(--premium-steel)] hover:border-[var(--premium-ink)] hover:text-[var(--premium-ink)] transition-colors cursor-pointer";

/** Foco visível e estado aberto, somados a qualquer classe de gatilho. */
const CLASSE_GATILHO_ESTADO =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] aria-expanded:bg-[var(--premium-bone)] aria-expanded:text-[var(--premium-ink)]";

/**
 * Menu de ações do design system (change almoxarifado-item-painel-layout, D1):
 * um botão "⋯" que abre uma lista de ações em grupos, com item de perigo e item
 * desabilitado com o motivo na dica. Usado no cabeçalho do `SlideOver` (prop
 * `menu`, à esquerda do "×") e em linhas de lista ("⋯" por linha).
 *
 * - **Posição:** portal no `body`, `position: fixed` pelo `popoverPos`, alinhado
 *   à direita do gatilho e preso à tela (abre para cima quando falta espaço).
 * - **Teclado:** roving tabindex nos itens habilitados (setas, Home, End);
 *   Enter e Espaço acionam; Tab fecha. Seta para baixo ou para cima no gatilho
 *   abre já no primeiro ou no último item.
 * - **Esc:** fecha só o menu, com `stopPropagation` num listener nativo do
 *   próprio painel, antes de a tecla chegar ao `document`, onde o `SlideOver`
 *   escuta para fechar o painel inteiro.
 * - **Clique fora:** uma camada transparente sob o menu recebe o clique e fecha
 *   só o menu; o scrim do `SlideOver` não chega a recebê-lo.
 * - **Foco:** ao abrir, vai ao primeiro item habilitado; ao fechar (Esc, clique
 *   fora, Tab ou ao acionar um item), volta ao gatilho. A ação do item roda
 *   depois disso, então um painel aberto por ela devolve o foco ao "⋯".
 */
export function MenuAcoes({ grupos, rotulo = "Mais ações", gatilho, classeGatilho, largura = 240 }: MenuAcoesProps) {
  const visiveis = grupos.filter((g) => g.itens.length > 0);
  const itens = achatarGrupos(visiveis);
  const baseId = useId();
  const menuId = `${baseId}-menu`;
  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const [rect, setRect] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
  const montado = useSyncExternalStore(semAssinatura, () => true, () => false);

  // As funções do listener nativo leem sempre o estado atual.
  const estadoRef = useRef({ itens, ativo });
  useEffect(() => {
    estadoRef.current = { itens, ativo };
  });

  function medir() {
    const r = gatilhoRef.current?.getBoundingClientRect();
    if (r) setRect({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
  }

  function abrir(foco: "primeiro" | "ultimo") {
    medir();
    setAtivo(foco === "primeiro" ? primeiroHabilitado(itens) : ultimoHabilitado(itens));
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    setAtivo(-1);
    gatilhoRef.current?.focus();
  }

  function acionar(item: ItemMenuAcoes) {
    if (item.desabilitado) return;
    fechar();
    item.onSelect();
  }

  // Foco no item ativo (roving tabindex) enquanto aberto; sem item habilitado,
  // o próprio painel recebe o foco, para o Esc continuar funcionando.
  useEffect(() => {
    if (!aberto) return;
    const alvo = ativo >= 0 ? itemRefs.current[ativo] : menuRef.current;
    alvo?.focus();
  }, [aberto, ativo]);

  // Reposiciona ao rolar ou redimensionar a janela.
  useEffect(() => {
    if (!aberto) return;
    window.addEventListener("scroll", medir, true);
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir, true);
      window.removeEventListener("resize", medir);
    };
  }, [aberto]);

  // Teclado num listener NATIVO do painel: o stopPropagation do Esc corta a
  // tecla antes do `document`, qualquer que seja o contêiner da raiz do React.
  useEffect(() => {
    if (!aberto) return;
    const el = menuRef.current;
    if (!el) return;
    function onKeyDown(e: KeyboardEvent) {
      const { itens: lista, ativo: atual } = estadoRef.current;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        fechar();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        fechar();
        return;
      }
      if (ehTeclaNavegacao(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const i = proximoIndice(lista, atual, e.key);
        if (i >= 0) setAtivo(i);
      }
    }
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [aberto]);

  if (itens.length === 0) return null;

  const estilo = rect ? popoverPos(ancoraDireita(rect, largura), largura, alturaEstimadaMenu(visiveis)) : null;
  // Índice de cada item na lista achatada (roving tabindex), por grupo.
  const inicioGrupo = visiveis.map((_, gi) => visiveis.slice(0, gi).reduce((s, g) => s + g.itens.length, 0));

  return (
    <>
      <button
        ref={gatilhoRef}
        type="button"
        aria-label={rotulo}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? menuId : undefined}
        onClick={() => (aberto ? fechar() : abrir("primeiro"))}
        onKeyDown={(e) => {
          if (aberto) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            abrir(e.key === "ArrowDown" ? "primeiro" : "ultimo");
          }
        }}
        className={cn(classeGatilho ?? CLASSE_GATILHO_PADRAO, CLASSE_GATILHO_ESTADO)}
      >
        {gatilho ?? <MoreHorizontal size={18} aria-hidden />}
      </button>
      {montado &&
        createPortal(
          <>
            {aberto && (
              // Camada do clique fora: fecha só o menu (o clique não chega ao
              // scrim do SlideOver nem a outro controle da página).
              <div aria-hidden className="fixed inset-0 z-[60]" onClick={fechar} data-foco-livre="" />
            )}
            <AnimatePresence>
              {aberto && estilo && (
                <m.div
                  key="menu"
                  ref={menuRef}
                  {...motionPreset("menu")}
                  id={menuId}
                  role="menu"
                  aria-label={rotulo}
                  tabIndex={-1}
                  style={{ ...estilo, transformOrigin: estilo.bottom !== undefined ? "bottom right" : "top right" }}
                  className={cn(
                    "z-[61] rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--premium-white)] p-1.5 shadow-[var(--sh-md)] focus:outline-none",
                    // Rolagem só quando a altura foi limitada: sem ela, o balão
                    // da dica do item desabilitado não é recortado.
                    estilo.maxHeight !== undefined && "overflow-y-auto",
                  )}
                >
                  {visiveis.map((g, gi) => {
                    const rotuloId = `${baseId}-g${gi}`;
                    return (
                      <div key={gi} role="group" aria-labelledby={g.rotulo ? rotuloId : undefined}>
                        {gi > 0 && <div role="separator" className="mx-1.5 my-1 h-px bg-[var(--premium-mist)]" />}
                        {g.rotulo && (
                          <div
                            id={rotuloId}
                            className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-wider text-[var(--premium-gray)]"
                          >
                            {g.rotulo}
                          </div>
                        )}
                        {g.itens.map((item, ii) => {
                          const i = inicioGrupo[gi] + ii;
                          const Icone = item.icone;
                          const motivo = item.desabilitado || null;
                          const botao = (
                            <button
                              ref={(el) => {
                                itemRefs.current[i] = el;
                              }}
                              id={`${baseId}-i-${item.id}`}
                              type="button"
                              role="menuitem"
                              tabIndex={i === ativo ? 0 : -1}
                              aria-disabled={motivo ? true : undefined}
                              aria-label={motivo ? `${item.rotulo} (${motivo})` : undefined}
                              onClick={() => acionar(item)}
                              onMouseEnter={() => !motivo && setAtivo(i)}
                              className={cn(
                                "flex min-h-10 w-full items-center gap-2.5 rounded-[var(--r-md)] px-2.5 text-left text-[13px] transition-colors",
                                "focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--yellow-50)]",
                                motivo
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer hover:bg-[var(--premium-bone)] focus-visible:bg-[var(--premium-bone)]",
                                item.perigo ? "text-[var(--danger)]" : "text-[var(--premium-ink)]",
                              )}
                            >
                              {Icone && <Icone size={16} aria-hidden className="shrink-0" />}
                              <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
                            </button>
                          );
                          return motivo ? (
                            <Tooltip key={item.id} label={motivo} side="bottom" className="w-full">
                              {botao}
                            </Tooltip>
                          ) : (
                            <div key={item.id}>{botao}</div>
                          );
                        })}
                      </div>
                    );
                  })}
                </m.div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </>
  );
}

const semAssinatura = () => () => {};
