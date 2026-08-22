# Tokens de design

Todos os tokens vivem em [`src/app/globals.css`](https://github.com/agenciapremium/tasks/blob/main/src/app/globals.css). Esta página é o espelho documentado — em divergência, **o CSS vence**.

> [!WARNING]
> **Regra-zero: nenhum hex em componente.** Toda cor entra por `var(--token)` ou pela utility semântica do Tailwind (`bg-surface`, `text-ink`, …). A única exceção controlada é o realce de sintaxe, que também vive como token (`--code-*`).

## Cores

### Camada 1A — Marca crua (fixa nos dois temas)

| Token | Hex | RGB | Uso |
|---|---|---|---|
| `--brand-yellow` (`--yellow`) | `#FBDA25` | `251, 218, 37` | Botão primário, FAB, acento de seleção, item ativo da sidebar |
| `--brand-gold` (`--gold`) | `#FCD028` | `252, 208, 40` | Hover do amarelo |
| `--brand-amber` (`--amber`) | `#F7BA30` | `247, 186, 48` | Active state, fim do gradiente de progresso, dot de calendário |
| `--brand-ink` | `#0A0A0A` | `10, 10, 10` | Âncora escura da marca: sidebar, btn-dark, toast, banners |
| `--brand-on-ink` | `#FFFFFF` | `255, 255, 255` | Texto sobre a âncora escura |
| `--yellow-50` | `#FFFBE0` | `255, 251, 224` | **Somente** halo de foco (`box-shadow: 0 0 0 2px var(--yellow-50)`) — nunca como fundo; para fundo amarelo suave use `--gold-bg` |

> [!CAUTION]
> O amarelo `#FBDA25` **não passa em contraste AA como texto sobre fundo claro**. Use-o apenas como fundo (com texto preto) ou como acento sobre superfícies escuras. Ver [`acessibilidade.md`](acessibilidade.md).

### Pares temáticos de marca (variam por tema)

Tokens de marca com par escuro próprio — declarados em `:root` e sobrescritos em `html.dark` (nunca o claro com opacidade):

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--gold-bg` | `#FFFBE0` | `#2E2410` | Fundo amarelo suave: seleção de célula de tabela, callouts, destaques, flash de comentário novo (`.flash-novo`) |
| `--timer-idle` | `#FBDA25` (= `--brand-yellow`) | `#846A00` | Dígitos do cronômetro parado sobre o chip `--premium-ink`; no escuro o chip fica claro e o dourado escurece para manter AA (contraste ≈ 5:1 sobre `#FAFAFA`) |

### Camada 1B — Semântica `--c-*` (única que muda por tema)

| Token | Claro | Escuro | Papel |
|---|---|---|---|
| `--c-bg` | `#FAFAFA` | `#0A0A0A` | Fundo da página |
| `--c-surface` | `#FFFFFF` | `#161616` | Superfície de card / painel |
| `--c-sunken` | `#F2F2F2` | `#202020` | Chip, thead, tabs, segmented |
| `--c-ink` | `#0A0A0A` | `#FAFAFA` | Texto principal |
| `--c-muted` | `#8A8A8A` | `#B8B8B8` | Texto auxiliar |
| `--c-subtle` | `#BFBFBF` | `#8A8A8A` | Ícones / desabilitado |
| `--c-border` | `#E5E5E5` | `#2E2E2E` | Borda padrão |
| `--c-border-strong` | `#2A2A2A` | `#4A4A4A` | Borda forte |
| `--c-sidebar` | `#0A0A0A` | `#161616` | Sidebar (escura nos dois temas; eleva no escuro) |
| `--c-sidebar-elevated` | `#1A1A1A` | `#232323` | Item ativo/hover da sidebar |
| `--c-sidebar-muted` | `#BFBFBF` | `#BFBFBF` | Texto da sidebar (não muda — sidebar é sempre escura) |
| `--c-sidebar-section` | `#4A4A4A` | `#6A6A6A` | Rótulos de seção / cadeado |
| `--c-emphasis` | `#0A0A0A` | `#FAFAFA` | Ênfase neutra (btn-dark) — **inverte** no escuro |
| `--c-on-emphasis` | `#FFFFFF` | `#0A0A0A` | Texto sobre a ênfase |
| `--c-emphasis-hover` | `#2A2A2A` | `#E2E2E2` | Hover da ênfase |

### Escala neutra `--premium-*` (fachada de compatibilidade)

No claro, valores literais originais; no escuro, **recalibrados** (texto e superfície trocam de lado). Componentes existentes seguem válidos; código novo deve preferir `--c-*`/utilities.

| Token | Claro | Escuro | Uso no claro |
|---|---|---|---|
| `--premium-black` | `#000000` | `#000000` | Reservado ao banner de marca |
| `--premium-ink` | `#0A0A0A` | `#FAFAFA` | Texto principal — *nunca como fundo* (vira claro no escuro) |
| `--premium-coal` | `#1A1A1A` | `#F2F2F2` | Hover sobre superfícies escuras |
| `--premium-graphite` | `#2A2A2A` | `#4A4A4A` | Borda em superfícies escuras |
| `--premium-steel` | `#4A4A4A` | `#D0D0D0` | Texto secundário |
| `--premium-gray` | `#8A8A8A` | `#B8B8B8` | Texto auxiliar / placeholder |
| `--premium-silver` | `#BFBFBF` | `#5A5A5A` | Bordas / ícones desabilitados |
| `--premium-mist` | `#E5E5E5` | `#2E2E2E` | Borda padrão de cards/inputs |
| `--premium-bone` | `#F2F2F2` | `#202020` | Fundo de chip, thead, segmented |
| `--premium-paper` | `#FAFAFA` | `#0A0A0A` | Fundo da página |
| `--premium-white` | `#FFFFFF` | `#161616` | Superfície de card |

### Status (sempre em par `cor` + `cor-bg`)

| Sentimento | Token | Claro | Escuro | BG claro | BG escuro | Uso típico |
|---|---|---|---|---|---|---|
| Sucesso | `--success` / `--success-bg` | `#1E8E4A` | `#34D17D` | `#E6F4EA` | `#0F2E1D` | Concluído, no prazo |
| Aviso | `--warning` / `--warning-bg` | `#C97A0F` | `#E6B24A` | `#FFF3DB` | `#2E2410` | Fazendo, atenção |
| Erro | `--danger` / `--danger-bg` | `#C0322B` | `#E87A72` | `#FBE9E7` | `#2E1513` | Atrasada, destrutivo, alta prioridade |
| Info | `--info` / `--info-bg` | `#1A6FB0` | `#5AA6DD` | `#E6F1FA` | `#102433` | Novas, links, menções |

> [!NOTE]
> Os pares `*-bg` do escuro são **tons escuros próprios**, nunca o claro com opacidade — opacidade sobre fundo preto mataria o contraste.

### Auxiliares (departamentos / categorias)

| Token | Claro | Escuro | BG claro | BG escuro | Convenção |
|---|---|---|---|---|---|
| `--violet` / `--violet-bg` | `#6E56CF` | `#A594E8` | `#EDE9FB` | `#211A33` | Aprovação interna, Criação |
| `--teal` / `--teal-bg` | `#0E8C8C` | `#4CC3C3` | `#E2F3F3` | `#0F2B2B` | Redação |
| `--slate` / `--slate-bg` | `#5B6472` | `#9AA3B2` | `#EDF0F3` | `#1C212A` | Audiovisual, neutro |

Departamentos têm cor própria por convenção — o mapeamento cor → departamento é feito uma única vez em helper dedicado, nunca espalhado pelas telas.

### Cor de dado — paleta fechada de cadastro

A exceção à regra "cor só por token". Quando a cor é **escolhida pelo usuário e gravada no banco** (departamento, motivo de ausência, categoria), ela é **dado**, não estilo: precisa sobreviver ao componente, ao tema e à próxima versão do design system. Por isso é hex, e não `var()`.

O que impede isso de virar um abacaxi de acessibilidade é a lista ser **fechada**. Nada de seletor livre onde alguém pinta um item de branco sobre fundo branco:

| Hex | Espelha |
|---|---|
| `#FBDA25` | `--brand-yellow` |
| `#F7BA30` | `--amber` |
| `#6E56CF` | `--violet` |
| `#0E8C8C` | `--teal` |
| `#5B6472` | `--slate` |
| `#1E8E4A` | `--success` |
| `#1A6FB0` | `--info` |
| `#C0322B` | `--danger` |
| `#C97A0F` | `--warning` |
| `#8A8A8A` | `--premium-gray` — **padrão** de cadastro novo |

Regras:

1. **Uma lista para o sistema inteiro**, num módulo próprio — nunca dentro de uma tela. Duas telas escolhendo cor de listas diferentes é o começo de uma divergência visual.
2. **Validada no servidor**: a action rejeita hex fora da lista. A UI oferecer só dez opções não é garantia — é dica visual.
3. **Escolha por amostras**, nunca `<input type="color">`. Amostra selecionada ganha `outline: 3px solid var(--premium-ink)`; as demais, `2px solid var(--premium-mist)`. Com `aria-pressed` e `aria-label` nomeando a cor.
4. Todas são **fundo, ponto ou faixa de identificação** — nenhuma é texto sobre fundo claro. Os dez valores vêm de tokens que já passam AA nesse papel.
5. Cor **nunca é a única** portadora de significado: sempre acompanha rótulo (ver [`acessibilidade.md`](acessibilidade.md)).

Note que os valores são os do tema **claro**, fixos: cor de dado não tem par escuro — ela é a mesma nos dois temas, e é o papel dela (fundo com texto claro, ponto, faixa) que garante o contraste.

Implementação de referência: [`src/lib/cores-cadastro.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/cores-cadastro.ts) no Tasks. Vale o modelo de registry — cada sistema copia a lista, não importa CSS.

### Code theme (`doc-code-block`)

Tokens dedicados ao realce de sintaxe da documentação pública (`/docs`). Contraste AA nos dois temas.

| Token | Claro | Escuro | Papel |
|---|---|---|---|
| `--code-bg` | `#F6F6F4` | `#1B1B1B` | Fundo do bloco |
| `--code-fg` | `#1A1A1A` | `#E6E6E6` | Texto base |
| `--code-border` | `#E5E5E5` | `#2E2E2E` | Borda/divisores |
| `--code-keyword` | `#8A3FFC` | `#C792EA` | Palavras-chave / métodos HTTP |
| `--code-string` | `#0F7B46` | `#7FD6A0` | Strings |
| `--code-number` | `#9A5B00` | `#F2B35E` | Números / booleanos / null |
| `--code-comment` | `#6A6A6A` | `#8A8A8A` | Comentários |
| `--code-property` | `#1565A8` | `#82C5F5` | Chaves de objeto |
| `--code-punct` | `#4A4A4A` | `#B8B8B8` | Pontuação |

### Utilities Tailwind expostas (`@theme inline`)

| Utility | Token | Exemplos |
|---|---|---|
| `bg-bg` / `bg-background` | `--c-bg` | Fundo de página |
| `bg-surface` | `--c-surface` | Cards |
| `bg-sunken` | `--c-sunken` | Chips, thead |
| `text-ink` / `text-foreground` | `--c-ink` | Texto principal |
| `text-muted` | `--c-muted` | Auxiliar |
| `text-subtle` | `--c-subtle` | Ícones/disabled |
| `border-border` / `border-border-strong` | `--c-border` / `--c-border-strong` | Bordas |
| `bg-brand` / `text-on-brand` | `--brand-yellow` / `#000` | Acento de marca |
| `bg-success-bg`, `text-success`, … | pares de status | Badges |

## Tipografia

Família **Ubuntu** (300, 400, 500, 700), fallback `system-ui, sans-serif`, carregada globalmente. `-webkit-font-smoothing: antialiased`.

| Papel | Tamanho / peso | Detalhes |
|---|---|---|
| H1 de página | **32px / 700** | `letter-spacing: -0.02em` |
| Número KPI | 22–30px / 700 | `letter-spacing: -0.02em` |
| Título de slide-over / diálogo | 18px / 700 | — |
| H3 painel / H4 card | 15–16px / 700 | — |
| Subtítulo (`.sub`) | 14px / 400 | cor `--premium-gray` |
| Corpo | 13–14px / 400–500 | line-height ~1.5–1.65 |
| Corpo de comentário / leitura MD | 13.5px / 400 | line-height 1.55–1.65, cor `--premium-steel` |
| Label de formulário | 11px / 700 | uppercase, `letter-spacing: .05em`, `--premium-gray` |
| Cabeçalho de tabela / coluna | 10–11px / 700 | uppercase, `letter-spacing: .04–.06em` |
| Eyebrow (`.eyebrow`) | **10px / 700** | uppercase, `letter-spacing: .20em`, `--premium-gray` |
| Rótulo de seção da sidebar | 9px / 700 | uppercase, `letter-spacing: .22em` |
| Código inline / blocos | 12.5px | `ui-monospace, "SFMono-Regular", Menlo, monospace` |

### Tipografia de leitura (editor rico / Markdown)

Compartilhada entre `.rich-editor-content` (edição) e `.md-view` (leitura):

| Elemento | Especificação |
|---|---|
| Base | 13.5px / 1.65 / `--premium-steel` |
| `h2` | 16px / 700 / `--premium-ink` |
| `h3` | 14px / 700 / `--premium-ink` |
| `blockquote` | borda esquerda 3px `--premium-mist`, texto `--premium-gray` |
| `code` | 12.5px mono sobre `--premium-bone`, raio `--r-sm` |
| `pre` | `--premium-bone`, padding 12px, raio `--r-md` |
| `a` | `--info`, sublinhado (exceto `drive://`, que vira trecho copiável) |
| Tabela GFM | bordas `--premium-mist`, `th` em `--premium-bone` 700 |

## Raios

| Token | Valor | Uso |
|---|---|---|
| `--r-sm` | 6px | Chip, célula de dia, badge interno, menção |
| `--r-md` | 8px | Botão, input, icon-btn, tabs container, code block |
| `--r-lg` | 12px | Card, painel, coluna de kanban, toast |
| `--r-xl` | 18px | Slide-over, confirm dialog |
| `--r-pill` | 999px | Chip de filtro, badge, avatar, barra de progresso |

## Sombras

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--sh-sm` | `0 1px 3px rgba(10,10,10,.08), 0 1px 2px rgba(10,10,10,.04)` | `0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.2)` | Card padrão, tab ativa |
| `--sh-md` | `0 4px 12px rgba(10,10,10,.08), 0 2px 4px rgba(10,10,10,.04)` | `0 4px 12px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.2)` | Hover de card, dropdowns |
| `--sh-lg` | `0 12px 32px rgba(10,10,10,.12), 0 4px 8px rgba(10,10,10,.06)` | `0 12px 32px rgba(0,0,0,.5), 0 4px 8px rgba(0,0,0,.3)` | Slide-over, diálogo, popover, toast |
| `--sh-gold` | `0 12px 28px rgba(251,218,37,.40), 0 4px 8px rgba(247,186,48,.22)` | idem (fixa) | **Somente** botão primário amarelo e FAB |

> [!WARNING]
> Nunca sombra arbitrária — somente `--sh-sm/md/lg/gold`.

## Espaçamento e layout

Grid base de **4px**. Medidas estruturais observadas:

| Medida | Valor |
|---|---|
| Padding de página | `26px 30px 60px` |
| Topbar | 68px (88px com page-head embutido — `min-h-[88px]`) |
| Sidebar | 248px expandida · **64px colapsada** |
| Padding de card | 16–18px |
| Gap entre cards em grade | 14–16px |
| Detalhe (conteúdo + meta) | grid `1fr 320px`, gap 22px; 1 coluna abaixo de 1100px |
| Coluna de kanban | `flex: 0 0 290px` |
| Slide-over | 480px (`max-w-[calc(100vw-2rem)]`) |
| FAB | 56px principal / 44px atalhos, offset `1.5rem + env(safe-area-inset-*)` |

### Breakpoints

| Largura | Transformação |
|---|---|
| 1100px | Grids de detalhe colapsam para 1 coluna |
| 768px | Sidebar vira drawer; tabelas viram cards empilhados; drag do workflow desabilita |
| 640px | Busca da topbar encolhe para ícone |

## Motion (resumo)

| Token / padrão | Valor |
|---|---|
| `--ease` | `cubic-bezier(.22, .61, .36, 1)` |
| Hover/transição de clicáveis | 140–150ms |
| Fade-in de tela | 300ms + `translateY(8px)` |
| Hover de card | `translateY(-2px)` + `--sh-md` |
| Entrada do slide-over | 200ms (`translateX(8px)` → 0 + opacity) |
| Barra de auto-save | loop 1.1s |
| Flash de comentário novo (`.flash-novo`) | 600ms, `--gold-bg` → transparente, `--ease` |
| Pulso do cronômetro parado (`.timer-pulse`) | 1.6s ease-in-out infinito, opacidade 1 → 0.55 |
| Crossfade de troca de aba (View Transitions) | 200ms em `::view-transition-old/new(root)` |

Detalhes e regras de `prefers-reduced-motion` em [`motion.md`](motion.md).
