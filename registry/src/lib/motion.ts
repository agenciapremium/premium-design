import type { Variants } from "motion/react";

/**
 * Vocabulário central de animação (change animacoes-motion-overlays).
 *
 * Espelha a curva `--ease` do design system (docs/design-system/ui-guidelines.md §2.6):
 * `cubic-bezier(.22,.61,.36,1)`. Mantido como tupla mutável para casar com a
 * assinatura `BezierDefinition` do Motion.
 */
export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/**
 * Presets nomeados para os overlays. Cada preset tem três estados: `hidden`
 * (inicial e alvo de saída), `visible` (entrada) e `exit` (saída, sempre com
 * duração ≤ entrada). Use via `motionPreset(nome)`.
 *
 * Para expansão de altura (accordion, raias, árvore de docs) use o componente
 * `Expansivel` (src/components/ui/expansivel.tsx), que anima `height: 0 ↔ auto`
 * respeitando `prefers-reduced-motion`.
 */
export const presets = {
  // Fundo (scrim) de modais e slide-overs.
  scrim: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.12, ease: EASE } },
  },
  // Caixas centrais: CardModal, ConfirmDialog, buscas, modais de IA/link.
  modal: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: EASE } },
  },
  // Painel lateral (SlideOver): desliza a partir da direita.
  slideOver: {
    hidden: { opacity: 0, x: 8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: EASE } },
    exit: { opacity: 0, x: 8, transition: { duration: 0.15, ease: EASE } },
  },
  // Menus de contexto, dropdowns e popovers: entrada rápida, saída seca.
  menu: {
    hidden: { opacity: 0, y: -4, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.13, ease: EASE } },
    exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.08, ease: EASE } },
  },
  // Toasts e toaster de notificações em tempo real.
  toast: {
    hidden: { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.14, ease: EASE } },
  },
} satisfies Record<string, Variants>;

export type PresetName = keyof typeof presets;

/**
 * Props prontas para um `m.*` sob `AnimatePresence`: aplica o preset e liga
 * os estados de entrada/saída. Ex.: `<m.div {...motionPreset("modal")} />`.
 */
export function motionPreset(name: PresetName) {
  return {
    variants: presets[name],
    initial: "hidden" as const,
    animate: "visible" as const,
    exit: "exit" as const,
  };
}

/**
 * Curvas do painel de cards flutuantes (premium-design v0.10.0, tokens
 * `--ease-mola` e `--ease-sai`). A mola passa de 1 no eixo y para um rebote
 * curto nas ENTRADAS; a saída acelera (ease-in) e é sempre mais curta.
 */
export const EASE_MOLA: [number, number, number, number] = [0.3, 1.35, 0.5, 1];
export const EASE_SAI: [number, number, number, number] = [0.4, 0, 1, 1];

/** Teto da cascata: do 7º item em diante, todos entram com o atraso do 7º. */
export const PAINEL_CASCATA_TETO = 6;
/** Teto da cascata de saída (de baixo para cima). */
const PAINEL_SAIDA_TETO = 7;

/**
 * `custom` das peças do painel (capability painel-cards-flutuantes, design D6).
 * `i` = posição de cima para baixo; `j` = posição de baixo para cima (saída);
 * `base` = atraso inicial da cascata (70ms ao abrir, 0 ao trocar o recorte);
 * `chega` = item que acabou de chegar em tempo real (entra pela direita).
 */
export interface PainelCustom {
  reduzido: boolean;
  i?: number;
  j?: number;
  base?: number;
  chega?: boolean;
}

const soOpacidade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: EASE } },
};

/**
 * Variantes do painel de cards, todas dirigidas por `custom` (`PainelCustom`).
 * Com movimento reduzido viram opacidade pura, sem atraso: o `MotionConfig
 * reducedMotion="user"` corta transforms, mas não os atrasos da cascata.
 */
export const painelVariantes = {
  scrim: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.16, ease: EASE } },
    exit: (c: PainelCustom) => ({
      opacity: 0,
      transition: { duration: c.reduzido ? 0.12 : 0.16, ease: EASE_SAI, delay: c.reduzido ? 0 : 0.09 },
    }),
  },
  // O X gira no lugar do gatilho (o sino "vira" o X).
  fechar: {
    hidden: (c: PainelCustom) => (c.reduzido ? soOpacidade.hidden : { opacity: 0, rotate: -120, scale: 0.4 }),
    visible: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.visible
        : { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.34, ease: EASE_MOLA } },
    exit: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.exit
        : { opacity: 0, rotate: 90, scale: 0.5, transition: { duration: 0.16, ease: EASE_SAI, delay: 0.08 } },
  },
  // Pílulas do topo: deslizam a partir do X (i = 0 é a mais próxima dele).
  pilula: {
    hidden: (c: PainelCustom) => (c.reduzido ? soOpacidade.hidden : { opacity: 0, x: 28, scale: 0.9 }),
    visible: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.visible
        : {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.3, ease: EASE_MOLA, delay: 0.04 + (c.i ?? 0) * 0.045 },
          },
    exit: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.exit
        : {
            opacity: 0,
            x: 18,
            scale: 0.92,
            transition: { duration: 0.14, ease: EASE_SAI, delay: 0.06 + (c.i ?? 0) * 0.02 },
          },
  },
  // Rótulos de dia e cards: descem em cascata; saem de baixo para cima.
  item: {
    hidden: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.hidden
        : c.chega
          ? { opacity: 0, x: 36, scale: 0.97 }
          : { opacity: 0, y: -18, rotateX: -24, scale: 0.95, transformPerspective: 900 },
    visible: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.visible
        : {
            opacity: 1,
            x: 0,
            y: 0,
            rotateX: 0,
            scale: 1,
            transformPerspective: 900,
            transition: c.chega
              ? { duration: 0.45, ease: EASE_MOLA }
              : {
                  duration: 0.32,
                  ease: EASE_MOLA,
                  delay: (c.base ?? 0.07) + Math.min(c.i ?? 0, PAINEL_CASCATA_TETO) * 0.032,
                },
          },
    exit: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.exit
        : {
            opacity: 0,
            y: -12,
            scale: 0.96,
            transition: { duration: 0.15, ease: EASE_SAI, delay: Math.min(c.j ?? 0, PAINEL_SAIDA_TETO) * 0.016 },
          },
  },
  // Base: sobe por último (i = quantos itens a cascata mostrou).
  base: {
    hidden: (c: PainelCustom) => (c.reduzido ? soOpacidade.hidden : { opacity: 0, y: 10 }),
    visible: (c: PainelCustom) =>
      c.reduzido
        ? soOpacidade.visible
        : {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.26,
              ease: EASE,
              delay: 0.15 + Math.min(c.i ?? 0, PAINEL_CASCATA_TETO) * 0.032,
            },
          },
    exit: (c: PainelCustom) =>
      c.reduzido ? soOpacidade.exit : { opacity: 0, transition: { duration: 0.1, ease: EASE_SAI } },
  },
} satisfies Record<string, Variants>;
