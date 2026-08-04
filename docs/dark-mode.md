# Dark mode

O tema escuro é uma **paleta calibrada à mão** (referência: `midia.agpremium.com.br`) — **não** é inversão dos tokens claros. Trocar de tema = sobrescrever só a camada semântica; ~95% dos componentes não sabem que o tema existe.

## Mecanismo

1. Classe **`.dark` em `<html>`**, habilitada no Tailwind v4 por:
   ```css
   @custom-variant dark (&:where(.dark, .dark *));
   ```
2. **Script anti-FOUC** no `<head>` (`src/app/layout.tsx`) aplica a classe **antes da pintura**:
   - escolha salva em `localStorage` (chave **`premium-theme`**: `light` | `dark`) tem prioridade;
   - sem escolha, em rotas **`/docs`** (documentação pública) → **escuro por padrão**;
   - sem escolha, nas demais rotas → segue `prefers-color-scheme`;
   - sem nada → claro.
3. **`ThemeToggle`** (`moon`/`sun` na topbar) sincroniza com a classe já aplicada, alterna `classList.toggle('dark')` e grava no `localStorage`. O ícone só renderiza após montar (evita mismatch de hidratação).
4. `html.dark` declara `color-scheme: dark` (controles nativos, scrollbars).

## O que muda

`html.dark` sobrescreve **apenas**: a camada `--c-*`, a fachada `--premium-*` (recalibrada), os pares de status/auxiliares, os pares temáticos de marca (`--gold-bg`, `--timer-idle`), as sombras e o code theme. Tabelas completas de valores em [`tokens.md`](tokens.md).

Pontos-chave da calibração:

| Aspecto | Decisão |
|---|---|
| Página vs. superfície | `#0a0a0a` página, `#161616` card, `#202020` sunken — três degraus de elevação |
| Texto | `--premium-ink` vira `#fafafa` (por isso ele **nunca** pode ser usado como fundo) |
| Pares `*-bg` de status | Tons escuros próprios (`#0f2e1d`, `#2e2410`…) — nunca o claro com opacidade |
| Fundo amarelo suave (`--gold-bg`) | Vira `#2e2410` — tom escuro dourado próprio (par de `--warning-bg`), nunca `#FFFBE0` com opacidade |
| Cronômetro parado (`--timer-idle`) | Escurece para `#846a00`: o chip `--premium-ink` fica claro no escuro e o amarelo da marca não passaria AA como texto sobre claro |
| Sombras | Intensificam (pretas mais densas) |
| Ênfase (`--c-emphasis`) | **Inverte**: botão dark vira claro sobre página escura |

## O que NÃO muda

- **Acento amarelo** — `--brand-*` é fixo; é parte da marca nos dois temas.
- **Superfícies intencionalmente escuras**: sidebar, `btn-dark` (via `--c-emphasis`), toast, banner admin, header do portal de aprovação, login, chip de filtro "ligado". Elas usam `--brand-ink` / `--c-sidebar` / `--c-emphasis` — tokens que permanecem escuros (a sidebar apenas **eleva** para `#161616` no escuro, separando-se da página `#0a0a0a`).
- **Lightbox**: fundo `bg-black/90` fixo (mídia em tela cheia pede fundo escuro sempre) — exceção documentada.
- **Seleção de texto** (`::selection`): amarelo da marca (`--yellow`) com texto preto nos dois temas.
- `--premium-black` permanece `#000` (reservado ao banner de marca).

## Regras de implementação

> [!IMPORTANT]
> A pergunta certa nunca é "que cor isso tem no escuro?", e sim "**qual token semântico isso é?**". Se o componente usa tokens, o tema resolve sozinho.

- ✅ Use as utilities semânticas em código novo: `bg-surface`, `bg-bg`, `bg-sunken`, `text-ink`, `text-muted`, `text-subtle`, `border-border`.
- ✅ Para superfície que deve ficar **escura sempre**: `--brand-ink` / `--c-sidebar` / `--c-emphasis` — **nunca** `--premium-ink` como fundo (vira claro no escuro, pois é texto).
- ✅ Variant `dark:` do Tailwind **só para exceções visuais** (logo/imagem de cor fixa, `[color-scheme:dark]` em inputs nativos).
- ❌ Evite cores literais do Tailwind (`bg-white`, `text-black`) em superfícies — não adaptam. `text-black` só sobre amarelo/cores fixas (avatar, badge, botão primário).
- ❌ Nunca `*-bg` claro com `opacity` para simular o par escuro.

## Critério de aceite

Todo PR de UI anexa **dois screenshots** (claro + escuro). Teste rápido: alterne o tema no [showroom](showroom.html) — os swatches mostram os valores computados ao vivo de cada token.
