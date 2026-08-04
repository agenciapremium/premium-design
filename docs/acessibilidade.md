# Acessibilidade

Regras obrigatórias para toda UI do sistema. Referência normativa: **WCAG 2.1 nível AA**.

## Contraste

| Conteúdo | Mínimo |
|---|---|
| Texto de corpo (< 18px / < 14px bold) | **4.5:1** |
| Texto grande (≥ 18px ou ≥ 14px bold) | **3:1** |
| Componentes de UI e estados (bordas de input, foco, ícones informativos) | **3:1** |

Verificações já calibradas nos tokens:

| Combinação | Situação |
|---|---|
| `--c-ink` sobre `--c-bg` / `--c-surface` | ✅ AA nos dois temas |
| `--premium-steel` sobre superfícies claras | ✅ AA |
| Preto sobre `--yellow` (botão primário, badge, avatar) | ✅ AA |
| Pares de status `--{cor}` sobre `--{cor}-bg` | ✅ AA, calibrados separadamente por tema |
| Code theme `--code-*` | ✅ AA sobre `--code-bg` nos dois temas |
| `--timer-idle` sobre o chip `--premium-ink` | ✅ AA por tema (amarelo da marca no claro; dourado escurecido `#846A00` no escuro) |

> [!CAUTION]
> **Amarelo `--yellow` (#FBDA25) não é acessível como texto pequeno sobre fundo claro.** Use-o somente: (a) como **fundo** com texto preto; (b) como **acento sobre superfícies escuras** (sidebar, toast, banner). `text-black` literal só é permitido sobre amarelo/cores fixas.
>
> `--premium-gray` (#8A8A8A) sobre branco fica no limite (~3.5:1) — reservado a texto **auxiliar** (subtítulos, timestamps, placeholders), nunca a conteúdo essencial.

## Foco visível

Todo elemento interativo precisa de estado de foco visível. Padrão do sistema:

```css
/* Inputs e gatilhos de formulário */
focus: border-color var(--premium-ink) + box-shadow 0 0 0 2px var(--yellow-50)

/* Botões/ícones sobre superfícies diversas */
focus-visible: ring 2px var(--yellow) ou shadow 0 0 0 2px var(--yellow-50)
```

- Nunca `outline: none` sem substituto visível.
- Em cabeçalhos de accordion, o foco usa `inset shadow` para não vazar da moldura.

## Alvos de toque

- Mínimo **40×40px** (`h-10 w-10` nos controles do lightbox, fechar toast e gatilho do seletor de emoji; opções de popover com `min-h-[40px]`); gatilhos de accordion e do MultiSelect usam **≥ 44px**; FAB 56px.
- Breadcrumb é a exceção documentada (trilha compacta): a área de clique vem do espaçamento interno (`py`), mantida adequada.
- Linhas de tabela clicáveis: a **extensão inteira da linha** é o alvo, acionável por `Enter` com foco visível; controles internos usam `stopPropagation`.

## Navegação por teclado

| Tecla | Comportamento |
|---|---|
| `Tab` / `Shift+Tab` | Percorre na ordem do DOM (FAB, dial, formulários) |
| `Enter` | Confirma diálogo (`ConfirmDialog`); ativa linha de tabela; envia formulário. `Enter`/`Espaço` abrem Select e MultiSelect |
| `Esc` | Fecha slide-over (apenas o painel do **topo** da pilha), diálogo, popover, dropdown, lightbox, dial do FAB, MultiSelect e seletor de emoji |
| `↑` / `↓` | Navegam itens do dial do FAB, do dropdown de menções, das opções do Select e dos resultados da busca global; `↓` num segmento do DatePicker abre o calendário |
| `←` / `→` | Navegam materiais no lightbox |
| `⌘K` / `Ctrl+K` | Busca global (registrada na topbar) |

## Foco gerenciado (overlays)

- `ConfirmDialog`: `role="dialog"` + `aria-modal="true"`; ao abrir, foca a ação primária — exceto quando há campo com `autoFocus`, via `autoFocusConfirm={false}`; ao fechar, o foco **retorna ao gatilho** (no início do fechamento, não ao fim da animação de saída).
- `Lightbox`: foca o diálogo ao abrir, devolve ao gatilho ao fechar; trava o scroll do `body` enquanto aberto.
- `EmojiPicker`: `Esc` fecha e **devolve o foco ao gatilho**.
- `SlideOver`: `Esc` fecha apenas o painel do **topo** da pilha; o scroll do `body` só restaura quando o último painel fecha. O empilhamento visual vem da ordem no DOM. **Pendência conhecida:** o `SlideOver` atual não posiciona o foco no painel ao abrir nem o devolve ao gatilho ao fechar.
- Nenhum overlay implementa focus trap real — `aria-modal` está declarado, mas `Tab` ainda alcança o conteúdo ao fundo (pendência conhecida).

## ARIA — inventário usado no sistema

| Componente | Atributos |
|---|---|
| SlideOver / ConfirmDialog / Lightbox | `role="dialog"`, `aria-modal="true"`, `aria-label` (SlideOver/Lightbox) ou `aria-labelledby`/`aria-describedby` (ConfirmDialog) |
| Toast (container) | `aria-live="polite"`, `role="status"` — anuncia sem roubar foco; dispensar com `aria-label="Dispensar aviso"`; timer pausa em hover **e** em foco (`onFocusCapture`) |
| FormErrorBanner | `role="alert"` |
| AutoSaveBar / barra do SlideOver | `role="progressbar"`, `aria-label="Salvando"`, `aria-hidden` quando inativa |
| Button (loading) | `aria-busy`, spinner `aria-hidden`, rótulo preservado para leitura |
| Accordion | gatilho `<button aria-expanded aria-controls>`; ações/meta **fora** do botão (HTML válido) |
| Tabs / SegmentedTabs | `role="tablist"` / `role="tab"` / `aria-selected` |
| Select | gatilho `role="combobox"` + `aria-expanded`/`aria-haspopup="listbox"`/`aria-controls`; lista `role="listbox"` com `role="option"` + `aria-selected`; `aria-required` advisory |
| MultiSelect | gatilho `role="button"` + `aria-haspopup="listbox"`/`aria-expanded`/`aria-disabled`; painel `role="dialog"`; opções com `aria-pressed`; remoção de badge com `aria-label="Remover {label}"` |
| EmojiPicker | gatilho `aria-label` + `aria-haspopup="dialog"`/`aria-expanded`; painel `role="dialog" aria-label="Seletor de emoji"`; loading `role="status" aria-label="Carregando emojis"` |
| DatePicker | campo composto `role="group"` + `aria-labelledby`; segmentos com `aria-label` "Dia"/"Mês"/"Ano"; gatilho do calendário `aria-haspopup="dialog"` |
| FAB | `aria-haspopup="menu"`, `aria-expanded`, `role="menu"`/`menuitem`, `aria-label` por botão |
| Breadcrumb | `<nav aria-label="Trilha de navegação">`, atual com `aria-current="page"` |
| Tooltip | `role="tooltip"`, visível também por `focus-within` |
| Gráficos (SVG) | `role="img"` + `aria-label`/`<title>` por barra/fatia; **tabela adjacente** é a fonte completa dos dados |
| Avatar | `title`/`alt` com o nome ("Avatar de João Silva") |

## Componentes com requisitos próprios

- **Lightbox** (`src/components/ui/lightbox.tsx`): overlay full-viewport com fundo escuro fixo nos dois temas. `Esc` fecha (a saída animada roda antes do desmonte), `←`/`→` navegam entre os materiais, botões de navegação/zoom têm 40×40px e `aria-label` ("Material anterior", "Ampliar zoom" etc.); `disabled` nos extremos e nos limites de zoom (1×–4×).
- **EmojiPicker** (`src/components/ui/emoji-picker.tsx`): gatilho ≥ 40px com `aria-label` ("Adicionar reação"); atalhos frequentes com `aria-label="Reagir com {emoji}"`; o painel completo (emoji-mart) foca a busca ao abrir (`autoFocus`); em falha de carregamento, degrada para os atalhos com **mensagem textual** ("Busca de emojis indisponível...") — reagir nunca quebra.
- **MultiSelect** (`src/components/ui/multi-select.tsx`): abre por clique ou `Enter`/`Espaço`; a busca (exibida a partir de 8 opções) recebe `autoFocus`; seleção comunicada por `aria-pressed` + check visível (não só cor); `minSelecionados` impede remover abaixo do mínimo.

## Formulários

- Todo campo tem `<label htmlFor>` — **placeholder nunca substitui label**.
- Erro de campo: mensagem textual associada ao campo (não só cor) + borda `--danger`.
- Erro geral: `FormErrorBanner` (`role="alert"`), nunca toast nem `window.alert`.
- A ação primária fica **desabilitada enquanto o valor é inválido** (padrão entrada rápida).

## Movimento

Toda animação respeita `prefers-reduced-motion: reduce`: os overlays via `MotionConfig reducedMotion="user"` (provider único), o restante via variants `motion-reduce:`/`motion-safe:` e blocos `@media`; barras indeterminadas viram estáticas e o crossfade de aba é pulado. Detalhes em [`motion.md`](motion.md).

## Conteúdo

- pt-BR formal e **acentuado** em texto visível e em `aria-label`/`title`.
- Datas relativas ("Hoje 14h", "Atrasada há 2 dias") até 7 dias; absolutas depois ("12 jun 2026").
- Pluralização correta ("1 demanda" / "2 demandas" — nunca "1 demanda(s)").
- Ícones nunca são o único portador de significado: acompanham texto ou `aria-label`.

## Checklist por feature

- [ ] Contraste AA nos **dois temas** (testar com o toggle do showroom).
- [ ] Foco visível em todo interativo; ordem de Tab faz sentido.
- [ ] Alvos ≥ 40px.
- [ ] Labels associados; erros textuais.
- [ ] Overlays com `role="dialog"`, foco gerenciado, `Esc` fecha (e devolve o foco ao gatilho).
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Sem informação só por cor.
