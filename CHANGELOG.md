# Changelog

## v0.1.0 — 2026-08-04

Extração inicial da identidade visual a partir do Tasks (`src/app/globals.css` + `docs/design-system/`, sincronizados com o código em 04/08/2026).

- `css/tokens.css` — camadas 1A/1B, escala neutra `--premium-*`, status, auxiliares, raios, sombras, `--ease`, code theme; tema claro e escuro (`html.dark`), incluindo os pares temáticos `--gold-bg` e `--timer-idle`.
- `css/theme.css` — `@custom-variant dark` + `@theme inline` para Tailwind v4.
- `css/base.css` — `body`, `::selection` amarela, scrollbar, `.eyebrow`.
- `css/motion.css` — `fadeIn`, crossfade de View Transitions, `flash-novo`, `timer-pulse` (todos sob `prefers-reduced-motion`).
- `docs/` — documentação completa do design system (tokens, componentes, formulários, interação, motion, iconografia, dark mode, acessibilidade, ui-guidelines, showroom interativo e protótipo histórico).
