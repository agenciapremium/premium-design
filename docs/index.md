# Design System Premium

Documentação oficial do Design System do **Premium Demands System** (PREMIUM · MARKETING 360°). Este conjunto de documentos mapeia, especifica e demonstra todos os tokens, componentes e padrões visuais/comportamentais do produto.

> Última sincronização completa com o código: **2026-08-04** (auditoria doc ↔ `globals.css` + `src/components/ui/`).
>
> Este repositório (`premium-design`) é a **casa canônica** da identidade visual da Agência Premium. Os tokens vivem em [`css/tokens.css`](../css/tokens.css); a implementação de referência dos componentes é o repositório [Tasks](https://github.com/agenciapremium/tasks).

> [!IMPORTANT]
> **Fontes da verdade** (nesta ordem). Em conflito, vale o código:
> 1. Tokens: [`src/app/globals.css`](https://github.com/agenciapremium/tasks/blob/main/src/app/globals.css)
> 2. Primitivos: [`src/components/ui/`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/)
> 3. Regras de uso: [`docs/design-system/ui-guidelines.md`](ui-guidelines.md)
> 4. Referência visual histórica: [`docs/design-system/Prototipo-Sistema-Gestao-Demandas-Premium.html`](Prototipo-Sistema-Gestao-Demandas-Premium.html)

## Mapa da documentação

| Documento | Conteúdo |
|---|---|
| [Showroom interativo](showroom.html) | Página HTML autocontida com **todos** os tokens e componentes vivos, nos dois temas, com estados interativos. Abra no navegador. |
| [`tokens.md`](tokens.md) | Cores (hex/RGB, claro e escuro), tipografia, espaçamento, raios, sombras, easing e code theme. |
| [`componentes.md`](componentes.md) | Catálogo técnico de cada primitivo (todos os 47 arquivos de `src/components/ui/`): uso, anatomia, props, estados e boas práticas. |
| [`formularios.md`](formularios.md) | Padrões de formulário: campos, labels, validação, erro e auto-save. |
| [`padroes-de-interacao.md`](padroes-de-interacao.md) | Navegação, list→detalhe, overlays, feedback, batch actions, atalhos, voz e microcopy. |
| [`motion.md`](motion.md) | Animações, easing, durações e `prefers-reduced-motion`. |
| [`iconografia.md`](iconografia.md) | Biblioteca lucide-react, tamanhos e mapa conceito→ícone. |
| [`dark-mode.md`](dark-mode.md) | Mecanismo do tema escuro, paleta calibrada e regras de superfícies fixas. |
| [`acessibilidade.md`](acessibilidade.md) | Contraste WCAG, teclado, foco, ARIA e alvos de toque. |

## Identidade

- **Marca**: PREMIUM · MARKETING 360°. Acento de marca = **amarelo Premium** (`--brand-yellow #FBDA25`) sobre **preto Premium** (`--brand-ink #0A0A0A`). Símbolo: troféu (`lucide:trophy`) em amarelo sobre fundo escuro.
- **Idioma**: pt-BR formal ("você"), **sempre acentuado**. Tom direto, sem ironia, **sem emoji em UI de produção**.
- **Tipografia**: Ubuntu (300/400/500/700), fallback `system-ui, sans-serif`.

## Princípios de design

1. **Token antes de cor.** Nenhum componente usa hex direto — toda cor passa por `var(--token)`. É isso que faz o tema escuro funcionar "de graça" em ~95% dos componentes.
2. **Reuso antes de criação.** Antes de criar qualquer componente, procure o equivalente em `src/components/ui/`. Componente novo só com justificativa, e nasce documentado.
3. **Uma entrada para cada coisa.** Criação = FAB; confirmação = `ConfirmDialog`/`useConfirm`; feedback transitório = `useToast`; erro de submit = banner inline; edição = auto-save. Nunca janelas nativas do navegador (`alert`/`confirm`/`prompt` são barrados por lint).
4. **Estado na URL.** Filtros, abas e views vivem em `searchParams` — toda tela filtrada é um link compartilhável.
5. **Acessível por padrão.** Contraste AA, foco visível, alvo ≥ 40px, `prefers-reduced-motion` em toda animação. Ver [`acessibilidade.md`](acessibilidade.md).
6. **Dois temas, uma implementação.** O claro e o escuro são a mesma marcação; só a camada semântica de tokens muda. Todo PR de UI anexa screenshot dos dois temas.

## Arquitetura de tokens (4 camadas)

```
┌─ 1A. Marca crua ─────────────────────────────────────────────┐
│ --brand-yellow / --brand-gold / --brand-amber                │
│ --brand-ink / --brand-on-ink            FIXAS nos dois temas │
└──────────────────────────────────────────────────────────────┘
┌─ 1B. Semântico --c-* ────────────────────────────────────────┐
│ --c-bg, --c-surface, --c-sunken, --c-ink, --c-muted,         │
│ --c-subtle, --c-border, --c-border-strong, --c-emphasis...   │
│ ÚNICA camada que muda por tema (html.dark sobrescreve)       │
└──────────────────────────────────────────────────────────────┘
┌─ 2. @theme inline (Tailwind v4) ─────────────────────────────┐
│ Utilities semânticas: bg-bg, bg-surface, bg-sunken, text-ink,│
│ text-muted, text-subtle, border-border, border-border-strong │
│ + bg-brand, text-on-brand, bg-success-bg, text-danger...     │
└──────────────────────────────────────────────────────────────┘
┌─ 3. Variant dark: ───────────────────────────────────────────┐
│ Só para EXCEÇÕES visuais (logo/imagem de cor fixa).          │
└──────────────────────────────────────────────────────────────┘
```

Os tokens `--premium-*` (escala neutra literal) continuam válidos como **fachada semântica de compatibilidade** — no claro mantêm os valores originais; no escuro são recalibrados. Em código novo, prefira as utilities semânticas (`bg-surface`, `text-ink`, …).

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Estilo | Tailwind CSS v4 (config CSS-first em `globals.css`, `@theme inline`) |
| Ícones | `lucide-react@1.17` |
| Editor rico | Tiptap (Markdown GFM) + `marked` + `DOMPurify` na leitura |
| Animação | `motion@12` via `MotionProvider` (`LazyMotion` strict → `m.*`), presets em `src/lib/motion.ts` — ver [`motion.md`](motion.md) |
| Gráficos | SVG próprio (`bar-chart.tsx`, `line-chart.tsx`, `pie-chart.tsx`) — sem lib externa |
| Utilitário de classe | `cn()` (`src/lib/utils`) |

> [!NOTE]
> O `globals.css` declara `@source not "../../docs"` — esta pasta é **excluída do scan do Tailwind**. Exemplos de classe nesta documentação (e o showroom) não geram utilities nem quebram o build.

## Como começar (nova feature)

1. Abra o [showroom](showroom.html) e o [`componentes.md`](componentes.md): o que você precisa provavelmente já existe.
2. Monte a tela com o shell padrão: topbar (título via `PageHeader`) → `FilterBar` (filtros à esquerda; contexto → views → favorito à direita) → conteúdo. Criação entra pelo FAB, não por botão na tela.
3. Cores **só por token**; tipografia conforme a [escala](tokens.md#tipografia); espaçamento múltiplo de 4px.
4. Estados obrigatórios: hover, focus visível, disabled, loading (skeleton), empty, error.
5. Valide nos dois temas e rode o checklist de PR do [`ui-guidelines.md` §12](ui-guidelines.md).

## Checklist de revisão (resumo)

- [ ] Componentes vêm de `src/components/ui/`? Se novo, está documentado aqui?
- [ ] Cores via token, sem hex direto?
- [ ] Tipografia conforme escala (32/18/16/15/14/13/11/10)?
- [ ] Estados: hover, focus, disabled, loading, empty, error?
- [ ] Acessibilidade: foco, labels, alvo ≥ 40px, contraste AA?
- [ ] Dark mode validado (screenshots claro + escuro)?
- [ ] pt-BR formal e acentuado?
- [ ] Filtros em `searchParams`?
