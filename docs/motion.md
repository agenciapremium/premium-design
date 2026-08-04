# Motion — animações e transições

Movimento no sistema é **funcional e discreto**: orienta a atenção, confirma interação, nunca decora. Uma única curva de easing dá identidade a tudo, servida por duas camadas: **CSS** (`globals.css`, para o que roda sem JS — skeletons de rota, barras indeterminadas, hovers) e **Motion for React** (`motion/react`, para overlays com animação de saída).

## Curva padrão

```css
--ease: cubic-bezier(.22, .61, .36, 1);
```

Saída rápida, assentamento suave (ease-out pronunciado). É a curva de **todas** as transições e animações do sistema — não introduzir curvas novas. No lado React ela é espelhada pela constante `EASE` de `src/lib/motion.ts` (`[0.22, 0.61, 0.36, 1]`). Exceção única e documentada: o pulso do cronômetro parado (`timerPulse`) usa `ease-in-out`, por ser um ciclo simétrico e contínuo.

## Provider de animação (`MotionProvider`)

`src/components/ui/motion-provider.tsx` monta o provider único do design system nos três shells (app interno, portal do cliente e docs):

- `LazyMotion features={domAnimation} strict` — carrega só o pacote leve (~20 kb: animações, variants, exit, gestos de hover/tap). O modo `strict` faz `motion.*` lançar erro: **use sempre `m.*`**.
- `MotionConfig reducedMotion="user"` — respeita `prefers-reduced-motion` por construção, sem tratamento caso a caso.
- Transição default: `{ duration: 0.2, ease: EASE }`.
- Componentes `m.*` renderizados via portal (ex.: `SlideOver`) continuam cobertos: o contexto React atravessa `createPortal`.
- O pacote completo `domMax` (animações de layout, `layoutId`) vive em `src/lib/motion-features-max.ts` e é carregado **assíncrono e só no board de Quadros** (`LazyMotion` aninhado em `quadro-kanban.tsx`) — nas demais páginas, `layout`/`layoutId` são no-op.

## Presets de overlay (`src/lib/motion.ts`)

Vocabulário central: cada preset tem `hidden` (inicial), `visible` (entrada) e `exit` (saída, sempre ≤ entrada). Aplicar via `motionPreset(nome)` sob `AnimatePresence`:

```tsx
<m.div {...motionPreset("modal")} />
```

| Preset | Entrada | Saída | Movimento | Onde |
|---|---|---|---|---|
| `scrim` | 150ms | 120ms | opacity | Fundo de modais e slide-overs; Lightbox |
| `modal` | 200ms | 150ms | opacity + `scale(.98)` → 1 | ConfirmDialog, CardModal, buscas, modais de IA/link |
| `slideOver` | 200ms | 150ms | opacity + `x: 8px` → 0 | SlideOver |
| `menu` | 130ms | 80ms | opacity + `y: -4px` + `scale(.98)` | Dropdowns, popovers, MultiSelect, EmojiPicker, menus de contexto |
| `toast` | 180ms | 140ms | opacity + `y: -4px` → 0 | Toasts e toaster de notificações |

Para expansão de altura (accordion, raias do Kanban, árvore de docs) use o componente `Expansivel` (`src/components/ui/expansivel.tsx`): anima `height: 0 ↔ auto` + opacity em ~200ms com a curva `EASE`, zerando a duração sob `prefers-reduced-motion` (altura não é transform, o `MotionConfig` não a desliga sozinho).

## Durações

| Padrão | Duração | Onde |
|---|---|---|
| Hover/transição de clicáveis | **140–150ms** | Botões (`transition-all duration-150 ease-[var(--ease)]`), FAB/dial (`.14s var(--ease)`), links da sidebar, chips, tabs |
| Overlays (entrada) | **130–200ms** | Presets acima (`menu` 130 · `scrim` 150 · `toast` 180 · `modal`/`slideOver` 200) |
| Fade-in de skeleton de rota | **150ms** | `loading.tsx`: `animate-[fadeIn_.15s_ease]` (keyframe `fadeIn` em `globals.css`); `EmptyState` usa 180ms |
| Crossfade de troca de aba (View Transitions) | **200ms** | `::view-transition-old/new(root)`; disparado por `navegarComTransicao` (`src/lib/view-transition.ts`) |
| Expansão de altura (`Expansivel`) | 200ms | Accordion, raias do Kanban, árvore de docs |
| Colapso da sidebar | 200ms | `transition-[width] duration-200 ease-in-out` |
| Tooltip | 100ms | opacity |
| Flash de comentário novo | **600ms** (one-shot) | `.flash-novo`: `background-color` de `--gold-bg` → transparente |
| Barra indeterminada (auto-save / SlideOver) | loop **1.1s** | `.autosave-bar`: `translateX(-100%) → translateX(300%)`, largura 40% |
| Pulso do cronômetro parado | loop **1.6s** `ease-in-out` | `.timer-pulse`: opacity 1 → 0.55 (exceção documentada à curva única) |
| Skeleton | `motion-safe:animate-pulse` | Pulso de opacidade do Tailwind (~2s) nos blocos `--premium-bone` |

## Receitas canônicas

```tsx
/* Hover de card clicável (Card hover): sobe 2px e ganha sombra média */
"transition-all duration-150 ease-[var(--ease)] hover:shadow-[var(--sh-md)] hover:-translate-y-[2px]"

/* Active do botão primário: afunda 1px */
"active:translate-y-px"

/* Overlay com saída animada: preset + AnimatePresence */
<AnimatePresence>{open && <m.div {...motionPreset("slideOver")} />}</AnimatePresence>

/* Expansão de altura (nunca animar height na mão) */
<Expansivel open={open} id={bodyId}>{children}</Expansivel>
```

```css
/* Barra de auto-save (indeterminada) — globals.css */
@keyframes autosaveBar {
  from { transform: translateX(-100%); }
  to   { transform: translateX(300%); }
}

/* FAB dial: revela no hover/foco */
.fab-dial-closed { opacity: 0; transform: translateY(8px) scale(.96); }
/* transição de .14s var(--ease) em opacity + transform */

/* Chevron de accordion */
transition: transform 150ms; /* rotate(180deg) no aberto */
```

## `prefers-reduced-motion` (obrigatório)

Overlays `m.*` já nascem cobertos pelo `MotionConfig reducedMotion="user"` (transforms suprimidos; opacity permanece). O restante recebe supressão explícita:

| Componente | Comportamento com `reduce` |
|---|---|
| Overlays (`m.*` + presets) | `MotionConfig reducedMotion="user"` desliga os transforms automaticamente |
| `Expansivel` | Duração zerada via `useReducedMotion` (height não é transform) |
| Barras indeterminadas (auto-save, SlideOver) | Viram barra **cheia estática** (`width: 100%; transform: none`) — o estado continua comunicado |
| Keyframes CSS (`fadeIn`, `flashNovo`, `timerPulse`, `autosaveBar`) | Declarados **dentro** de `@media (prefers-reduced-motion: no-preference)` |
| Crossfade de aba (View Transitions) | `navegarComTransicao` navega sem `startViewTransition` |
| Cronômetro parado | Não pulsa — o alerta permanece pela cor amarela estática |
| Skeleton / spinners | `motion-safe:animate-pulse` / `motion-reduce:animate-none` |
| Accordion / tabs / lightbox / botão em loading | `motion-reduce:transition-none` |

Em Tailwind, usar as variants `motion-reduce:` / `motion-safe:`; em CSS puro, o padrão dos dois blocos `@media` (ver `.autosave-bar` em `globals.css`).

## Regras

- ✅ Animar **apenas** `transform` e `opacity` em loops (compositor). Exceções one-shot documentadas: `Expansivel` (height, 200ms) e `.flash-novo` (background-color, 600ms).
- ✅ Movimento curto e de pequena amplitude (2–8px) — confirmação, não espetáculo.
- ✅ Saída sempre ≤ entrada (presets); overlays desmontam **após** a saída via `AnimatePresence`.
- ✅ Estados de loading comunicam também sem animação (texto "Salvando...", barra estática).
- ✅ `m.*` sempre (o `strict` do `LazyMotion` faz `motion.*` lançar erro); nenhum consumidor importa `motion/react` para overlays fora dos presets.
- ❌ Sem animação de entrada em listas inteiras (cascatas), sem bounce/elastic, sem parallax.
- ❌ Sem `transition: all` em árvores grandes (custo de estilo) — ok em elementos pequenos e isolados, como já praticado.
