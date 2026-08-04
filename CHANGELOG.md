# Changelog

## v0.2.0 — 2026-08-04

Padrões de projeto opt-in em `css/patterns/` (export `./patterns/*`): CSS de recursos que nem todo sistema tem — quem implementa o recurso importa o padrão em vez de recriar o visual. Cada arquivo documenta o contrato de marcação com o app.

- `patterns/sidebar.css` — sidebar colapsável 248↔64px (`data-sidebar-collapsed` pré-hidratação, troca de logo, tooltips, toggle no hover).
- `patterns/editor-rico.css` — tipografia do editor rico (`.rich-editor-content`) e da leitura de Markdown (`.md-view`), chip de menção, placeholder, tabela GFM com seleção `--gold-bg`.
- `patterns/drive-link.css` — chip `drive://` "clique para copiar" com ícone de pasta via mask e feedback "Copiado".
- `patterns/kanban.css` — scrollbar fina da coluna do kanban (`.kanban-col-scroll`).
- `patterns/code-block.css` — classes `.tok-*` do realce de sintaxe (completa os tokens `--code-*`) e rolagem horizontal fina.
- `patterns/autosave.css` — barra de progresso indeterminada do auto-save, estática sob `prefers-reduced-motion`.

## v0.1.0 — 2026-08-04

Extração inicial da identidade visual a partir do Tasks (`src/app/globals.css` + `docs/design-system/`, sincronizados com o código em 04/08/2026).

- `css/tokens.css` — camadas 1A/1B, escala neutra `--premium-*`, status, auxiliares, raios, sombras, `--ease`, code theme; tema claro e escuro (`html.dark`), incluindo os pares temáticos `--gold-bg` e `--timer-idle`.
- `css/theme.css` — `@custom-variant dark` + `@theme inline` para Tailwind v4.
- `css/base.css` — `body`, `::selection` amarela, scrollbar, `.eyebrow`.
- `css/motion.css` — `fadeIn`, crossfade de View Transitions, `flash-novo`, `timer-pulse` (todos sob `prefers-reduced-motion`).
- `docs/` — documentação completa do design system (tokens, componentes, formulários, interação, motion, iconografia, dark mode, acessibilidade, ui-guidelines, showroom interativo e protótipo histórico).
