# UI Guidelines — Premium Demands System

Guia visual e de interação para **toda nova feature** do sistema. Derivado de
`docs/design-system/Prototipo-Sistema-Gestao-Demandas-Premium.html`, dos tokens de
`src/app/globals.css` e dos primitivos em `src/components/ui/`.

> Regra-zero: **antes de criar componente, procure o equivalente em
> `src/components/ui/`**. Se precisar criar, faça via token semântico (nunca
> cor hard-coded) e siga o padrão do protótipo.

Fontes da verdade:
- Protótipo HTML: [Prototipo-Sistema-Gestao-Demandas-Premium.html](Prototipo-Sistema-Gestao-Demandas-Premium.html)
- Tokens: [`src/app/globals.css`](https://github.com/agenciapremium/tasks/blob/main/src/app/globals.css)
- Primitivos: [`src/components/ui/`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/)
- Padrão dark mode externo: `midia.agpremium.com.br`

---

## 1. Identidade e voz

- **Marca**: PREMIUM · MARKETING 360°. Acento de marca = **amarelo Premium**
  (`--yellow #FBDA25`) sobre **preto Premium** (`--premium-ink #0A0A0A`).
- **Símbolo**: troféu (`lucide:trophy`) em amarelo sobre fundo escuro.
- **Idioma**: pt-BR formal ("você"). Strings **sempre acentuadas**. Tom direto,
  sem ironia, sem emoji em UI de produção.
- **Microcopy**: títulos curtos, sublinhas explicam o propósito da tela em
  uma linha (ex.: "To-do pessoal. Organize o que não está formalizado como
  demanda.").

---

## 2. Fundamentos

### 2.1 Tipografia

- Família: **Ubuntu** (300, 400, 500, 700). Fallback: `system-ui, sans-serif`.
  Já carregada globalmente.
- Escala observada no protótipo:
  - Título de página: vive na **topbar** (registrado via `PageHeader`, §3.3) em
    **16px / 600** (`text-base font-semibold tracking-tight`) — o `h1` de 32px
    do protótipo não é mais usado no shell
  - `h3` painel: **15px / 700**
  - `h4` card: **15–16px / 700**
  - Corpo: **13–14px / 400–500**
  - Subtítulo / `.sub`: 14px, cor `--premium-gray`
  - **Eyebrow** (`<span class="eyebrow">`): 10px / 700 / `letter-spacing .20em`
    / `text-transform: uppercase` / cor `--premium-gray`
  - **Label de coluna/tabela**: 10–11px / 700 / `uppercase` / `letter-spacing .04–.06em`
  - Números KPI: 22–30px / 700 / `letter-spacing -0.02em`

### 2.2 Cores — paleta Premium

Escala neutra (sempre via token, **nunca** hex direto em componente):

| Token | Hex | Uso |
|---|---|---|
| `--premium-black` | #000 | Reservado para fundo brand banner |
| `--premium-ink` | #0A0A0A | Texto principal / sidebar / botão dark |
| `--premium-coal` | #1A1A1A | Hover sobre superfícies escuras |
| `--premium-graphite` | #2A2A2A | Borda em superfícies escuras |
| `--premium-steel` | #4A4A4A | Texto secundário em superfícies claras |
| `--premium-gray` | #8A8A8A | Texto auxiliar / placeholder |
| `--premium-silver` | #BFBFBF | Bordas / ícones desabilitados |
| `--premium-mist` | #E5E5E5 | Borda padrão de cards/inputs |
| `--premium-bone` | #F2F2F2 | Fundo de "chip", thead, segmented control |
| `--premium-paper` | #FAFAFA | **Fundo da página** |
| `--premium-white` | #FFFFFF | Superfície de card |

Acento de marca:

| Token | Hex | Uso |
|---|---|---|
| `--yellow` | #FBDA25 | Botão primário, acento de seleção, brand |
| `--gold` | #FCD028 | Hover do amarelo |
| `--amber` | #F7BA30 | Active state / progresso |
| `--yellow-50` | #FFFBE0 | **Exclusivo** de halo de foco (`box-shadow: 0 0 0 2px var(--yellow-50)`) — claro nos dois temas; **nunca** como fundo (use `--gold-bg`) |
| `--gold-bg` | #FFFBE0 (claro) / #2E2410 (escuro) | Fundo amarelo suave: seleção de item, callout com borda `--gold`, halo atrás de ícone âmbar |
| `--timer-idle` | #FBDA25 (claro) / #846A00 (escuro) | Dígitos do cronômetro **parado** sobre o chip `--premium-ink` (par invertido); escurece no escuro (chip fica claro) para manter AA de texto pequeno. Par com a classe `.timer-pulse` (pulso 1→0.55, some sob `prefers-reduced-motion`) |

Semânticas (sempre em pares `cor` + `cor-bg` para badges/tags):

| Sentimento | Cor | BG | Uso típico |
|---|---|---|---|
| Sucesso | `--success` #1E8E4A | `--success-bg` #E6F4EA | Concluído, no prazo |
| Aviso | `--warning` #C97A0F | `--warning-bg` #FFF3DB | Fazendo, atenção |
| Erro | `--danger` #C0322B | `--danger-bg` #FBE9E7 | Atrasada, alta prioridade |
| Info | `--info` #1A6FB0 | `--info-bg` #E6F1FA | Novas, neutro positivo |
| Violeta | `--violet` #6E56CF | `--violet-bg` #EDE9FB | Aprovação interna, Criação |
| Teal | `--teal` #0E8C8C | `--teal-bg` #E2F3F3 | Redação |
| Slate | `--slate` #5B6472 | `--slate-bg` #EDF0F3 | Audiovisual, neutro |

> **Departamentos** têm cor própria por convenção — a cor vem do **cadastro**
> (`Departamento.cor` no Prisma, default `#8A8A8A`), não de um mapa fixo no
> código. Consuma sempre a cor vinda do registro.

**Cor de dado** (departamento, motivo de ausência, categoria) é a exceção à
regra de "cor só por token": ela é escolhida pelo usuário e gravada no banco,
então é hex. O que a torna segura é a **lista fechada** de dez valores, todos
espelhando token — ver [`tokens.md`](tokens.md#cor-de-dado--paleta-fechada-de-cadastro).
Uma lista por sistema, num módulo próprio, validada no servidor; seletor livre
de cor, nunca.

**E-mail** é a outra exceção, e por motivo técnico: cliente de e-mail não
resolve `var(--token)`. Regras próprias em [`email.md`](email.md).

#### Arquitetura de tokens (4 camadas)

As cores em `globals.css` são organizadas em camadas de indireção, de modo que
trocar de tema signifique sobrescrever só a camada semântica:

1. **Marca crua** (`--brand-yellow/gold/amber`, `--brand-ink`, `--brand-on-ink`)
   — cores literais da marca, **fixas** nos dois temas.
2. **Semântico** (`--c-bg`, `--c-surface`, `--c-sunken`, `--c-ink`, `--c-muted`,
   `--c-subtle`, `--c-border`, `--c-border-strong`) — a **única** camada que
   muda por tema. No claro aponta para os neutros claros; `html.dark` a
   sobrescreve com a paleta escura calibrada (§2.7, §9).
3. **`@theme inline`** expõe utilities semânticas do Tailwind apontando para os
   `--c-*`: `bg-bg`, `bg-surface`, `bg-sunken`, `text-ink`, `text-muted`,
   `text-subtle`, `border-border`, `border-border-strong`. **Prefira-as em
   código novo.**
4. **`dark:`** (variant Tailwind) — só para **exceções visuais** (logo/imagem de
   cor fixa). ~95% dos componentes resolvem o tema só pelos tokens semânticos.

> Compatibilidade: os tokens `--premium-*` continuam válidos como fachada
> semântica (claro idêntico ao atual; escuro recalibrado). Não é preciso migrar
> componentes existentes; em código novo prefira as utilities semânticas acima.

### 2.3 Raios

`--r-sm 6px` (chip, day cell, badge interno), `--r-md 8px` (botão, input,
icon-btn), `--r-lg 12px` (card, painel, slide-over), `--r-xl 18px`
(modal/destaque), `--r-pill 999px` (chip de filtro, badge, avatar).

### 2.4 Sombras

`--sh-sm` (card padrão), `--sh-md` (hover de card), `--sh-lg` (slide-over /
overlay), `--sh-gold` (somente botão primário amarelo). Nunca sombra arbitrária.

### 2.5 Espaçamento

Grid de 4px. Padrões observados:
- Padding de página: `px-[30px] py-[26px]` no `main` (respiro simétrico, §4.18).
- Topbar: **min-height 88px** (carrega título + subtítulo + breadcrumb, §3.2).
- Sidebar width: **248px** (colapsada: 64px — ver Spec 4).
- Padding de card: `16–18px`.
- Gap entre cards em grade: **14–16px**.
- Painel de detalhe — grid `1fr 320px` com gap `22px`.

### 2.6 Easing & motion

- Curva padrão: `--ease: cubic-bezier(.22,.61,.36,1)`.
- Hover/transition de elementos clicáveis: **140ms** (`transition: all .14s var(--ease)`).
- Fade-in de tela: **300ms** + leve `translateY(8px)`.
- Hover de card sobe **2px** (`transform: translateY(-2px)`) + `--sh-md`.
- Respeitar `prefers-reduced-motion` — desativar transform/transition.

#### Biblioteca de animação — Motion

O sistema usa a biblioteca **Motion** (motion.dev, pacote `motion`, import
`motion/react`) para animações de **entrada/saída de overlays** e de **expansão de
altura** (change `animacoes-motion-overlays`). Isso **supera** a diretriz anterior
("só Tailwind + CSS vars, sem framer-motion", registrada no design do composer de
comentários) — a decisão foi tomada conscientemente para ganhar `AnimatePresence`
(saída antes do desmonte) e animação de `height: auto`, difíceis em CSS puro.

- **Modo leve, obrigatório**: usar **sempre** o componente `m` (`m.div`, …) com
  `LazyMotion features={domAnimation} strict` — nunca o componente `motion` completo
  (o `strict` faz `motion.*` lançar erro). Sem `domMax` (layout animations/drag) por
  ora. Bundle ~20 kb, carregado uma vez.
- **Provider único**: `MotionProvider` (`src/components/ui/motion-provider.tsx`) monta
  `LazyMotion` + `MotionConfig reducedMotion="user"` (respeita `prefers-reduced-motion`
  por construção) com transição default na curva `--ease`. Está nos três shells: app
  interno, portal do cliente e docs. Componente que renderiza `m.*` fora de um provider
  **quebra em dev** (efeito desejado do `strict`) — rotas sem provider (ex.: `/aprovar`,
  auth) não devem usar `m.*` (use CSS).
- **Vocabulário central** em `src/lib/motion.ts`: presets `scrim` (fade 150 ms),
  `modal` (opacity + scale .98→1, 200 ms), `slideOver` (200 ms), `menu` (120–140 ms),
  `toast` (~180 ms), via `motionPreset(nome)` sob `AnimatePresence`. Expansão de altura
  usa o componente `Expansivel` (`src/components/ui/expansivel.tsx`). **Saída sempre ≤
  entrada.**
- **Fronteira Motion × CSS**: use Motion para **entrada/saída de overlay** e **altura**;
  mantenha em **CSS** os hovers/`transition-colors` (140 ms), os skeletons de rota
  (`loading.tsx` são server components — keyframe `fadeIn` em `globals.css`) e flashes
  pontuais (ex.: comentário novo, keyframe `flashNovo`). Menus/dropdowns/popovers animam
  só a **entrada** (fechamento instantâneo é aceitável).
- **Durações**: 120–140 ms menus; 180–220 ms modais/expansão; sempre com `--ease`.

**Dados, abas e transições de tela** (change `animacoes-graficos-abas-transicoes`):

- **Gráficos**: os 3 primitivos (`bar-chart`, `line-chart`, `pie-chart`) animam na
  entrada — barras `scaleY` da base, linha `pathLength`, donut com reveal escalonado
  das fatias. Reanimam por `key` na troca de filtro. `pathLength`/`height`/`width`/
  count-up **não são transform** → guarda manual com `useReducedMotion()` (o
  `MotionConfig` só cobre transform).
- **Números (KPIs)**: `useCountUp`/`<Contador>` — conta na entrada, preserva o
  formatador (moeda/%/compacto), valor final direto sob reduced-motion. Barras de
  progresso: `<BarraProgresso>` (`scaleX` da esquerda).
- **Fade de tela**: `template.tsx` por shell (só **opacity** — um `translateY` no
  wrapper de página quebra `position: fixed` de descendentes).
- **Abas/visões**: pílula/sublinhado ativo **desliza** (indicador CSS medido por `ref`,
  sem `layoutId`/`domMax`). Conteúdo: `AnimatePresence mode="wait"` quando o ramo é
  client-side (ex.: abas do detalhe da Demanda); **View Transitions API**
  (`navegarComTransicao`) quando é navegação server (progressive enhancement —
  degrada para troca instantânea sem a API ou sob reduced-motion).
- **Entrada de item**: apenas o item que muda (highlight `.flash-novo` ou "pop" em
  lista curta). **Nunca** animar o layout de listas/tabelas grandes (Kanban, Gestão de
  Demandas) — reanimaria a cada `router.refresh` e conflita com o dnd-kit.

### 2.7 Tema escuro

O tema escuro usa uma **paleta calibrada à mão** (ref. `midia.agpremium.com.br`),
**não** a inversão dos tokens claros. Trocar de tema = sobrescrever só a camada
semântica (`--c-*`) e os pares de status; tudo que consome os tokens muda
automaticamente. Detalhes do mecanismo em §9.

- **Acento amarelo permanece** — é fixo (`--brand-*`), idêntico nos dois temas.
- Pares `*-bg` têm tons escuros próprios (nunca o claro com `opacity`).
- Sombras intensificam (`--sh-*` redefinido em `html.dark`).
- Superfícies **intencionalmente escuras** (sidebar, `btn-dark`, banner admin,
  header de aprovação, login, chip invertido) usam `--brand-ink` / tokens
  `--c-sidebar`/`--c-emphasis` para permanecerem escuras nos dois temas — não
  use como fundo os neutros que o escuro reclassifica como texto (`--premium-ink`
  E `--premium-coal` viram claros no escuro; ex.: o popover do menu de conta usa
  `--c-sidebar`, não `--premium-coal`).
- **Fundo amarelo suave usa `--gold-bg`, não `--yellow-50`** — este último é só
  halo de foco (fica claro nos dois temas). `--gold-bg` tem tom escuro próprio no
  dark (par de `--warning-bg`), então seleção, callouts e halos de ícone
  permanecem legíveis (contraste AA) no escuro.
- **Evite cores literais do Tailwind** (`bg-white`, `text-black`) em superfícies:
  elas não adaptam. Use tokens (`bg-[var(--premium-white)]`, `bg-surface`).
  `text-black` só é permitido sobre amarelo/cores fixas (avatar, badge, botão).
- Critério de aceite por feature: capturar tela em ambos os temas antes do PR.

### 2.8 Composição de classes — `cn()` não resolve conflito

> [!WARNING]
> O helper `cn()` é **join puro**: ele concatena strings, não desempata classes
> Tailwind. Não há `tailwind-merge` no caminho.

A consequência é silenciosa e cara: passar `max-h-[80vh]` a um componente cujo
default interno é `max-h-full` **não substitui** o default — as duas classes
convivem no atributo e quem vence é a que aparecer depois no CSS gerado, que
ninguém controla a partir do JSX. O componente parece funcionar até o dia em que
a ordem muda.

Enquanto for assim:

- **Elimine o conflito, não arbitre.** Se o default interno do componente já é o
  desejado, não passe classe de tamanho nenhuma; se não é, ajuste o **wrapper**,
  não o filho.
- Componente que aceita `className` **documenta quais dimensões ele já define** —
  quem consome precisa saber contra o que estaria competindo.
- Não empilhe a mesma propriedade em dois lugares esperando que a mais específica
  vença. Tailwind não tem especificidade crescente aqui.

Adotar `tailwind-merge` no `cn()` resolveria a classe inteira de bug, mas é
mudança de fundação com efeito em todo o app — fica registrada como evolução
possível do design system, não como algo a fazer no meio de um fix.

---

## 3. Layout global

```
┌──────────────┬────────────────────────────────────────────────┐
│              │ Topbar 88px: título + sub + breadcrumb │ ações │
│   Sidebar    ├────────────────────────────────────────────────┤
│   248px      │ Ações da página (PageHeader `actions`)         │
│   (collap-   │ Barra: filtros ◄  ► contexto · views · favorito│
│    sável)    │ Conteúdo (cards, kanban, tabela, detalhe)     │
└──────────────┴────────────────────────────────────────────────┘
```

### 3.1 Sidebar
- Fundo `--c-sidebar` (escura nos dois temas; eleva levemente no escuro), texto `--c-sidebar-muted`.
- Item ativo: fundo `--c-sidebar-elevated`, texto `--yellow`, **borda esquerda 3px amarela**.
- Seções via `nav-label` (10px / `letter-spacing .22em` / cor `--premium-steel`).
- Itens admin têm cadeado (`lucide:lock`) à direita.
- Rodapé com avatar + nome + papel ("Diretor · Admin").

### 3.2 Topbar
- Fundo `bg-[var(--premium-white)]/80` (token — adapta ao escuro) com
  `backdrop-filter: blur(12px) saturate(140%)`; `min-h-[88px]`, sticky.
- Conteúdo: **[eyebrow + título + sub + breadcrumb] ← flex-1 → [busca pill ⌘K] [tema] [sino] [avatar]**.
  O título/subtítulo vêm do contexto do header (registrados pela página via
  `PageHeader`, §3.3); a trilha compacta (`Breadcrumbs`) fica logo abaixo do
  subtítulo (§4.23).
- A criação **não** vive mais na topbar: o botão "Nova demanda" foi removido e a
  entrada única de criação passou a ser o **FAB** (§4.18). A busca fica adjacente
  ao alternador de tema.
- Sino com `.dot` 8px vermelho quando há não-lidas.
- Borda inferior `--premium-mist`.

### 3.3 Page-head
- Não há mais H1 de 32px no corpo: a página registra
  **título/subtítulo/eyebrow** no contexto da topbar via
  [`PageHeader`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/page-header.tsx) (props `title`,
  `subtitle`, `eyebrow`, `titleAction`, `breadcrumb`), e o componente renderiza
  no corpo **apenas** as `actions` (alinhadas à direita), quando existem.
- Os controles da tela — **botões de contexto, abas de visualização e
  favorito** — **não** vivem no page-head: ficam na **barra de ações única**
  (§3.4). A **ação primária de criação** é entrada única do **FAB** (§4.18).
- **Em vez do "Voltar"**, telas de detalhe com hierarquia usam o **Breadcrumb**
  compacto na topbar (§4.23, §5.2) — rótulos dinâmicos via prop `breadcrumb`
  do `PageHeader`.

### 3.4 Barra de ações da tela (FilterBar)
- Barra única, em uma linha, na **ordem fixa**:
  **FILTROS (esquerda) ► BOTÕES DE CONTEXTO · BOTÕES DE VIEWS · FAVORITO (direita)**.
  Implementada por `FilterBar` (`filters`, `contextActions`, `viewTabs`, `favorito`);
  zonas ausentes não renderizam, mas a ordem das presentes é sempre a mesma. Cluster
  da direita com `margin-left:auto`.
- **Lógica fixa, vale para toda tela** (operacional e de detalhe): filtros à
  esquerda; contexto → views → favorito à direita; criação **global**
  (demanda/atividade/projeto) pelo **FAB** (§4.18). Nenhuma tela dispõe esses
  controles fora da barra (no page-head, soltos no corpo) nem duplica a criação
  global na barra.
- **Botões de contexto são sempre só-ícone** via `ContextIconButton` (§4.27) —
  nunca botão com rótulo textual na barra. Criações **locais da tela** (não
  cobertas pelo FAB: novo quadro, novo lançamento, novo contrato, novo grupo)
  entram na zona de contexto na variante **destaque**, por último na zona
  (encostadas nas views).
- Telas de detalhe sem filtros usam a barra só com o cluster direito (ex.: projeto:
  "Novo grupo" e "Link de aprovação" como contexto só-ícone, abas
  Demandas/Pedidos/Config como views via `?tab`, e a estrela de favorito).
- Estado dos filtros sempre serializado em `searchParams` (URL compartilhável).
- Chip de filtro: `border-radius: var(--r-pill); border: 1px solid var(--premium-mist); padding: 8px 14px; font-size:13px; font-weight:500;` — ícone à esquerda.
- "Ordenar automático" usa variante **invertida** (fundo `--brand-ink` fixo, ícone amarelo).

---

## 4. Componentes (catálogo)

> Cada componente abaixo mapeia para a classe do protótipo e o primitivo
> equivalente em `src/components/ui/`. **Reusar** antes de criar novo.

### 4.1 Botões — [`button.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/button.tsx)

| Variante | Classe protótipo | Uso |
|---|---|---|
| Primary | `.btn .btn-primary` | Amarelo + sombra dourada. Reservado para a ação principal da tela ("Nova Demanda", "Confirmar"). |
| Dark | `.btn .btn-dark` | Preto. Ação principal **dentro** de área onde primary não cabe. |
| Ghost | `.btn .btn-ghost` | Borda `--premium-mist`. Ações secundárias. |
| Danger | `Button variant="danger"` | Fundo `--danger`, texto branco. Ação destrutiva já confirmada (par do `ConfirmDialog` §4.10). |
| Icon | `.icon-btn` | 40×40, borda, hover → borda preta. Para sino, tema, atalhos. |
| Sm | `.btn-sm` | Padding reduzido para topbar / inline. |

- Variantes do primitivo: `variant: "primary" | "dark" | "ghost" | "danger"`,
  `size: "default" | "sm"`, `loading` (spinner `Loader2`).

- Tipografia do botão: **uppercase**, `font-weight: 700`, `letter-spacing: .03em`,
  `font-size: 13px` (11px no `sm`).
- Ícone sempre **antes** do texto, 16px.
- Estados: hover, active (translate-y 1px), disabled (opacity .5, cursor not-allowed).

### 4.2 Tabs / Segmented control

- Container: `.tabs` (fundo `--premium-bone`, `padding: 4px`, raio `--r-md`).
- Item: `.tab` (`padding: 8px 16px`); ativo ganha fundo branco + `--sh-sm` + `font-weight: 700`.
- Pode conter ícone + label + `<span class="count">` com contagem.
- **Variante** com ícone-only para alternar Kanban/Lista/Tabela.
- Implementação: zona `viewTabs` do `FilterBar` (§3.4) ou, fora da barra, o
  primitivo [`segmented-tabs.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/segmented-tabs.tsx)
  (`SegmentedTabs` — mesmo visual, sincronizada a um parâmetro de URL, pílula
  ativa que desliza; `clearParams` zera p. ex. a paginação ao trocar de aba).

### 4.3 Chips e badges

- **Chip de filtro**: ver §3.4.
- **Badge numérico** (menu): fundo `--yellow`, texto preto, `font-size: 10px / 700`,
  `padding: 1px 7px`, `border-radius: 999px`.
- **Badge de status** (`.badge-st`): 10px / uppercase / `letter-spacing: .04em`,
  par de tokens semânticos (ex.: `st-novas` = info; `st-fazendo` = warning;
  `st-aprov` = violet; `st-final` = success).
- **Tag de departamento** (`.tag .t-*`): ícone + label, 10px / uppercase / 700,
  pill, cor por departamento.
- **Pri dot**: 8px circulo cheio. Alta = `--danger`, Média = `--warning`,
  Baixa = `--premium-silver`.

### 4.4 Cards

Todos compartilham: `background: var(--premium-white); border: 1px solid var(--premium-mist); border-radius: var(--r-lg); box-shadow: var(--sh-sm);` e hover (quando clicável) `--sh-md` + `translateY(-2px)`.

Tipos:
- **Stat card** (`.stat`): ícone (34×34 com bg colorido), número 30px, label 12px. Variante **feat** = fundo preto, ícone amarelo, label translúcido.
- **Painel** (`.panel`): header `panel-h` (15px/700) + body `panel-b`. Usado para listas de "Demandas para hoje", "Atividades", "Notificações".
- **Card de favorito** (`.fav`): título 14/700 + cliente 11.5/gray + barra de progresso (gradient amarelo→âmbar) + CTA inline.
- **Card de projeto** (`.proj-card`): topo com status pill, título 16/700, cliente com ícone, barra de progresso, rodapé com responsável.
- **Kcard (kanban)** (`.kcard`): tag de departamento no topo, título 14/500, cliente, stagebar (mini barra de etapas), rodapé com avatar stack + meta (data, msgs, prioridade). Variante **locked** = listrada + opacity .62 + ícone cadeado.
- **Deliv** (`.deliv` — Entregas por colaborador): cabeçalho com avatar 44px + nome + depto + 4 KPIs em grid 2×2 + barra de ocupação. Cor da barra ≥90% vira gradient para danger.
- **Cfg card** (`.cfg`): ícone em quadrado bone, título, descrição, CTA "Gerenciar →".
- **Meta-card** (`.meta-card`): cabeçalho com ícone amarelo + título; corpo com linhas chave/valor (`.meta-row`).

### 4.5 Tabelas

- Não há primitivo único de tabela: cada tela monta o próprio `<table>`
  seguindo o padrão abaixo. Reuse os primitivos de apoio:
  [`sort-controls.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/sort-controls.tsx) (ordenação por
  `?sort` via `useViewSort` + helper `view-sort.ts`, nos headers da tabela e no
  kanban) e [`pagination.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/pagination.tsx)
  (`Pagination` — Anterior · "Página X de Y" · Próxima, escreve `?pagina=`
  preservando filtros; oculta com ≤ 1 página; `param` permite listas
  independentes na mesma tela).
- Wrap em `.table-wrap` (mesma sombra/borda dos cards).
- `thead th`: 10.5px / uppercase / 700 / `--premium-gray` / bg `--premium-paper`.
- `tbody td`: 13.5px / `vertical-align: middle` / border-bottom `--premium-bone`.
- Linha clicável: cursor pointer, hover bg `--premium-paper`, last-child sem borda.
  A **extensão inteira da linha** navega (não só a célula do nome); controles
  internos (menus, checkbox de seleção) usam `stopPropagation` para não disparar a
  navegação. Acionável por teclado (`Enter`), foco visível.
- Tabela vem com seleção múltipla quando aplicável (Spec 10f) — checkbox primeiro coluna.

### 4.6 Kanban — board

- **Situação da Demanda (capability demanda-situacao-standby-finalizada):** além do
  status derivado das etapas, a Demanda tem uma situação explícita
  (`SituacaoDemanda`: Aberta/StandBy/Finalizada) editável, por quem tem escrita no
  módulo, no select do cabeçalho do detalhe. `STANDBY` ganha coluna própria ("StandBy", token neutro
  `--premium-gray`/badge `slate`); `FINALIZADA` cai em "Finalizadas". Finalizar fecha
  as etapas restantes e contabiliza o SLA padrão delas em
  `Etapa.tempoSlaContabilizadoMin` (separado do `tempoTrabalhadoMin` real) — reversível
  via snapshot. Finalizar o **projeto** finaliza em cascata as demandas abertas; há
  ação em lote "Mudar situação" na barra de seleção do projeto. Atividades têm o mesmo
  estado `STANDBY` (coluna + select), mas mantêm "Concluída".
- Container `.board` (`display: flex; gap: 16px; overflow-x: auto`). Mantém
  **rolagem horizontal** quando há mais colunas do que cabe na tela (§10).
- **Altura total e uniforme (desktop):** o board ocupa a altura útil disponível
  (área abaixo do page-head e da FilterBar) e estica as colunas
  (`align-items: stretch`) para que **todas tenham a mesma altura**, mesmo vazias
  ou com poucos cards — sem `min-height` fixo que encolha a coluna ao conteúdo.
  Na implementação React, a altura vem de `md:h-[calc(100dvh-140px)]` no board
  (topbar 88px + padding-top 26px + padding-bottom 26px do `main`, respiro
  simétrico — **sem reserva de FAB**, ver §4.18 / `app/(app)/layout.tsx`). No
  **mobile** (abaixo do breakpoint §10) as colunas voltam à altura natural e quem
  rola é a página (`items-start`, sem altura fixa).
- Coluna `.col` (`background: var(--premium-bone); border-radius: var(--r-lg)`)
  como **flex column**: **cabeçalho fixo** acima da área rolável + **corpo
  rolável**.
- **Largura da coluna: elástica entre 280px e 360px** (`flex-1 min-w-[280px]
  max-w-[360px]`). A coluna cresce para ocupar a largura disponível, mas **para
  em 360px**: sem o teto, um board de três colunas viraria três faixas gigantes
  de card estreito, e a leitura do quadro se perde. A sobra fica **à direita** —
  os containers são `justify-start`, então colapsar uma coluna não desloca as
  vizinhas. Board de **largura fixa por coluna** (ex.: Quadros) não se aplica.
- Header `.col-h` (`flex: none`): dot 9×9 colorido por status + título uppercase +
  contagem em pill branca. Fica fixo no topo da coluna durante a rolagem dos
  cards. **Sem botão de criação** — a criação é entrada única do FAB (§4.18).
- Corpo da coluna (`flex: 1; min-height: 0; overflow-y: auto` no desktop): rola
  verticalmente quando os cards passam da altura visível. Usa a classe
  utilitária **`.kanban-col-scroll`** (em `globals.css`) — barra fina (8px no
  webkit / `thin` no Firefox), trilho transparente e thumb em token neutro
  (`--premium-silver`, hover `--premium-steel`), cantos arredondados; adapta ao
  dark mode pela fachada semântica dos tokens (§9). Cores só por token (§2.2/§11).
- **Coluna vazia:** em altura total, exibe um hint discreto de drop ("Solte
  aqui.") com borda tracejada `--premium-mist` (empty state / drop area §4.15),
  ampliando o alvo de soltar.
- **Colunas longas** usam o
  [`coluna-infinita.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/coluna-infinita.tsx)
  (`ColunaInfinita`, capability `kanban-scroll-infinito`): renderiza o lote
  inicial e carrega incrementos quando a sentinela do fim entra na área visível
  — montada **dentro** do corpo rolável da coluna; o DnD segue operando sobre o
  array completo do pai e o estado vazio continua sendo da tela.
- Cards: `.kcard` (§4.4).

### 4.7 Workflow timeline e builder

- **Timeline horizontal** (`.wf`): cada etapa é um **card** (fundo `--premium-white`,
  borda `--premium-mist`, raio `--r-lg`) com, em **linha única**, a pilha de avatares
  dos responsáveis (~24px, sobrepostos, §4.11) ao lado do **nome da etapa em destaque**
  (14px bold); abaixo, a **data** (início – fim) numa **pílula proeminente** na **cor da
  etapa** (que vem do setor do responsável; "Sem prazo" quando ausente); e o **estado**
  ("em andamento" / "concluída dd/mm" em `--success` / "pendente"). A **etapa atual** é
  marcada por **borda/anel amarelo** (`--yellow`) com sombra leve (sem barra de cor no
  topo); as demais ficam **esmaecidas** (opacidade reduzida, restaurada no hover/foco).
  Entre cards consecutivos há uma **seta de fluxo** (`chevron-right` 14px, neutra,
  decorativa/`aria-hidden`). **Não** se exibe o setor/departamento na etapa nem a
  legenda de destaque. Implementação em
  [`workflow-editor.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/demandas/workflow-editor.tsx).
- **Editar a estrutura na demanda (modo estrutura).** Aberta **pelo projeto**
  (Gestão de Projetos → projeto → demanda, link `?from=projeto`) por quem tem
  permissão de editar demandas, a própria timeline vira a superfície de edição:
  - **Mover**: alça de **seis bolinhas** no topo do card, revelada **ao passar o
    mouse** (ou ao focar por teclado); arrastar e soltar com dnd-kit — acessível por
    teclado, respeitando `prefers-reduced-motion`, desabilitado < 768px.
  - **Nova etapa**: botão **`+` redondo** após o último card abre um **popover
    flutuante** com os três tipos (Produção / Aprovação Interna / Aprovação Cliente);
    ao escolher, a etapa entra **no fim** do fluxo e o usuário configura o resto pelo
    card. A **cor e o setor da etapa vêm do responsável**.
  - **Responsável**: o avatar/nome do card é clicável e abre um **popover flutuante
    minimalista** (busca + lista; equipe do projeto no topo, demais abaixo).
  - **Prazos**: a **pílula da data** é clicável e abre um popover com os campos de
    início/fim (auto-save §5.9).
  - **Concluir / Apagar**: no rodapé do card (modo estrutura), **ações largas e suaves**
    lado a lado ocupando a largura — Concluir (`--success` sobre `--success-bg`, ✓ +
    rótulo, na etapa atual) e Apagar (`--danger` sobre `--danger-bg`, lixeira + rótulo,
    nas etapas editáveis, com `ConfirmDialog` §4.10); alvo ≥ 40px, foco visível. Concluir
    uma **aprovação** abre a decisão **Aprovar** / **Pedir ajuste** (reusa
    `solicitarAjuste`).

  Pela **fila de trabalho** (Minhas/Gestão de Demandas) a timeline é somente-leitura
  — lá o responsável só anexa layouts e conclui a própria etapa. A edição **nunca**
  altera o Modelo de Workflow; reusa o `workflow-engine` (não duplicar a
  lógica de etapa, §11) e grava no Histórico (§4.14). Os campos de etapa do **builder**
  de modelos ficam em
  [`stage-fields.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/demandas/stage-fields.tsx).
- **Builder** (`.wfb`): cards `.wfb-stage` ligados por `.wfb-arrow` (lucide:arrow-right), com `wfb-add` tracejado para adicionar etapa. Cada stage tem faixa colorida no topo, nome, tipo (Produção / Aprovação Interna / Aprovação Cliente / Ajuste / Publicação), pill de departamento.

### 4.8 Formulários

- **Input** (`<input>`): `border: 1px solid var(--premium-mist); border-radius: var(--r-md); padding: 11px 14px; font-size: 13px`. Foco: borda `--premium-ink` + `box-shadow: 0 0 0 2px var(--yellow-50)`.
- **Textarea**: idem + `min-height: 76px; resize: vertical`. **Reservado para
  texto curto multilinha** (ex.: motivo/justificativa de uma linha) e comentários
  (que têm tratamento próprio por causa das menções @).
- **Editor de texto longo** (regra): **todo campo de texto longo** (briefings,
  descrições, copy/legenda) usa o editor rico [`rich-editor.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/rich-editor.tsx) —
  salva Markdown e renderiza sanitizado. Novos campos de texto longo já nascem com
  o editor (não com `<textarea>`). Campos curtos (nome, título, e-mail, valor)
  seguem `Input`. Em formulários por `FormData`, espelhe o valor controlado em um
  `<input type="hidden" name=...>`.
- **Label**: padrão eyebrow (11px / 700 / uppercase / `letter-spacing: .05em` / `--premium-gray`).
- **Escolher pessoas** (regra): campos que selecionam **colaboradores** (uma ou
  várias pessoas) usam o `PessoasPicker` [`pessoas-picker.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/pessoas-picker.tsx) —
  clicar abre busca, cada escolhido vira badge. Não use chips de toggle nem `Select`
  para pessoas. Multi com `minSelecionados={1}` para "ao menos um". Ver Design System
  → "Seletor de pessoas (busca + badges)". (Filtro por responsável na FilterBar e
  menções @ seguem padrões próprios — §4.13.)
- **Multi-select genérico** (regra): para selecionar **vários valores não-pessoa**
  (ex.: departamentos), use o `MultiSelect` [`multi-select.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/multi-select.tsx)
  — estilo react-select multi com tokens do Tasks: gatilho com badges removíveis,
  popover (portal) com busca e marcação múltipla, posicionado com flip/clamp
  ([`popover-pos.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/popover-pos.ts)). API `value: string[]` + `onChange`,
  `options: { value, label, cor? }` (o `cor` mostra um ponto colorido), `minSelecionados`.
  Use o `MultiSelect` para **pessoas** apenas quando o `PessoasPicker` (avatares/grupos)
  não couber; para valor único, `Select`. Aplicado nos departamentos da etapa do modelo
  e na "Equipe base" do projeto.
- **Drive input** (link + botão "Adicionar"): pattern documentado em Spec 10b.

### 4.9 Slide-over flutuante (Spec 8) — [`slide-over.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/slide-over.tsx)

- Painel `fixed right-4 top-4 bottom-4 w-[480px]` flutuante, fundo `bg-[var(--premium-white)]` (flipa no dark mode), cantos `rounded-[var(--r-xl)]` e sombra `shadow-[var(--sh-lg)]` — sem utilities cruas/hex.
- Scrim `bg-black/40 backdrop-blur-sm`.
- Width responsiva: `max-w-[calc(100vw-2rem)]`.
- Entrada animada (transform + opacity) com `var(--ease)`, suprimida sob `prefers-reduced-motion: reduce`. Fecha com clique no scrim e `Esc`.
- Header: título + botão fechar (icon-btn); a prop `headerActions` aceita ações
  à direita do título (ex.: toggle de status). **Rodapé fixo** de ações (prop
  `footer` do `SlideOver`): **Cancelar (ghost) à esquerda** e a **ação primária
  (primary/dark) à direita**, fixo na base (não rola com o `children`). Todos os
  formulários em slide-over usam esse rodapé — sem botões soltos no corpo. A
  prop é opcional/retrocompatível; com `loading`, a primária reflete o estado.
- Toda criação/edição não-trivial (cliente, colaborador, departamento, projeto, atividade, contrato, lançamento, modelo) usa este padrão.
- **Formulário com vários campos não mora em popover.** O slide-over é o padrão;
  o popover é para **escolha atômica** — um valor, uma data, um emoji, uma
  entrada rápida de um campo (§4.24). A linha divisória é prática, não estética:
  popover não tem rodapé fixo de ações, não sobrevive a rolagem interna, briga
  com `overflow` de ancestrais, some ao clicar fora no meio do preenchimento e
  não empilha. Quando alguém constrói um formulário dentro dele, esses quatro
  problemas aparecem um a um e cada correção reimplementa mal um pedaço do
  slide-over. Já aconteceu com o construtor de coluna do kanban, que nasceu
  popover e migrou.
  **Sinais de que é slide-over**: mais de dois campos; precisa de Cancelar +
  Salvar; o conteúdo pode crescer; abriria um sub-fluxo.
- **Slide-over aninhado (empilhado).** Um sub-fluxo dentro do slide-over pode
  abrir **outro** slide-over por cima (ex.: botão "Permissões" no cadastro do
  colaborador abre a matriz de permissões). O componente suporta empilhamento
  nativamente: renderize o segundo `<SlideOver>` **como descendente** do
  conteúdo do primeiro (a ordem no DOM garante o empilhamento visual). Regras:
  `Esc` e clique no scrim fecham **apenas o painel do topo**; o painel de baixo
  permanece montado por trás do scrim; o scroll do `body` só é restaurado quando
  o **último** painel fecha; o foco vai ao painel do topo e retorna ao gatilho ao
  fechar. Ao concluir o painel aninhado, ele fecha e devolve o controle ao painel
  de baixo para finalizar a operação. Prefira o aninhamento ao **Wizard** (§5.3)
  quando o sub-fluxo é opcional/independente (não um passo obrigatório do mesmo
  formulário).

### 4.10 Confirm dialog — [`confirm-dialog.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/confirm-dialog.tsx)

- Diálogo central, raio `--r-xl`, sombra `--sh-lg`.
- Título 18/700, descrição 13.5/normal `--premium-steel`.
- Ações: ghost à esquerda, ação destrutiva em `--danger` (não usar yellow para destrutivo).

### 4.11 Avatar e avatar stack

- Avatar: círculo, fundo colorido (por iniciais ou cor do departamento), iniciais em **preto bold**.
- Tamanhos: 20px (timeline), 26px (chip/stack), 34–36px (sidebar/comentário), 44px (Entregas).
- **Stack**: `margin-left: -7px` a partir do segundo, **borda branca 2px** para separar.
- Cor de fundo derivada de hash do nome ou explicitamente vinda do `Colaborador.cor`.

### 4.12 Calendário widget

- Cabeçalho com mês + navegação (chevrons em quadrado bordado).
- Grade 7 colunas, dias de semana em 10px / 700 / gray.
- Dia: `padding 7px`, raio `--r-sm`, hover bg bone.
- `today`: fundo preto + texto amarelo + 700.
- `has` (tem item): dot 4px âmbar abaixo do número (amarelo se também `today`).
- `muted`: dias de outro mês, cor `--premium-silver`.
- **Posicionamento (popover/portal)**: o calendário e demais popovers ancorados
  (seletor de pessoas, prazos do workflow) usam o helper único
  [`popoverPos`](https://github.com/agenciapremium/tasks/blob/main/src/lib/popover-pos.ts) — abrem abaixo do gatilho por padrão,
  fazem **flip** para cima quando falta espaço abaixo e há mais espaço acima, e
  aplicam **clamp** (margem mín. 8px) nas duas bordas para nunca renderizar fora
  da viewport (ex.: campo de data perto da base de um SlideOver).
- **Entrada por teclado (`variant="field"`)**: o campo de formulário tem **três
  segmentos `dd` / `mm` / `aaaa`** com **auto-avanço** (digitou o dia, o foco
  pula para o mês) — o usuário pode **digitar** a data em vez de navegar o
  calendário. O painel abre pelo **ícone de calendário** e por **`ArrowDown`**.
  Uma data completa e válida comita o valor (ISO `yyyy-mm-dd`); segmentos
  incompletos/inválidos revertem no blur; esvaziar tudo limpa. O
  `variant="inline"` (chips, ex.: período do FilterBar) permanece **somente
  clique**, sem digitação.

### 4.13 Comentários e menções

- Linha `.cmt`: avatar 34 + bloco. Header: nome bold + timestamp 11/gray.
- Corpo 13.5/1.55 / `--premium-steel`.
- Menção: chip `@Nome` em `--info` sobre `--info-bg`, raio `--r-sm` — apenas
  destaque visual, **não clicável**. Render em
  [`comentario-body.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/demandas/comentario-body.tsx); o texto
  é persistido na forma canônica `@[colaboradorId:Nome]`.
- Caixa de input: borda mist + botão enviar à direita. Ao digitar `@`, abre
  dropdown filtrável de colaboradores elegíveis (equipe do projeto + responsáveis
  das etapas) — [`comentario-input.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/demandas/comentario-input.tsx).
  Item ≥ 40px, foco visível, navegação ↑/↓/Enter/Esc/Tab.

### 4.14 Histórico (timeline vertical)

- Lista `.hist` com items `.hist-i`: bolinha 30px com ícone (cor semântica do tipo
  de evento) + texto + timestamp 11/gray.
- Linha vertical 2px liga as bolas (`::before`).

### 4.15 Empty state — [`empty-state.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/empty-state.tsx)

- Centralizado, ícone 38px `--premium-silver`, título 14/500, descrição 12/gray,
  CTA `btn-ghost btn-sm` (opcional).
- Para upload/drop area usar borda tracejada: `border: 2px dashed var(--premium-mist)`.

### 4.16 Callout / nota

- `.note`: fundo `--yellow-50`, borda `--gold`, ícone âmbar, texto 11.5/gray.
- Usado para dicas contextuais ("Ao solicitar, uma etapa Ajuste entra no workflow…").

### 4.17 Banner admin

- `.adm-banner`: fundo `--premium-ink`, texto branco, quadrado amarelo com
  cadeado à esquerda. Usado em telas restritas (Entregas).

### 4.18 FAB — botão de ação flutuante — [`fab.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/fab.tsx)

- **Entrada de criação** do shell autenticado, fixo no canto inferior direito
  (`fixed`, offset 1.5rem + `env(safe-area-inset-*)`), redondo 56px, no estilo do
  botão primário amarelo com `--sh-gold` e ícone `plus` (§4.1, §6). Cores de
  marca **fixas** nos dois temas; rótulos/itens sobre `--c-surface`.
- **Conjunto estático**, igual em todas as telas: principal **Criar demanda** e
  atalhos **Criar atividade**, **Criar projeto** e **Criar evento** (evento na
  agenda Google; ordem fixa em
  [`fab-actions.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/fab-actions.ts)). A primeira ação permitida vira a
  principal; as demais ficam acima. Como o FAB é a entrada de criação, as telas
  **não** repetem botões "Nova atividade"/"Novo projeto"/"Novo evento" próprios.
- **Revelação minimalista**: por padrão mostra só o botão principal; os atalhos
  (44px + rótulo) se revelam ao **passar o mouse**/foco no desktop e ao **tocar**
  no mobile (onde a principal vira o primeiro item do dial). O `plus` não vira `x`.
- **RBAC**: a visibilidade vem da **matriz de permissões** (`fab-actions.ts` +
  `can()` de `permissoes.ts`): "Criar demanda" exige **escrita em DEMANDAS**;
  "Criar projeto", **escrita em PROJETOS**; "Criar atividade" é de qualquer
  usuário; "Criar evento" exige escrita em **AGENDA_GOOGLE** **e** a escrita da
  integração operante (organizador
  configurado + DWD), resolvida no servidor (mesmo gate do "Novo evento" do
  calendário) — sem isso a ação some. Sem nenhuma criação permitida, o FAB não
  renderiza. O FAB existe só no shell autenticado (ausente no portal `/aprovar`).
- **Acionamento**: no desktop o clique no principal cria direto; em qualquer caso
  o botão abre o slide-over de criação correspondente (§4.9). Os formulários são
  autocontidos
  ([`nova-demanda-slide-over`](https://github.com/agenciapremium/tasks/blob/main/src/components/demandas/nova-demanda-slide-over.tsx),
  [`nova-atividade-slide-over`](https://github.com/agenciapremium/tasks/blob/main/src/components/atividades/nova-atividade-slide-over.tsx),
  [`novo-projeto-slide-over`](https://github.com/agenciapremium/tasks/blob/main/src/components/projetos/novo-projeto-slide-over.tsx),
  [`evento-google-slide-over`](https://github.com/agenciapremium/tasks/blob/main/src/components/pessoas/evento-google-slide-over.tsx)),
  montados pelo [`fab-shell`](https://github.com/agenciapremium/tasks/blob/main/src/components/layout/fab-shell.tsx). O contexto
  do evento (agendas ativas + recursos do Meet + colaboradores) é resolvido no
  layout autenticado e injetado no shell.
- **Arrastável**: o usuário clica e segura o botão principal para **mover o FAB**
  pela tela (alcança algo embaixo dele). A posição persiste em `localStorage`,
  é limitada à viewport e um arraste **não** dispara a criação (clique suprimido).
  Por isso o `main` **não reserva** espaço para o FAB — usa respiro simétrico
  (`py-[26px]`), e o board do Kanban desconta só `topbar+pt+pb` (§4.6).
- Acessível: alvo ≥44px, foco visível, `aria-label`/`title` em cada botão e
  navegação por `Tab`/`Enter` na ordem do DOM.

### 4.19 Toast — feedback transitório — [`toast.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/toast.tsx)

- **Feedback transitório e não bloqueante** para ações concluídas (item
  copiado, registro salvo/arquivado). **Posição fixa no topo central**, abaixo da
  topbar (offset 76px), `aria-live="polite"` + `role="status"` — anuncia sem
  roubar o foco.
- **Visual de marca**: **fundo escuro** da paleta Premium (`--premium-ink` /
  `--brand-ink`, escuro fixo nos dois temas, §2.7) com **ícone e detalhes em
  amarelo** (`--yellow`/`--gold`) e a mensagem legível sobre o escuro; **conteúdo
  centralizado na vertical**. A variante muda só o **acento/ícone**, não o fundo.
  Contraste do texto ≥ AA (§7). Cores só por token (sem hex).
- **Variantes**: `success`, `info`, `warning` (cores só por token: par
  `--success`/`--info`/`--warning` + `-bg`; ícone lucide `check-circle` / `info`
  / `alert-triangle`, §6). **Erro de submit não usa toast** — vai para banner
  inline (§5.8).
- **Comportamento**: auto-dismiss em **4s**, **pausa ao passar o mouse**/foco,
  empilha em fila (máx. 3 visíveis), dispensável pelo botão `x`. Respeita
  `prefers-reduced-motion` (sem animação de transform/opacidade).
- **Undo opcional**: ações reversíveis podem passar `action: { label: "Desfazer",
  onClick }` e executar a ação na hora, oferecendo o desfazer dentro dos 4s — em
  vez de confirmar antes. Ações destrutivas irreversíveis continuam no
  `ConfirmDialog` (§4.10).
- **Uso (não instanciar direto)**: dispare pelo hook central
  [`useToast`](https://github.com/agenciapremium/tasks/blob/main/src/lib/hooks/use-toast.ts) — `toast.success("Cliente salvo.")`.
  Requer `ToastProvider` (montado no shell autenticado).

### 4.20 Hooks de feedback central — `useToast` / `useConfirm`

- [`useToast`](https://github.com/agenciapremium/tasks/blob/main/src/lib/hooks/use-toast.ts): única forma de disparar toasts
  (§4.19), sem prop drilling.
- [`useConfirm`](https://github.com/agenciapremium/tasks/blob/main/src/lib/hooks/use-confirm.tsx): confirmação imperativa sobre o
  `ConfirmDialog` (§4.10) — `const ok = await confirm({ title, message,
  confirmLabel })`. Resolve `true`/`false`; ação destrutiva em `danger`. Para
  fluxos que precisam **exibir erro de falha e permanecer abertos**, use o
  `ConfirmDialog` controlado direto com a prop `error` (banner inline embutido).
- [`FormErrorBanner`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/form-error-banner.tsx): banner de erro
  inline padrão (§5.8).

### 4.21 Colapsável / accordion — [`accordion.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/accordion.tsx)

- Bloco expansível por seção, controlado pelo pai (`open`/`onToggle`) — permite
  regras como "só o mais recente expandido". Usado na aba Layouts (cada layout =
  um bloco).
- **Cabeçalho** é um `<button aria-expanded>` que cobre o título + chevron
  (alvo ≥ 44px, foco visível, Enter/Espaço alternam). Ícone `chevron-down`
  (§6) rotaciona 180° no estado aberto, com `transition` suprimida sob
  `prefers-reduced-motion`. Ações e metadados (links, contagem, selo de versão)
  ficam **ao lado** do gatilho — nunca aninhados dentro do `<button>` (HTML
  inválido).
- **Corpo** monta/desmonta no `open` (`aria-controls`). Cabeçalho em
  `--premium-paper`, moldura `--premium-mist`, superfície `--c-surface`; cores só
  por token (§2.2). Resolve tema claro/escuro pelos tokens (§9).

### 4.22 Visualizador em tela cheia / lightbox — [`lightbox.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/lightbox.tsx)

- Overlay full-viewport (`role="dialog"`, `aria-modal`) para ver um material em
  tela cheia. Fundo escuro **fixo** (`bg-black/90` — exceção §2.7: mídia em tela
  cheia pede fundo escuro nos dois temas); moldura/controles em `--c-surface`.
- **Imagem** com zoom (botões `zoom-in`/`zoom-out`/reset) e arrastar para deslocar
  quando ampliada; **vídeo/áudio** pelo leitor próprio
  ([`drive-media-viewer.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/drive-media-viewer.tsx));
  formato não-web cai para a rendição do Drive. Ícone `maximize` (§6) sinaliza a
  ação na miniatura.
- **Navegação** anterior/próximo por botões e setas `←`/`→`, restrita ao conjunto
  passado (na aba Layouts, só os materiais **daquele** layout). Contador
  `i / n`. Fecha por `Esc`, scrim e botão; foco gerenciado (foca o diálogo ao
  abrir, devolve ao gatilho ao fechar; alvos ≥ 40px, §7). Carregamento da grade
  com skeleton (§5.7). Respeita `prefers-reduced-motion`.
- **A mídia cabe inteira no palco — a altura mora no wrapper.** O palco é
  `flex-1` numa coluna `fixed inset-0`, e o wrapper direto da mídia leva
  `flex h-full w-full items-center justify-center overflow-hidden`. O `h-full`
  não é decorativo: `max-height` percentual contra pai de **altura indefinida**
  computa como `none` por spec CSS, e aí um vídeo vertical de 1080×1920 renderiza
  no tamanho natural e o `overflow-hidden` do palco **corta** o que sobra. Dar
  altura definida ao wrapper é o que faz o `max-h-full` interno do leitor voltar
  a significar "100% do palco".
- **Não passe classe de tamanho ao leitor de mídia.** Ele já traz
  `max-h-full max-w-full`; mandar `max-h-[80vh] max-w-[90vw]` por cima não
  substitui nada — `cn()` é join puro (§2.8) e as duas ficam, com o desempate
  na ordem do CSS gerado. Com o wrapper definido, o default interno já é o
  comportamento desejado. Vale igual no fallback de imagem que falhou.

### 4.23 Breadcrumb — navegação hierárquica — [`breadcrumb.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/breadcrumb.tsx)

- **Substitui o "Voltar"** nas telas de detalhe com hierarquia (ex.: Projetos →
  nome do projeto → demanda). Renderizada **uma única vez na topbar**, logo
  abaixo do subtítulo, na variante `compact` (componente `Breadcrumbs` do
  shell, change `breadcrumbs-todas-as-telas`): a trilha deriva da rota pelo
  mapa (`src/lib/nav/breadcrumb-map.ts`) ou é sobrescrita pela prop
  `breadcrumb` do `PageHeader` (rótulos dinâmicos de detalhe); trilhas de 0–1
  item não renderizam.
- Recebe `items: { label, href? }[]`: níveis intermediários são **links**
  navegáveis; o **último** é o item atual (texto, sem link). Separador
  `chevron-right` (14px, §6). Props opcionais: `trailing` (elemento inline após
  o último item, ex.: copiar link) e `compact`.
- **Compacto e próximo do header:** variante padrão em 12px (`mb-2`); a
  `compact` da topbar em 10px, linha única com truncamento — **sem**
  `min-h-[40px]` por item (altura natural + `py` pequeno para a área de
  clique). Trilha enxuta, colada ao título.
- Cores só por token: links `--premium-steel` → hover `--premium-ink`; atual
  `--premium-ink`. Tema claro/escuro pelos tokens (§9).
- Acessível: `<nav aria-label="Trilha de navegação">`, item atual com
  `aria-current="page"`, foco visível e área de clique adequada via espaçamento
  interno (§7) — mesmo com a trilha compacta. pt-BR acentuado.

### 4.24 Entrada rápida — popover/dialog compacto de input

- Padrão para **coletar um dado curto na hora** (ex.: apontamento de horas),
  sem abrir um formulário inteiro. Pode ser **popover ancorado** ao gatilho **ou
  dialog compacto** (reusando `ConfirmDialog` §4.10 com corpo customizado).
- Campos claros e rotulados (ex.: **Horas** / **Minutos**), nos tokens da marca
  (`Input` §4.8); **rodapé de ações padrão** (Cancelar à esquerda, primária à
  direita). A **ação primária fica desabilitada enquanto o valor for inválido**.
- Foco inicial no primeiro campo, `Esc` cancela, alvo ≥ 40px, contraste AA, dark
  mode por token, respeita `prefers-reduced-motion`. Erro em banner inline (§5.8).

### 4.25 Bloco de código — [`code-block.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/code-block.tsx)

- **Bloco de código legível com realce de sintaxe e botão de copiar**, usado na
  documentação pública de integração (`/docs`, capability
  `docs-publicas-integracao`) para exemplos em `curl`, JavaScript e JSON.
- **Realce** por um tokenizador leve próprio
  ([`code-highlight.ts`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/code-highlight.ts)) — sem
  dependência externa. As cores de sintaxe vêm de **tokens de code theme**
  (`--code-bg/fg/keyword/string/number/comment/property/punct` em
  `globals.css`), calibrados claro/escuro (§9); **nenhum hex no componente**
  (§11). Linguagens: `bash`, `json`, `javascript` (`text` = sem realce).
- **Copiar**: botão (alvo 40px, foco visível, `aria-label` pt-BR) copia o
  conteúdo bruto e dispara `useToast` (§4.19/§4.20) — `toast.success("Copiado.")`;
  falha de cópia vira `toast.warning(...)` sem perder o conteúdo. Requer
  `ToastProvider` na árvore.
- Cabeçalho com rótulo da linguagem; `<pre>` com rolagem horizontal fina
  (`.code-scroll`), `whitespace-pre` preservando indentação. Respeita AA (§7).

### 4.26 Seletor de emoji — [`emoji-picker.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/emoji-picker.tsx)

- **Picker completo de emojis** (busca, categorias, tom de pele, i18n pt) para
  reações — usado nos comentários dos Quadros (interno e portal) e no mural de
  avisos. Encapsula a lib **emoji-mart** (dataset local, emojis nativos — a
  seleção devolve o **caractere unicode**); **nenhum consumidor importa
  `emoji-mart` diretamente**, só este wrapper (capability `emoji-picker`).
- API: `onSelect(emoji: string)`, `frequentes?` (linha de atalhos de 1 clique —
  padrão 👍 ❤️ 😄 🎉 👀 🚀, sempre visível e também o **fallback** se o painel
  falhar ao carregar — reagir nunca quebra), `align`, `triggerLabel`,
  `triggerClassName`.
- **Carregamento sob demanda**: o painel entra por `next/dynamic` (`ssr:false`)
  só quando o popover abre (chunk próprio, fora do bundle inicial), com skeleton
  de loading. O popover usa `w-max` (abraça a grade de 7 colunas do painel).
- **Tema**: segue a classe `dark` do documento (tema ATIVO do app, não o do
  sistema), observada por `MutationObserver`; o painel vive em shadow DOM (sem
  vazamento de estilos) com sombra/raio zerados — a moldura é do popover.
- Gatilho com alvo ≥ 40px, foco visível e `aria-label`; `Esc` fecha devolvendo o
  foco. Ao exibir o emoji em chips de reação, dar **16px próprios** ao caractere
  (`text-[16px] leading-none`) — não herdar o `text-[12px]` do botão.

### 4.27 Botão de contexto só-ícone — [`context-icon-button.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/context-icon-button.tsx)

- **Padrão único** dos botões de contexto da barra de ações (§3.4, capability
  `filter-bar`). Nenhuma tela hand-rolla o estilo nem usa `Button` textual na
  zona de contexto.
- API: `icon` (LucideIcon), `label` (obrigatório — vira `title` **e**
  `aria-label`), `variant?: "neutro" | "destaque"`, `loading?`, `disabled?`,
  passthrough de `aria-haspopup`/`aria-expanded` para gatilhos de popover/menu.
- **Variantes**:

| Variante | Estilo | Uso |
|---|---|---|
| `neutro` (default) | Alvo ≥40×40, `--r-md`, ícone 16px em `--premium-gray`; hover `--premium-bone` + `--premium-ink`; foco `--yellow-50` | Ações contextuais comuns (link de aprovação, exportações, configurações, novo grupo) |
| `destaque` | Mesmo alvo/raio, preenchido `--c-emphasis` / `--c-on-emphasis` (par do `Button dark`); no hover o ícone fica `--brand-yellow` sobre tinta (no escuro o chip inverte para `--brand-ink`) | **Criação principal local da tela** (novo quadro, novo lançamento, novo contrato) — repouso sem amarelo; o hover assume a assinatura amarelo-sobre-tinta da marca |

- `loading` troca o ícone por spinner (`Loader2`), desabilita e expõe
  `aria-busy` — usar em ações assíncronas (ex.: exportar CSV).
- Só tokens semânticos — claro/escuro automáticos (§9). Ícones do mapeamento §6.
- **Boundary RSC**: `icon` é função e **não atravessa** page RSC → client
  serializado (lucide-react não marca ícones com `"use client"`). Em page
  Server Component, envolver num client component próprio (ex.:
  [`cadastros-button.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/financeiro/cadastros-button.tsx)) —
  nunca renderizar o `ContextIconButton` direto na page.
- Não usar em page-heads (`PageHeader actions` mantém botões textuais) nem no
  corpo das telas — é exclusivo da zona de contexto da barra.

### 4.28 Cabeçalho de impressão — [`print-header.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/relatorios/print-header.tsx)

- **Padrão do "Salvar PDF"** (impressão nativa, capability `relatorios-exportacao`):
  telas de relatório imprimíveis montam um cabeçalho **visível só no print**
  (`hidden print:block`) com a marca (troféu amarelo sobre `--premium-ink`),
  o nome do relatório + aba ativa, o **período por extenso** e a linha
  "Gerado em {data} por {usuário}" — datas calculadas no servidor.
- Acompanha um bloco `@media print` escopado na página (molde:
  `financeiro/relatorios` e `/relatorios`): esconde `.sidebar-root`, `header`,
  `.filter-bar-print-hide` e `.fixed` (FAB/toasts), força superfície clara
  mesmo no tema escuro e usa `break-inside: avoid`
  (classe `relatorio-print-avoid-break`) em cards e tabelas.
- Ícones do gatilho na FilterBar: `download` (CSV) e `printer` (PDF), via
  `ContextIconButton` (§4.27).

---

### 4.29 Gráficos — [`bar-chart.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/bar-chart.tsx) · [`line-chart.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/line-chart.tsx) · [`pie-chart.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/pie-chart.tsx)

- **Barras agrupadas em SVG próprio** (sem lib externa): séries com cor por
  token semântico (ex.: `--success` entradas, `--danger` saídas), grid em
  `--c-border`/`--premium-mist`, texto em `--premium-gray` — claro/escuro
  automáticos. Usado nos relatórios financeiros (fluxo de caixa, previsão).
- **Acessibilidade**: `role="img"` com descrição; cada barra tem `<title>`
  (tooltip nativo); os dados completos devem estar numa tabela adjacente —
  o gráfico é resumo visual, nunca a única fonte (§7).
- **Responsivo** por `viewBox` com rolagem horizontal quando há muitas
  categorias. Valores do eixo formatados pelo chamador (ex.: moeda compacta
  pt-BR via `Intl.NumberFormat`; `formatarValor` no `LineChart`).
- `line-chart.tsx` e `pie-chart.tsx` seguem as mesmas regras (tokens, `role="img"`
  + `descricao`, tabela adjacente como fonte); animações de entrada em §2.6.

### 4.30 Texto expansível / "ver mais" — [`texto-expansivel.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/texto-expansivel.tsx)

- Colapsa qualquer conteúdo (`children`: texto plano ou HTML rico) a uma prévia
  de altura limitada e alterna com um botão "ver mais"/"ver menos" no canto
  inferior direito. Usado na descrição do card (leitura **e** edição) e no corpo
  dos comentários/atividade do modal de Quadros (visão interna e portal).
- **`expandirAoFocar`** (opt-in): para conteúdo **editável** (ex.: `RichEditor`
  da descrição), expande ao receber foco — clicar no campo para editar abre por
  completo, sem o clamp cortar a área de edição. O `overflow-hidden` é aplicado
  **só quando recolhido**, para não clipar o anel de foco nem o popover de link.
- **Detecção de transbordo** medindo `scrollHeight` contra `alturaRecolhida`
  (px) via `ResizeObserver` — recalcula quando a largura muda (modal/janela) e
  só exibe o botão quando o conteúdo realmente transborda. Mede em px (não
  `line-clamp`) para funcionar igual no texto plano (`whitespace-pre-wrap`) e no
  Markdown multi-bloco (`.md-view`).
- **Botão** reusa [`button.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/button.tsx) (`ghost`/`sm`,
  chevron §6, `aria-expanded` + `aria-controls`, alvo ≥ 40px, foco visível).
  Gradiente de **fade** na base recebe a cor de fundo do bloco por prop
  (`fadeColor`, token semântico — ex.: `--premium-bone` na descrição,
  `--c-surface` no comentário); sem hex, claro/escuro pelos tokens (§2.2, §9).
  A prop `acoes` renderiza ações do consumidor na mesma linha do "ver mais",
  alinhadas à direita (ex.: o "Salvar" da descrição em edição).

### 4.31 Presença "quem está vendo" e digitação — [`presenca-avatares.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/presenca-avatares.tsx) · [`digitando-indicador.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/digitando-indicador.tsx)

- **Pilha de presença ao vivo** (capability `realtime-presenca-digitacao`): mostra
  os **outros** colaboradores com a mesma entidade aberta — detalhe da Demanda e
  card modal interno dos Quadros. Compõe sobre o `Avatar` (§4.11): até um limite +
  sufixo **"+k"**, anel separador em `--c-surface` (adapta ao dark, no lugar da
  "borda branca" fixa), nomes por **tooltip acessível** (hover + foco, alvo focável
  ≥ 40px). Recebe a lista **já filtrada** (sem o próprio usuário, deduplicada por
  usuário — várias abas contam como uma). **Não renderiza nada** quando vazia ou
  quando a presença está indisponível (namespace/provedor ausentes) — sem estado
  vazio visual e sem erro de console.
- **Indicador "<nome> está digitando…"**: linha efêmera junto à thread de
  comentários (Demanda e card interno), `aria-live="polite"`, três pontos que
  pulsam respeitando `prefers-reduced-motion`. Some sozinho ~5s após o último
  sinal; **nunca** carrega o texto digitado. O composer emite o sinal por prop
  opcional `onDigitando` (throttle ~3s no `useRealtimePresenca`); o composer
  compartilhado das Atividades permanece sem sinal (prop ausente).
- **Identidade só do servidor**: nome/avatar vêm do claim `info` do JWT de conexão
  (nunca do payload publicado). Só tokens semânticos; dark mode herdado do avatar.
- **Não há presença no portal do cliente** (exceção explícita à paridade
  interno↔cliente dos Quadros — decisão de produto/privacidade).

## 5. Padrões de interação

### 5.1 Toggle de visualização (Kanban / Lista / Tabela / Calendário)
- Sempre via `.tabs` na zona **views** da barra (entre os botões de contexto e o
  favorito — §3.4).
- Estado em `?view=kanban|lista|tabela|calendario` (ou outro `viewParam`, ex.:
  `?tab` nas abas da tela de projeto).

### 5.2 List → detalhe
- **Breadcrumb (§4.23) no lugar do "Voltar"** nas telas de detalhe com
  hierarquia — trilha compacta na topbar, com rótulos dinâmicos via prop
  `breadcrumb` do `PageHeader`.
- Card/**linha clicável na extensão inteira** (não só no nome, §4.5) abre
  **slide-over** quando é edição/visualização rápida.
- Abre **rota dedicada** (`/demandas/[id]`) quando o detalhe tem múltiplas abas
  (Briefing, Texto, Layouts, Comentários, Ajustes, Histórico).
- Detalhe em rota: layout grid `1fr 320px` (conteúdo + meta-cards laterais).

### 5.3 Wizard
- Quando criação tem 3+ campos correlacionados (contrato, modelo de workflow,
  modelo de demanda), usar wizard com passos: **Dados → Resumo → Confirmação**.
- Cada passo dentro do slide-over flutuante. Botão Avançar à direita,
  Voltar ghost à esquerda. Indicador de passos no topo (`<Steps />`).
- Para um sub-fluxo **opcional/independente** (não um passo obrigatório), prefira
  o **slide-over aninhado** (§4.9) em vez do wizard — ex.: definir a matriz de
  permissões a partir do cadastro do colaborador.

### 5.4 Batch actions
- Quando seleção múltipla está ativa em tabela, **toolbar fixa no rodapé** da
  tela exibe contagem e ações. Confirmação por `ConfirmDialog`.

### 5.5 Aprovação / Reprovação
- Aprovar = botão `btn-primary` (amarelo).
- Reprovar = botão `btn-ghost` com texto em `--danger`.
- Após reprovar, sempre exigir comentário (etapa AJUSTE).

### 5.6 Atalhos de teclado
- `⌘K` / `Ctrl+K` abre busca global.
- `Esc` fecha slide-over e dialogs.
- `Enter` confirma diálogos onde a ação primária está em foco.

### 5.7 Estado de loading
- Skeletons (cinza `--premium-bone`) para listas e cards.
- Spinner amarelo apenas em ações de botão (`btn-primary` durante submit).
- Evitar spinner full-page; usar `loading.tsx` da rota com skeleton da estrutura.
- Para salvamento automático (edição em detalhe), o feedback é a barra de
  progresso do painel — ver §5.9 Auto-save (não usar spinner de botão).

### 5.8 Estado de erro
- Banner de erro inline (não toast) para erros de submit/ação. Use o primitivo
  [`FormErrorBanner`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/form-error-banner.tsx); erro de **campo**
  fica associado ao campo (`Input error=`).
- `error.tsx` global com CTA "Recarregar" + link "Voltar para o início".

> **Proibido falar com o usuário pelas janelas nativas do navegador**
> (`window.alert`/`confirm`/`prompt`) — destoam da marca, ignoram o tema e
> bloqueiam a UI. Use a camada Premium: confirmação → `useConfirm`/`ConfirmDialog`
> (§4.10); feedback transitório → `useToast` (§4.19); erro → banner inline
> (acima); coleta rápida → campo em slide-over/dialog (§4.9/§4.10). Regra
> garantida por lint (`no-alert`/`no-restricted-globals`).

### 5.9 Auto-save (edição em detalhe)

**Regra de negócio.** Editar um registro **já existente** persiste
**automaticamente** — sem botão "Salvar". Botão de confirmação fica reservado à
**criação** de um novo registro e a **ações intencionais/sensíveis** (definir
senha, gerar token, ações em lote). Nunca colocar senha ou geração de credencial
em auto-save.

**Gatilhos por tipo de campo** (sempre enviando _apenas o campo alterado_, via
action parcial com Zod `.partial()` — ver `updateAtividade` /
`atividadeUpdateSchema` como referência):
- Texto livre (input/textarea): salva ao **perder o foco** (on-blur); opcionalmente
  com **debounce** enquanto digita.
- Seleção (select, data, toggle/checkbox): salva **imediatamente** ao mudar (on-change).
- Valor igual ao último salvo **não** dispara gravação.

**Feedback visual.** Barra de progresso indeterminada no topo do painel
(`SlideOver` tem a prop `loading`; superfícies fora do slide-over devem prover um
equivalente no topo da área editada). Respeitar `prefers-reduced-motion`.

**Erro.** Em falha de gravação, **reverter** o campo para o último valor salvo e
sinalizar ao usuário — nunca perder a edição em silêncio nem deixar a tela
divergente do servidor.

**Padrão técnico (não reimplementar).** Usar o hook `useAutoSave`
(`src/lib/hooks/use-auto-save.ts`) + util `debounce` (`src/lib/debounce.ts`).
Primeiro consumidor de referência: `components/atividades/atividade-detail.tsx`.

**Inventário / ordem de migração** (do menor ao maior risco):
1. ~~Demandas › abas Briefing e Texto~~ ✅ feito (`demanda-detail.tsx`,
   `updateDemanda` parcial). Editável por qualquer usuário com acesso de
   visualização à demanda; feedback via `AutoSaveBar` (superfície full-page).
2. ~~Configurações simples em slide-over~~ ✅ feito (`grupos-clientes-list`,
   `departamento-list`, `cliente-list`, `modelo-demanda-list`). Padrão: o
   slide-over de **edição** usa auto-save (sub-componente `XEditForm` com
   `useAutoSave` + `AutoSaveBar`); o de **criação** mantém o botão "Criar". As
   actions `update*` passaram a aceitar payload parcial (`schema.partial()`).
3. ~~`colaborador-list`~~ ✅ feito. Nome, e-mail, departamento, papéis, acesso,
   celular e Discord ID auto-salvam; a **senha fica fora** do auto-save (campo +
   botão "Alterar" dedicado, por ser sensível).
4. ~~`workflow-builder`~~ ✅ feito (full-page). Na **edição**, auto-save do
   workflow inteiro com **debounce (~800ms)**, gravando apenas estados **válidos**
   (título + toda etapa com nome e departamento); estados inválidos mostram
   "Pendente". A action `updateModeloWorkflow` retorna os ids das etapas para o
   cliente sincronizar e evitar churn. **Criação** mantém o botão "Salvar"
   (ação intencional + redirect). Feedback via `AutoSaveBar` + texto de status.

Para superfícies fora do `SlideOver`, usar o componente `AutoSaveBar`
(`src/components/ui/autosave-bar.tsx`) no topo da área editada.

> **Inventário concluído** — todas as superfícies de edição previstas adotam o
> auto-save (com as exceções documentadas: criação e campos sensíveis como senha).

Mantêm botão (criação/ações sensíveis): `nova-demanda-slide-over`, `projeto-grid`
(criar), `api-tokens-manager` (tokens). Cada migração adapta a respectiva `update*`
action para aceitar payload parcial.

### 5.10 Login com dois modos (senha | link mágico)

- Toda tela de login com mais de um modo de entrada usa um **toggle segmentado**
  no topo do card: `grid grid-cols-2 gap-1 rounded-[var(--r-md)]
  bg-[var(--premium-bone)] p-1`, item ativo com fundo `--premium-white` +
  `--sh-sm` + `font-bold` (mesmo visual das tabs §4.2). Rótulos: **"Entrar com
  senha" | "Entrar com link mágico"**. Alternar troca o formulário **na própria
  página** — nunca um link para outra rota.
- O link **"Esqueci minha senha"** vive **dentro do modo senha**, alinhado à
  direita logo abaixo do campo de senha (12px, `--premium-steel` →
  `--premium-ink` no hover).
- O modo mágico confirma o envio com o estado de sucesso **no próprio card**
  (círculo `--success-bg` + mensagem genérica anti-enumeração) — sem navegar.
- Vale para o `/login` interno ([login-form.tsx](https://github.com/agenciapremium/tasks/blob/main/src/app/(auth)/login/login-form.tsx))
  e para o portal de Quadros ([portal-quadros/login-form.tsx](https://github.com/agenciapremium/tasks/blob/main/src/components/portal-quadros/login-form.tsx)),
  que embute o mesmo formulário da página `/portal-quadros/entrar` (a página
  permanece por URL). Novas superfícies de login seguem este padrão.

---

## 6. Ícones (lucide-react)

- Lib: `lucide-react@1.17`.
- Tamanho default em UI: **16px**. Em sidebar 18px. Em ícones grandes (empty state) 38px.
- Cor herda do contexto; nunca colorir o `<svg>` diretamente.
- Mapeamento sugerido (manter consistência ao adicionar telas):

| Conceito | Ícone |
|---|---|
| Dashboard | `layout-dashboard` |
| Atividades | `check-square` |
| Demandas | `kanban-square` |
| Projetos | `folder-kanban` / `folder` |
| Gestão | `layers` |
| Entregas / BI | `bar-chart-3` |
| Relatórios de produtividade | `file-bar-chart` |
| Configurações | `settings` |
| Cliente | `briefcase` |
| Colaborador | `users` / `user` |
| Departamento | `layers` |
| Workflow | `git-branch` |
| Modelo de demanda | `file-stack` |
| Etapa atual | `git-commit` |
| Prazo / data | `calendar` |
| Atraso | `alert-triangle` |
| Aprovação | `eye` / `user-check` |
| Concluído | `check-circle` |
| Notificação | `bell` |
| Busca | `search` |
| Tema | `moon` / `sun` |
| Admin restrito | `lock` |
| HERMES | `sparkles` |
| Ajuste | `wrench` |
| Comentário | `message-square` |
| Layout / arte | `image` |
| Vídeo | `video` |
| Áudio | `music` |
| Adicionar | `plus` |
| Abrir em tela cheia | `maximize` |
| Expandir / recolher | `chevron-down` |
| Abrir link externo | `external-link` |
| Link de aprovação | `link-2` |
| Novo grupo (demandas) | `folder-plus` |
| Cadastros (financeiro) | `settings-2` |
| Exportar CSV | `download` |
| Salvar PDF / imprimir | `printer` |

---

## 7. Acessibilidade

- Contraste mínimo: WCAG **AA** (4.5:1 corpo, 3:1 large). Amarelo `--yellow` **não** é acessível para texto pequeno — usar somente em fundos escuros ou para fundo com texto preto.
- Todos os elementos interativos precisam de **estado de foco visível**: borda `--premium-ink` + halo `--yellow-50` (já é o padrão de input).
- Tap target mínimo **40×40px** (`icon-btn` já cumpre).
- Labels associados a inputs (`htmlFor`); placeholders **nunca** substituem labels.
- Componentes que abrem/fecham usam `role="dialog"` e foco gerenciado.
- Suporte `prefers-reduced-motion` em todas as animações.
- Texto alternativo em avatares (`aria-label="Avatar de João Silva"`).

---

## 8. Voz e microcopy

- **Títulos** descrevem a tela: "Minhas Demandas", não "Demandas". Pessoa do verbo é "você".
- **Subtítulos** explicam propósito em uma frase: "Tudo em que você é responsável por alguma etapa."
- **Botões**: verbo no infinitivo curto. "Nova demanda", "Confirmar e gerar cobranças", "Solicitar ajuste". Evitar "OK" / "Sim".
- **Estados vazios**: ação positiva + próximo passo. "Nenhuma demanda hoje. Que tal revisar a fila de aprovações?".
- **Erros**: o que aconteceu + o que fazer. "Não conseguimos gerar o boleto. Verifique os dados do cliente no Asaas e tente novamente."
- **Datas**: relativas para hoje/ontem ("Hoje 14h", "Atrasada há 2 dias"); absolutas a partir de 7 dias ("12 jun", "12 jun 2026").
- **Pluralização**: "1 demanda" / "2 demandas". Nunca "1 demanda(s)".
- **Travessão (`—`) não entra no texto que o usuário lê.** Separando itens ("Fulano · Vale-day off", "Fluxo de caixa · últimos 6 meses"), use **ponto médio** (`·`); marcando pausa, use **dois-pontos** quando a segunda metade explica a primeira, e **vírgula** no resto; isolando um aposto que já contém vírgulas, use **parênteses**. Em `aria-label`/`title`, **reescreva a frase** em vez de trocar o símbolo: leitores de tela anunciam `·` de forma inconsistente. A **única** exceção é o `—` sozinho como marcador de valor ausente numa célula ("Prazo: —"), que não é pontuação e permanece. Um lint (`no-restricted-syntax`) barra o resto.

---

## 9. Dark mode

**Mecanismo:** classe `.dark` em `<html>` (variant
`@custom-variant dark (&:where(.dark, .dark *))`). Um script anti-FOUC no
`<head>` (`src/app/layout.tsx`) aplica a classe **antes da pintura**:

- escolha salva em `localStorage` (chave **`premium-theme`**: `light`|`dark`)
  tem prioridade;
- sem escolha → segue `prefers-color-scheme` do sistema;
- sem nada → claro. **Exceção**: rotas sob `/docs` sem escolha salva assumem
  **escuro** por padrão.

O `ThemeToggle` (`moon`/`sun` na topbar) sincroniza com a classe já aplicada,
alterna `classList.toggle('dark')` e grava em `localStorage`; o ícone só
renderiza após montar (evita mismatch de hidratação).

**O que muda no escuro** (paleta calibrada, ref. `midia.agpremium.com.br` — não
inversão):

| Token | Claro | Escuro |
|---|---|---|
| `--c-bg` | `#FAFAFA` | `#0a0a0a` |
| `--c-surface` | `#FFFFFF` | `#161616` |
| `--c-sunken` | `#F2F2F2` | `#202020` |
| `--c-ink` | `#0A0A0A` | `#fafafa` |
| `--c-muted` | `#8A8A8A` | `#b8b8b8` |
| `--c-subtle` | `#BFBFBF` | `#8a8a8a` |
| `--c-border` | `#E5E5E5` | `#2e2e2e` |
| `--c-border-strong` | `#2A2A2A` | `#4a4a4a` |
| `--success` / `-bg` | `#1E8E4A` / `#E6F4EA` | `#34d17d` / `#0f2e1d` |
| `--warning` / `-bg` | `#C97A0F` / `#FFF3DB` | `#e6b24a` / `#2e2410` |
| `--danger` / `-bg` | `#C0322B` / `#FBE9E7` | `#e87a72` / `#2e1513` |
| `--info` / `-bg` | `#1A6FB0` / `#E6F1FA` | `#5aa6dd` / `#102433` |

- **Amarelo permanece** (`--brand-*`, fixo) — é parte da marca.
- Sombras `--sh-*` intensificam; `color-scheme: dark` ativado.
- Critério de cada PR: **dois screenshots** (claro/escuro) anexados.

---

## 10. Responsividade

- Breakpoint principal observado no protótipo: **1100px** (transformações de
  grid para 1 coluna).
- Sidebar não vira drawer: colapsa para **64px** pelo toggle (atributo
  `data-sidebar-collapsed` em `<html>`, aplicado pré-hidratação — ver
  `globals.css`), em qualquer largura.
- Topbar: busca encolhe para ícone abaixo de **768px** (`md`).
- Tabelas são montadas por tela (não há primitivo `<MobileTable />`); em telas
  estreitas, mantenha a tabela rolável na horizontal dentro do próprio wrapper.
- Kanban mantém scroll horizontal sempre (colunas em altura natural no mobile,
  §4.6).

---

## 11. Do / Don't (rápido)

✅ Use tokens semânticos (`var(--success)`, `var(--premium-ink)`) sempre.
✅ Reuse primitivos em `src/components/ui/` antes de criar novo.
✅ Estado em `searchParams` para filtros/abas/views.
✅ Slide-over flutuante para criar/editar; rota dedicada para detalhes complexos.
✅ Acentue pt-BR. Verifique varredura `rg "Configurac|Notificac|Demand|Calendario"` antes de PR.
✅ Capture claro + escuro para o PR.

❌ Não use cores hex direto em componente.
❌ Não crie modal central novo — use slide-over flutuante.
❌ Não use amarelo para texto em fundo claro.
❌ Não use spinner full-page; prefira skeleton.
❌ Não use emoji em UI de produção.
❌ Não use shadow arbitrária — somente `--sh-sm/md/lg/gold`.
❌ Não duplique lógica do `workflow-engine` para mudar etapa.
❌ Não use `window.alert`/`confirm`/`prompt` — use `useToast`/`useConfirm`/banner inline (§5.8).

---

## 12. Checklist para revisão de PR (UI)

1. Componentes vêm de `src/components/ui/`? Se novo, está documentado aqui?
2. Cores via token? Sem hex direto?
3. Tipografia conforme escala (16/15/14/13/11/10)?
4. Espaçamentos múltiplos de 4px?
5. Estados: hover, focus visível, disabled, loading, empty, error.
6. Acessibilidade: foco, labels, alvo ≥ 40px, contraste AA.
7. Dark mode validado.
8. pt-BR formal e acentuado.
9. Filtros (se houver) em searchParams + esquerda; tabs à direita.
10. Slide-over flutuante (Spec 8) onde aplicável.
11. Screenshots claro + escuro anexados.
