# Catálogo de componentes

Documentação técnica dos primitivos de [`src/components/ui/`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/) e dos padrões compostos do shell ([`src/components/layout/`](https://github.com/agenciapremium/tasks/blob/main/src/components/layout/)). Todos estão demonstrados ao vivo no [showroom](showroom.html).

> [!IMPORTANT]
> **Regra-zero**: antes de criar componente, procure o equivalente aqui. Se realmente precisar criar, faça via token semântico (nunca cor hard-coded), siga o padrão do protótipo e **documente nesta página**.

Convenções comuns a todos:
- Cores **somente por token** — claro/escuro resolvem sozinhos.
- Composição de classe via `cn()` (`src/lib/utils`), com `className` opcional para ajustes do chamador.
- pt-BR acentuado em todo texto e `aria-label`.
- Animações via Motion (`m.*` + presets de `src/lib/motion`), habilitadas pelo [`MotionProvider`](#motionprovider--motion-providertsx); `prefers-reduced-motion` é respeitado por construção.
- Popovers em portal usam `popoverPos()` (`src/lib/popover-pos`) para flip/clamp na viewport e reposicionam em scroll/resize.

---

## Button — `button.tsx`

Botão de ação. Tipografia própria: **uppercase, 700, `tracking-wider`**, fonte Ubuntu, ícone lucide 16px **antes** do texto.

**Props**

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `variant` | `"primary" \| "dark" \| "ghost" \| "danger"` | `primary` | Ver tabela abaixo |
| `size` | `"default" \| "sm"` | `default` | `default` = 18×11px / 13px; `sm` = 12×8px / 11px |
| `loading` | `boolean` | `false` | Crossfade CSS (~150ms) do rótulo para um spinner **sem mudar a largura**; desabilita o botão e marca `aria-busy`. CSS puro de propósito — o Button roda em rotas sem `MotionProvider` (ex.: login) |
| `ref` | `Ref<HTMLButtonElement>` | — | Encaminhada ao `<button>` |
| …rest | `ButtonHTMLAttributes` | — | `disabled`, `onClick`, `type`, etc. |

**Variantes**

| Variante | Visual | Quando usar |
|---|---|---|
| `primary` | Amarelo + `--sh-gold`; hover `--gold`; active `--amber` + `translate-y-px` | **Uma** por tela — a ação principal ("Criar demanda", "Confirmar") |
| `dark` | `--c-emphasis`/`--c-on-emphasis` (preto no claro, **inverte para claro no escuro**), hover `--c-emphasis-hover` | Ação principal onde o amarelo não cabe |
| `ghost` | Transparente, borda `--premium-mist` → hover borda ink | Ações secundárias, "Cancelar" |
| `danger` | `--danger` + texto branco | Destrutivo — **nunca usar amarelo para destrutivo** |

**Estados**: hover (tom), active (`translateY(1px)`), `disabled` (`opacity-50` + `cursor-not-allowed`), `loading` (spinner no lugar do rótulo — nunca full-page).

**Boas práticas**
- Verbo no infinitivo curto: "Nova demanda", "Solicitar ajuste". Evitar "OK"/"Sim".
- Ação de contexto só-ícone na barra de ações usa o **`ContextIconButton`** (abaixo); o icon button 40×40 da topbar (sino/tema) segue como padrão do shell, sem primitivo dedicado.

## ContextIconButton — `context-icon-button.tsx`

Botão de contexto **só-ícone** da barra de ações (zona `contextActions` da FilterBar): alvo ≥ 40×40, `title` (tooltip nativo) + `aria-label` obrigatórios via `label`, foco visível.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `icon` | `LucideIcon` | — | Ícone 16px |
| `label` | `string` | — | Rótulo da ação — vira `title` e `aria-label` |
| `variant` | `"neutro" \| "destaque"` | `neutro` | `neutro` = ícone cinza, hover bone; `destaque` = par `--c-emphasis` (espelho só-ícone do `Button variant="dark"`), reservado à criação principal da tela — repouso sem amarelo; **no hover o ícone fica amarelo sobre tinta** (assinatura da marca) nos dois temas: no claro só o ícone muda, no escuro o chip inverte para `--brand-ink` |
| `loading` | `boolean` | `false` | Spinner + `disabled` + `aria-busy` |
| `ref` / …rest | — | — | `ButtonHTMLAttributes` (sem `children`) |

---

## Badge — `badge.tsx`

Selo de status/categoria. 10px / 700 / uppercase / `tracking-wider` / pill (`px-[10px] py-[3px]`).

| Prop | Tipo | Default |
|---|---|---|
| `variant` | `"default" \| "success" \| "warning" \| "danger" \| "info" \| "violet" \| "teal" \| "slate" \| "gold"` | `default` |

Cada variante usa o par `--{cor}-bg` (fundo) + `--{cor}` (texto); exceções: `default` = bone + steel e `gold` = `--gold-bg` + texto `--amber`. Convenção de status de demanda: Novas = `info` · Fazendo = `warning` · Aprovação = `violet` · Finalizadas = `success` · Atrasada = `danger`.

Variações relacionadas (padrões, não props):
- **Badge numérico de menu**: fundo `--yellow`, texto preto, `1px 7px`, pill.
- **Tag de departamento**: ícone + label, 10px/700/uppercase, pill, par de cor do departamento.
- **Pri-dot**: círculo 8px — Alta `--danger`, Média `--warning`, Baixa `--premium-silver`.

---

## Card — `card.tsx` (+ `CardHeader`, `CardBody`)

Superfície base: `bg-[--premium-white]` + borda `--premium-mist` + `--r-lg` + `--sh-sm`.

| Prop | Tipo | Descrição |
|---|---|---|
| `hover` | `boolean` | Liga o comportamento clicável: `cursor-pointer`, hover `--sh-md` + `-translate-y-[2px]` |
| …rest | `HTMLAttributes<HTMLDivElement>` | `onClick`, `role`, etc. |

`CardHeader`: flex space-between, `px-[18px] py-4`, borda inferior. `CardBody`: `p-2` (ajuste com `className`).

**Tipos compostos** (padrões sobre o Card, ver showroom): stat card (ícone 34px com bg de status + número 30px + label 12px; variante **feat** com fundo `--brand-ink` e ícone amarelo), painel com header, card de projeto (status pill + progresso), card de favorito, cfg card, meta-card (linhas chave/valor).

---

## Input — `input.tsx`

Campo de texto com label (eyebrow 11px) e erro embutidos.

| Prop | Tipo | Descrição |
|---|---|---|
| `label` | `string` | Renderiza `<label htmlFor>` acima |
| `error` | `string` | Borda `--danger` + mensagem 11px abaixo |
| `prefixo` | `string` | Texto fixo dentro do campo, antes do valor (ex.: DDI "+55") — não editável, o caret nunca entra nele; a moldura vira um wrapper `focus-within` |
| `ref` | `Ref<HTMLInputElement>` | — |
| …rest | `InputHTMLAttributes` | — |

Visual: borda `--premium-mist`, `--r-md`, `px-[14px] py-[11px]`, 13px. **Foco**: borda `--premium-ink` + halo `shadow-[0_0_0_2px_var(--yellow-50)]`. Placeholder em `--premium-gray` (nunca substitui o label).

> [!NOTE]
> `<Input type="date">` **delega automaticamente para o `DatePicker`** custom (repassa `value`, `defaultValue`, `onChange`, `onBlur`, `name`, `min`, `max`, `disabled`, `placeholder`) — o date picker nativo do navegador **não é usado em lugar nenhum** (formulários, FilterBar, popover de prazos do workflow).

## Textarea — `textarea.tsx`

Mesmo visual do Input + `min-h-[76px]`, `resize-vertical`. **Reservado a texto curto multilinha** (motivo/justificativa) e comentários. Texto longo (briefing, descrição, copy) usa o **RichEditor** — regra de produto.

## Switch — `switch.tsx`

Interruptor liga/desliga: `button role="switch"` com trilho 20×36 e polegar branco de 16px que desliza. **Não** é `<input type="checkbox">` com `accent-color` — controle nativo não estiliza igual entre navegadores, e o sistema não usa nativos. Ligado = `--success`; desligado = `--premium-mist`; foco = halo `--yellow-50`; deslize suprimido sob `prefers-reduced-motion`.

| Prop | Tipo | Descrição |
|---|---|---|
| `checked` | `boolean` | Estado atual (controlado) |
| `onCheckedChange` | `(proximo: boolean) => void` | Recebe o estado desejado, não um "inverta" |
| `label` | `string` | Vira o `aria-label` — **obrigatório**, o switch não tem texto próprio |
| `disabled` / `title` / `className` | — | Desabilitado usa `opacity-50` + `cursor-not-allowed` |

**Quando usar**: estado binário que vale por si e é aplicado na hora (ativo/inativo, ligado/desligado) — é auto-save, não tem botão Salvar. Escolher entre várias opções é `Select` ou chips; disparar uma ação é `Button`.

**Confirmação**: o switch **não muda sozinho** quando a mudança precisa ser entendida antes. O consumidor confirma no `onCheckedChange` e só troca o estado se a pessoa seguir — interruptor que se mexe e volta atrás mente sobre o que aconteceu. Ver o bloco "QA do HERMES" das Configurações do projeto, que confirma ao desligar e não confirma ao religar.

**Rótulo ao lado, não dentro**: o switch é só o controle. O texto que diz o que ele controla fica à direita, em 13px, e muda com o estado.

## Select — `select.tsx`

Select **custom** do DS (o `<select>` nativo não é usado) — mesmo padrão dos popovers flutuantes do workflow (responsável/nova etapa): painel portal com `--sh-lg` e entrada `motionPreset("menu")`, itens de 40px com hover bone e **busca filtrável** (ignora acentos) quando a lista tem **8+ opções**.

| Prop | Tipo | Descrição |
|---|---|---|
| `options` | `{ value, label }[]` | Lista de opções |
| `placeholder` | `string` | Item de valor vazio no topo (equivale à option vazia do nativo); também é o texto do gatilho sem seleção |
| `value` / `defaultValue` | `string` | Controlado / não controlado |
| `onChange` | `(e: SelectChangeEvent) => void` | Evento sintético `{ target: { value, name } }` — compatível com call sites do nativo |
| `name` | `string` | Espelha o valor em `<input type="hidden">` (suporte a FormData) |
| `required` | `boolean` | Advisory (`aria-required`) — a validação obrigatória é a do servidor/Zod |
| `variant` | `"field" \| "inline"` | `field` (padrão) = campo com moldura de input; `inline` = gatilho compacto sem moldura, estilizado pelo chamador via `className`/`style` (ex.: pílula de status na tabela de atividades) |
| `ariaLabel` | `string` | Rótulo acessível do gatilho quando não há `label` visível |
| `style` | `CSSProperties` | Estilo inline do gatilho (ex.: cor do texto da pílula de status) |
| `label`, `error`, `disabled`, `className`, `id` | — | Como no Input (`label`/`error` ignorados no `inline`) |

Anatomia: gatilho com visual de input (rótulo longo trunca com reticências; chevron rotaciona 180° aberto; foco/aberto = borda ink + halo); popover portal ancorado com largura do gatilho (mín. 200px no `inline`), reposiciona em scroll/resize (funciona dentro do SlideOver); item selecionado = `font-medium` + ícone `check`; painel com `data-select-pop` para hospedeiros ignorarem cliques (ver DatePicker). Acessível: `role="combobox"` + `role="listbox"`/`option`, navegação ↑/↓/Enter/Esc (+ Home/End sem busca; Esc fecha só o select, não o SlideOver), foco devolvido ao gatilho, lista vazia mostra "Nenhuma opção encontrada.". Em linha de tabela clicável, envolva com `onClick={(e) => e.stopPropagation()}` para o gatilho não navegar a linha.

## MultiSelect — `multi-select.tsx`

Multi-select genérico do DS (estilo react-select multi) para **valores arbitrários** (ex.: departamentos) — para **pessoas** use o `PessoasPicker`. Controlado por `value: string[]`; os itens escolhidos viram badges removíveis no campo; o popover (portal, `popoverPos` com flip/clamp, `data-multiselect-pop`) tem busca acento-insensível e item ativo com fundo `--gold-bg` + `check`.

| Prop | Tipo | Descrição |
|---|---|---|
| `value` / `onChange` | `string[]` / `(ids) => void` | Seleção controlada |
| `options` | `MultiSelectOption[]` | `{ value, label, cor? }` — `cor` mostra um ponto colorido (útil para departamentos) |
| `minSelecionados` | `number` | Impede remover abaixo do mínimo (ex.: `1`) |
| `searchable` | `boolean` | Força (ou oculta) a busca; default automático a partir de 8 opções |
| `label`, `placeholder`, `ariaLabel`, `disabled`, `className` | — | Como nos demais campos |

Gatilho `role="button"` operável por teclado (Enter/Espaço), `Esc` fecha, badges com `aria-label="Remover <label>"`.

## PessoasPicker — `pessoas-picker.tsx`

Seletor de **pessoas com busca + badges** — mesmo motor de busca dos popovers de responsável do workflow, generalizado. Clicar abre um popover (portal, `--sh-lg`) com busca acento-insensível e a lista de colaboradores (opcionalmente em seções "Equipe do projeto" / "Outros"); cada escolhido vira um **badge** (avatar + nome + remover) no campo. Use-o sempre que o usuário escolhe **uma ou várias pessoas** — é o padrão preferido ao multi-select (substitui chips de toggle) e aos selects de responsável.

| Prop | Tipo | Descrição |
|---|---|---|
| `value` / `onChange` | `string[]` / `(ids) => void` | Ids selecionados (controlado). Em `single`, sempre 0–1 id |
| `multiple` | `boolean` | Mantém o popover aberto, marca itens com `check` e acumula badges; sem ela, escolhe um e fecha |
| `minSelecionados` | `number` | Impede remover abaixo do mínimo (ex.: `1` para "ao menos um responsável") |
| `colaboradores` | `PessoaOption[]` | Lista simples (sem seções) |
| `grupos` | `PessoaGrupo[]` | Lista em seções (`label?` + `itens`) — ex.: equipe/outros |
| `loading` / `erro` | `boolean` / `string` | Skeleton no popover / erro inline (sem toast) |
| `disabled`, `placeholder`, `label`, `ariaLabel` | — | Campo desabilitado / texto sem seleção / rótulo / rótulo acessível do popover |

`PessoaOption`: `{ id, nome, cor?, descricao?, src? }` — sem `cor`, deriva uma cor de avatar estável do `id` (`corPorChave`, exportada); `descricao` é subtítulo (ex.: departamento); `src` é a foto.

Anatomia: gatilho com visual de input (foco/aberto = borda ink) que mostra os badges ou o placeholder + chevron; popover portal ancorado via `popoverPos` (largura do gatilho, mín. 280px), reposiciona/convive dentro do SlideOver. Painel marcado com `data-pessoas-pop`; o próprio dismiss ignora cliques dentro de painéis `data-select-pop`/`data-datepicker-pop` (convive com Select/DatePicker no mesmo formulário). Acessível: gatilho `role="button"` operável por teclado, alvos ≥ 40px, `Esc` fecha só o popover, badges com `aria-label="Remover <nome>"`. Item ativo = fundo `--gold-bg` + borda `--gold`.

Subexport **`PessoasSearchPanel`**: só o conteúdo do dropdown (busca + lista, com `searchPlaceholder` opcional), para hosts que já têm o próprio gatilho/popover — é o que o `colaborador-picker.tsx` (responsável de etapa/ajuste do workflow) consome.

## DatePicker — `date-picker.tsx`

Calendário custom alinhado ao DS, exposto via `Input type="date"` ou direto. **Único** seletor de data do sistema — o nativo não aparece em lugar nenhum (FilterBar e popover de prazos do workflow inclusos).

| Prop | Tipo | Descrição |
|---|---|---|
| `value` / `defaultValue` | `string` | ISO `yyyy-mm-dd` (igual ao nativo) |
| `onChange` | `(e: DateChangeEvent) => void` | Evento sintético `{ target: { value, name } }` — compatível com call sites do input nativo |
| `onBlur` | `() => void` | Dispara ao fechar o calendário e ao sair de verdade dos segmentos |
| `min` / `max` | `string` | Datas fora do intervalo ficam desabilitadas (ranges usam um espelhando o outro) |
| `name` | `string` | Espelha o valor em `<input type="hidden">` (suporte a FormData) |
| `variant` | `"field" \| "inline"` | `field` (padrão) = campo com moldura de input e **digitação por segmentos**; `inline` = gatilho compacto sem moldura para embutir em chips/células (ex.: período do FilterBar) — só clique abre o calendário, sem digitação |
| `ariaLabel` | `string` | Rótulo acessível do gatilho quando não há `label` visível (obrigatório no `inline`) |
| `label`, `error`, `disabled`, `placeholder`, `className`, `id` | — | Como no Input (`label` ignorado no `inline`) |

Anatomia do `field`: três inputs de segmento `dd / mm / aaaa` (numéricos, `tabular-nums`) com **auto-avanço** ao completar, Backspace em segmento vazio volta ao anterior, ↓ abre o calendário; o valor é comitado assim que dia+mês+ano formam data válida dentro de `min`/`max` (esvaziar tudo limpa; blur real reverte segmentos inválidos); à direita, botão-ícone `calendar` 40px abre/fecha o painel. No `inline`, o gatilho mostra a data `dd/mm/aaaa` (ou o placeholder), sem ícone. Popover portal (`motionPreset("menu")`, posição via `popoverPos` com flip/clamp) com navegação de mês, grade 7 colunas, rodapé "Hoje" / "Limpar" (Limpar só aparece com valor). Estados de dia: selecionado = amarelo + preto 700; hoje = anel `--premium-silver`; desabilitado = `opacity-30`. Fecha por clique fora; `Esc` fecha **só o calendário** (`stopPropagation` — o SlideOver/popover hospedeiro fica aberto); reposiciona em scroll/resize.

> [!NOTE]
> O painel do calendário leva o atributo `data-datepicker-pop` (e o do Select, `data-select-pop`; o do MultiSelect, `data-multiselect-pop`): popovers hospedeiros com dismiss próprio (ex.: prazos do workflow) devem **ignorar cliques dentro desses painéis**, pois eles vivem em portal fora da árvore DOM do hospedeiro — ver `useDismiss` no `workflow-editor.tsx`.

## FormErrorBanner — `form-error-banner.tsx`

Banner de erro inline (`role="alert"`): borda + ícone `alert-circle` em `--danger`, fundo `--danger-bg`, 12.5px. **Padrão único de erro geral de formulário** — erro de campo fica no próprio campo (`Input error=`); erro **nunca** usa toast nem janela nativa. Renderiza `null` sem `message`.

## AutoSaveBar — `autosave-bar.tsx`

Barra de progresso indeterminada de 2px (`role="progressbar"`, `aria-label="Salvando"`) para feedback de auto-save em superfícies **fora** do SlideOver (que tem o próprio indicador via `loading`). `active: boolean` controla a visibilidade (via `visibility`, sem reflow). Sob `prefers-reduced-motion`, vira barra cheia estática (estilo `.autosave-bar` em `globals.css`).

---

## Avatar — `avatar.tsx`

Círculo com iniciais **pretas em bold** sobre a cor do colaborador, ou foto (`src`).

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `name` | `string` | — | Gera iniciais (`getInitials`) + `title` |
| `color` | `string` | `var(--yellow)` | Cor de fundo (vinda de `Colaborador.cor`) |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 26px / 36px / 44px (20px existe em timelines, via classe) |
| `src` | `string \| null` | — | Foto (Blob); com ela as iniciais não aparecem |

Foto que falha ao carregar (ex.: blob de store excluída) **cai para as iniciais** em vez do ícone de imagem quebrada; a URL com erro fica memorizada e uma nova `src` tenta de novo.

**Stack**: a partir do segundo avatar, `margin-left: -7px` + anel de 2px na cor da superfície. Excedente vira chip "+N" — para presença em tempo real, use o `PresencaAvatares` pronto.

## PresencaAvatares — `presenca-avatares.tsx`

Pilha de avatares "quem está vendo" da presença em tempo real. **Não renderiza nada** quando a lista está vazia ou a presença está indisponível (o chamador passa a lista já filtrada, sem o próprio usuário e deduplicada) — ausência total, sem estado de erro.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `presentes` | `PresenteRealtime[]` | — | Vem do `realtime-connection-provider` (`userId`, `nome`, `avatarUrl`) |
| `max` | `number` | `4` | Máximo de avatares antes do sufixo "+k" |
| `className` | `string` | — | — |

Reusa o `Avatar` (`size="sm"`, sobreposição `-7px`, anel `ring-2` em `--c-surface`). O conjunto é um alvo focável ≥ 40px com `Tooltip` (hover + foco) e `aria-label` listando os nomes via `Intl.ListFormat` pt-BR ("A, B e C estão vendo esta tela").

## Tooltip — `tooltip.tsx`

Tooltip 100% CSS (sem lib): balão escuro fixo nos dois temas (`--brand-ink` + texto `--brand-on-ink`, 12px/500) que aparece no **hover e no foco por teclado** (`group-focus-within`). Props: `label`, `side` (`right` default, `top/bottom/left`), `className` (wrapper), `bubbleClassName` (balão). Para textos longos ou conteúdo rico, não usar tooltip — preferir slide-over/popover.

---

## FilterBar — `filter-bar.tsx`

Barra de ações única da tela. **Ordem fixa**: FILTROS (esquerda) ► CONTEXTO · VIEWS · FAVORITO (direita). Estado 100% em `searchParams`.

| Prop | Tipo | Descrição |
|---|---|---|
| `filters` | `FilterConfig[]` | Chips de filtro (esquerda) |
| `contextActions` | `ReactNode` | Botões de contexto da tela (primeiro do cluster direito); `actions` sobrevive como **alias legado deprecado** |
| `viewTabs` | `TabConfig[]` | Tabs de visualização — `{ value, label, icon?, count? }` (`count` exibe a contagem ao lado do rótulo) |
| `viewParam` / `defaultView` | `string` | Parâmetro de URL da view (default `view`) |
| `favorito` | `ReactNode` | Estrela — sempre por último |
| `telaKey` | `string` | Liga a **persistência por usuário** dos filtros da tela: restaura o último filtro salvo na abertura (se a URL não trouxer filtros) e salva alterações com debounce (`useFiltrosPersistidos`); "limpar tudo" também apaga o estado persistido |
| `buscaSempreAberta` | `boolean` | Opt-out da busca colapsável — o campo do filtro `search` fica sempre aberto |
| `permitirQuebra` | `boolean` | Opt-out da linha única — os filtros voltam a quebrar em várias linhas (`flex-wrap`) |

`FilterConfig`: `{ key, label, type: "select" | "multiselect" | "daterange" | "toggle" | "search", options?, icon?, placeholder?, searchable?, limiteVisivel? }`. `daterange` serializa como `<key>De`/`<key>Ate`. `searchable` força/oculta a busca do dropdown (default: automático a partir de 8 opções); `limiteVisivel` corta a lista **sem termo de busca** (default global: 6 quando a busca está disponível — digitar busca na lista completa; nunca corta sem busca).

Anatomia dos chips (pill 36px, 13px/500): **idle** (borda mist) → hover borda steel; **ativo** (borda ink); **toggle ligado** (fundo `--brand-ink` fixo + ícone amarelo — ex.: "Ordenar automático"); **select** com dropdown custom (item "Todos" que limpa + `check` no selecionado); **multiselect** com contador invertido e dropdown de checkboxes; **daterange** com dois `DatePicker variant="inline"` (Início – Fim, um limitando o outro via `min`/`max`); **search** = lupa colapsável que expande a um campo de 200px (foca ao abrir, debounce de 300ms para a URL, `Esc`/blur vazio recolhe, botão de limpar quando ativo). Nenhum controle nativo do navegador. Com qualquer filtro ativo, aparece o botão redondo amarelo de **limpar tudo**.

Comportamento estrutural: os filtros vivem em **linha única com rolagem horizontal** (scrollbar oculta) e os dropdowns renderizam em **portal `position: fixed`** (`popoverPos` + `motionPreset("menu")`) — não são cortados pela rolagem da barra. Toda mudança de filtro/visão **reseta a paginação** (remove `?pagina=`) via `useSetParams` (exportado — `router.replace` + `scroll: false`), e a troca de view passa por View Transitions quando disponíveis (`navegarComTransicao`).

Subexport **`ViewTabsPill`**: o grupo de tabs de visão com pílula deslizante (indicador CSS medido por ref), para telas que precisam de um **segundo** grupo de abas fora da barra e em outro param (ex.: abas "Todas/Para hoje/Atrasadas" da visão Tabela) — reusar com `useSetParams` mantém visual e reset de página num só lugar.

**Boas práticas**: nenhuma tela dispõe filtros/views/favorito fora da barra; criação **não** entra na barra (é do FAB); zonas ausentes não renderizam, mas a ordem das presentes nunca muda.

## SegmentedTabs — `segmented-tabs.tsx`

Tabs segmentadas standalone, mesmo visual das views do FilterBar, sincronizadas a um parâmetro de URL. Para quando as abas vivem fora da barra (ex.: ao lado da busca em Lançamentos). A pílula ativa **desliza** (indicador CSS medido por ref, recalculado por `ResizeObserver`) e a troca usa View Transitions quando disponíveis.

| Prop | Tipo | Descrição |
|---|---|---|
| `tabs` | `SegmentedTab[]` | `{ value, label, icon?, badge? }` — `icon` é `ReactNode` já renderizado (atravessa a fronteira server → client); `badge` é um selo após o label (ex.: `<Badge>` de contagem) |
| `param` | `string` | Parâmetro de URL da aba ativa |
| `defaultValue` | `string` | Aba usada quando a URL não traz `param` |
| `clearParams` | `string[]` | Parâmetros zerados ao trocar (ex.: paginação) |

Acessível: `role="tablist"` / `role="tab"` / `aria-selected`.

## SortControls — `sort-controls.tsx`

Controles de ordenação sincronizados ao param `sort` da URL (helpers em `lib/helpers/view-sort`). Mudar a ordenação **reseta a paginação** — mesmo contrato da FilterBar (`router.replace` + `scroll: false`).

- **`useViewSort()`** — hook que lê/escreve `{ field, dir }` no param `sort`.
- **`SortableTh`** (`field`, `label`, `className?`, `title?`) — cabeçalho de coluna clicável de tabela: alterna a direção, exibe seta ↑/↓ no ativo e publica `aria-sort`; `title` serve de tooltip explicativo da métrica.
- **`ColumnSortToggle`** (`paramKey`, `title`) — toggle só-ícone no header de coluna do kanban (o campo é fixo por kanban; o param próprio guarda só a direção). Cicla natural → ascendente → descendente → natural; ativo = chip `--brand-ink` com ícone amarelo (mesmo idioma do toggle ligado da FilterBar).

## Pagination — `pagination.tsx`

Controle único de paginação: Anterior · "Página X de Y" · Próxima. Escreve `?pagina=` preservando os demais parâmetros (`router.replace` + `scroll: false`); página 1 **remove** o param.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `pagina` / `paginas` | `number` | — | Estado atual/total |
| `param` | `string` | `"pagina"` | Permite paginar listas independentes na mesma tela |

Com `paginas <= 1` os controles somem, mas o componente ainda renderiza o **respiro do fim da listagem** (`pb-[26px]`) — o padding precisa ser do último elemento em fluxo (margem do último filho e padding do `<main>` não entram na área rolável). Botões desabilitados nos limites; `aria-live` no contador; `<nav aria-label="Paginação">`.

## ColunaInfinita — `coluna-infinita.tsx`

Carregamento incremental dos cartões de uma coluna de Kanban: renderiza o primeiro lote (`KANBAN_LOTE_INICIAL`) e carrega mais (`KANBAN_LOTE_INCREMENTO`) conforme a **sentinela** do fim entra na área visível (`useInfiniteWindow`). Genérico (`<T>`):

| Prop | Tipo | Descrição |
|---|---|---|
| `items` | `T[]` | Lista completa (o DnD segue operando sobre o array completo do pai) |
| `getKey` / `renderItem` | `(item, index) => …` | Chave e render de cada cartão |
| `resetKey` | `string` | Reinicia a janela ao mudar (filtro/ordenação/modo) |

Deve ser montado **dentro** do container rolável da coluna. Não renderiza estado vazio (cada tela mantém o seu; o badge de total continua refletindo `items.length`). A sentinela exibe "Carregando mais…" com spinner (`role="status"`).

## Breadcrumb — `breadcrumb.tsx`

Trilha hierárquica que **substitui o "Voltar"** em telas de detalhe.

| Prop | Tipo | Descrição |
|---|---|---|
| `items` | `{ label, href? }[]` | Intermediários com `href` são links; o último é o atual (`aria-current="page"`) |
| `trailing` | `ReactNode` | Elemento inline após o último item (ex.: copiar link) |
| `compact` | `boolean` | Variante reduzida para o header: 10px, linha única sem quebra (último item trunca em 260px), `mt-[3px]` — pensada para ficar sob o subtítulo na topbar |

Padrão: 12px/500, separador `chevron-right` 14px em `--premium-silver`, links `--premium-steel` → hover ink, `mb-2`. `<nav aria-label="Trilha de navegação">`.

## PageHeader — `page-header.tsx`

Registra `eyebrow` / `title` / `subtitle` / `titleAction` no **contexto da topbar** (o título aparece lá, não no corpo) e renderiza apenas as `actions` alinhadas à direita antes do conteúdo. Limpa o contexto ao desmontar. Prop `breadcrumb?: BreadcrumbItem[]` sobrescreve a trilha derivada da rota (rótulos dinâmicos de telas de detalhe) — use identidade estável (literal do render do servidor ou `useMemo`) para evitar re-render em loop; `titleAction` também deve ser memoizado.

---

## SlideOver — `slide-over.tsx`

Painel flutuante de criação/edição — o overlay padrão do sistema (modal central novo é proibido).

| Prop | Tipo | Descrição |
|---|---|---|
| `open` / `onClose` | — | Controlado pelo pai |
| `title` | `string` | Header + `aria-label` |
| `loading` | `boolean` | Barra indeterminada sob o cabeçalho (auto-save/submit) |
| `footer` | `ReactNode` | Rodapé **fixo** de ações: Cancelar (ghost) à esquerda, primária à direita |
| `headerActions` | `ReactNode` | Ações no cabeçalho, à direita do título (ex.: toggle de status) — o `aria-label` continua sendo o `title` |

Anatomia: portal em `document.body` (z-50, acima do FAB z-40); scrim `bg-black/40 backdrop-blur-sm`; painel `fixed right-4 top-4 bottom-4 w-[480px] max-w-[calc(100vw-2rem)]`, `--r-xl`, `--sh-lg`; entrada e saída animadas via `AnimatePresence` + presets `scrim`/`slideOver`. Corpo rolável; header e footer fixos.

**Empilhamento (aninhado)**: renderize o segundo `<SlideOver>` como **descendente** do conteúdo do primeiro. Pilha global garante: `Esc` fecha só o painel do topo (o scrim fecha o próprio painel); scroll do body restaura quando o último fecha. Prefira aninhamento ao wizard quando o sub-fluxo é opcional/independente.

## ConfirmDialog — `confirm-dialog.tsx`

Diálogo central de confirmação (`--r-xl` + `--sh-lg`, máx. 420px, preset `modal`).

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `open`, `onClose`, `onConfirm` | — | — | Controlado |
| `title` / `message` | `string` | — | 18/700 + 13.5 `--premium-steel` |
| `confirmLabel` / `cancelLabel` | `string` | `"Excluir"` / `"Cancelar"` | — |
| `variant` | `"danger" \| "primary"` | `danger` | Cor da ação primária — destrutivo nunca usa amarelo |
| `tone` | `"danger" \| "neutral"` | `danger` | Ícone do cabeçalho: alerta vermelho ou relógio neutro |
| `loading` | `boolean` | — | Desabilita ações, primária mostra "Processando..." |
| `error` | `string` | — | `FormErrorBanner` inline — diálogo permanece aberto na falha |
| `confirmDisabled` | `boolean` | `false` | Para diálogos com campo inválido |
| `autoFocusConfirm` | `boolean` | `true` | Desligue quando há campo com `autoFocus` |
| `secondaryAction` | `{ label, onClick, icon? }` | — | Ação secundária **destrutiva** entre Cancelar e a primária (ex.: "Excluir definitivamente" no diálogo de arquivar) — para gestos com duas saídas; a confirmação da irreversível vive num segundo diálogo |
| `children` | `ReactNode` | — | Conteúdo extra (ex.: campo de horas — padrão "entrada rápida") |

Foco gerenciado (foca primária ao abrir, devolve ao gatilho), `Esc` cancela, `Enter` confirma. Uso imperativo via hook **`useConfirm`** (`const ok = await confirm({ title, message })` — requer `ConfirmProvider`).

## Lightbox — `lightbox.tsx`

Visualizador full-viewport de materiais (`role="dialog"` + `aria-modal`, z-[60]). Fundo escuro **fixo** `bg-black/90` nos dois temas (exceção documentada: mídia em tela cheia). Props: `files: DriveFile[]`, `index`, `onIndexChange`, `onClose`, `context: DriveContext`.

Imagem com zoom (botões +/−/reset, 1×–4× em passos de 0,5) e arrastar quando ampliada, com fallback em cascata original → rendição do Drive → erro; vídeo/áudio/demais tipos via `DriveMediaViewer`; navegação ←/→ restrita ao conjunto passado (botões desabilitados nos extremos); contador `i / n`; fecha por Esc/botão com **saída animada** (o `onClose` corre ao fim do fade) e foco devolvido ao gatilho; trava o scroll do body.

**Contrato de dimensionamento**: o wrapper direto da mídia leva `flex h-full w-full items-center justify-center overflow-hidden` e **nenhuma classe de tamanho vai ao `DriveMediaViewer`**. O `h-full` dá altura definida ao pai — sem ela, o `max-h-full` interno do leitor computa como `none` e o vídeo vertical renderiza no tamanho natural, cortado pelo `overflow-hidden` do palco. Vale igual no fallback do `ZoomableImage` em `stage === "failed"`.

## DriveMediaViewer — `drive-media-viewer.tsx`

Leitor próprio de mídia do Drive — reproduz **imagem, vídeo e áudio** servindo o conteúdo original pela rota de proxy; **nunca** um `<iframe>` do Drive (preview instável, sobretudo vídeo). Props: `file: DriveFile`, `context: DriveContext`, `className`.

Imagem começa pelo original em alta e, se o formato não renderizar no navegador (PSD, TIFF), cai para a rendição "preview" do Drive; só então o estado de erro. `kind: "outro"` e falhas de mídia mostram o cartão de indisponível (ícone `file-question` + nome + motivo, `role="img"` com `aria-label`). Reusado na aba Layouts, no portal do cliente e dentro do Lightbox.

**Já define `max-h-full max-w-full`** e concatena o `className` recebido. Não mande outra restrição de tamanho por cima: `cn()` é join puro (ver [`ui-guidelines.md`](ui-guidelines.md) §2.8), as duas classes convivem e quem vence depende da ordem do CSS gerado. Quem precisa mudar o tamanho ajusta o **wrapper**.

## EmojiPicker — `emoji-picker.tsx` (+ `emoji-picker-panel.tsx`)

Seletor de emoji do DS (gatilho `smile-plus` 40px + popover). Encapsula o **emoji-mart em modo vanilla** (decisão de projeto de 02/07/2026 — o `@emoji-mart/react` trava em React 18 e o `@atlaskit/emoji` foi descartado por depender de serviço remoto): dataset **local**, i18n pt, emojis **nativos** — a seleção devolve o caractere unicode. **Nenhum consumidor importa emoji-mart diretamente** — só este wrapper.

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `onSelect` | `(emoji: string) => void` | — | Recebe o caractere unicode; o popover fecha |
| `frequentes` | `readonly string[]` | `EMOJIS_FREQUENTES` | Linha de 6 atalhos de 1 clique acima do painel |
| `disabled` | `boolean` | `false` | — |
| `triggerLabel` | `string` | `"Adicionar reação"` | Rótulo acessível do gatilho |
| `align` | `"start" \| "end"` | `start` | Alinhamento horizontal do popover em relação ao gatilho |
| `triggerClassName` | `string` | — | Substitui o estilo do gatilho para casar com o consumidor |

Comportamento: painel completo (busca/categorias/tom de pele) carregado **sob demanda** via `next/dynamic` (`ssr: false`, skeleton com spinner) — fora do bundle inicial do board; um ErrorBoundary degrada para só os atalhos frequentes se o carregamento falhar (**reagir nunca quebra**). Portal em `document.body` (z-[60], `popoverPos` com flip/clamp, reposiciona em scroll/resize); Esc fecha e devolve o foco ao gatilho. Tema segue a classe `dark` do documento (o toggle do Tasks, não o SO), observada via `MutationObserver`.

`emoji-picker-panel.tsx` (interno, default export): instancia o `Picker` do core do emoji-mart via `parent` (shadow DOM próprio — estilos não vazam), `set: "native"`, grade fixa de 7 colunas, tom de pele junto à busca, linha de frequentes do picker desligada (a nossa fica acima).

---

## Toast — `toast.tsx` + `useToast`

Feedback transitório, não bloqueante. **Nunca instanciar direto** — disparar via `useToast()` (`lib/hooks/use-toast`):

```tsx
const toast = useToast();
toast.success("Cliente salvo.");
toast.info("Link copiado.");
toast.warning("Verifique a conexão.");
toast.success("Lançamento arquivado.", { action: { label: "Desfazer", onClick: undo } });
```

API (`ToastApi`): `success` / `info` / `warning` / `show({ message, variant, ... })` — todos retornam o `id` — e `dismiss(id)`. Opções por chamada: `duration` (ms, default 4000) e `action` (`{ label, onClick }`).

Visual de marca: fundo **`--brand-ink` fixo** nos dois temas, ícone/acentos em amarelo, mensagem 13px em `--brand-on-ink`. A variante muda **só o ícone** (`check-circle-2` / `info` / `alert-triangle`). Posição: topo central, offset 76px, z-[100], `aria-live="polite"` + `role="status"`, entrada/saída via preset `toast`.

Comportamento: auto-dismiss **4s**, pausa em hover/foco (o tempo restante é preservado), fila máx. **3** (descarta o mais antigo), botão de dispensar 40px. **Undo opcional** via `action` — para ações reversíveis, execute na hora e ofereça desfazer (em vez de confirmar antes); irreversíveis continuam no `ConfirmDialog`.

> [!CAUTION]
> **Erro de submit não usa toast** — vai para `FormErrorBanner` inline. Requer `ToastProvider` no shell autenticado.

## Fab — `fab.tsx`

Entrada **única** de criação do shell autenticado (telas não repetem botões "Novo X").

| Prop | Tipo | Descrição |
|---|---|---|
| `principal` | `FabItem` | Primeira criação permitida (botão amarelo 56px) |
| `secundarias` | `FabItem[]` | Atalhos de 44px revelados no hover/foco/toque |

`FabItem = { key, label, icon, onClick }`. Conjunto estático (ordem em `fab-actions.ts`): Criar demanda → Criar atividade → Criar projeto, filtrado por RBAC (sem permissão alguma, não renderiza). Desktop: clique no principal cria direto, dial no hover (o rótulo do principal aparece ao expandir); mobile (`hover: none`): toque abre o dial com a principal como primeiro item. **Arrastável** (posição em `localStorage`, limitada à viewport, respeita `safe-area-inset`; arraste fecha o dial e suprime o clique). Acessível: alvo ≥ 44px, `aria-haspopup`/`aria-expanded`, setas ↑/↓, Esc, animação suprimida sob `prefers-reduced-motion`.

## DigitandoIndicador — `digitando-indicador.tsx`

Linha "<nome> está digitando…" da presença efêmera, junto à thread de comentários. Props: `nomes: string[]`, `className`. Renderiza `null` com a lista vazia — **some sozinha** quando o chamador expira os sinais (~5s após o último). Vários nomes são unidos com `Intl.ListFormat` pt-BR ("A e B estão digitando…"). Três pontos pulsam em `--premium-silver` (`motion-safe:animate-pulse`); `aria-live="polite"` anuncia sem roubar o foco.

---

## AccordionItem — `accordion.tsx`

Bloco colapsável **controlado pelo pai** (`open`/`onToggle`) — permite regras como "só o mais recente expandido" (aba Layouts).

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `ReactNode` | Dentro do gatilho |
| `meta` / `actions` | `ReactNode` | Contagem/selo e ações — **fora** do `<button>` (HTML válido) |
| `open` / `onToggle` | — | Controlado |
| `className` | `string` | — |

Gatilho `<button aria-expanded aria-controls>` ≥ 44px com chevron que rotaciona 180°; o corpo monta/desmonta com transição de altura via **`Expansivel`**. Cabeçalho `--premium-paper`, moldura `--premium-mist`.

## Expansivel — `expansivel.tsx`

Primitivo de recolher/expandir **altura** com transição suave (`height: 0 ↔ auto` + opacity, ~200ms, curva `--ease`), via `AnimatePresence` — anima também o recolhimento antes do desmonte. Props: `open`, `children`, `id?`, `className?`. Usado por accordion, raias do Kanban e árvore de docs. `height` não é transform, então a duração é zerada manualmente sob `prefers-reduced-motion`; o `overflow` só recorta durante o trânsito (expandido e parado fica `visible`, para não cortar sombras de card, anel de foco ou colunas com rolagem horizontal).

## TextoExpansivel — `texto-expansivel.tsx`

Colapsa qualquer conteúdo (texto plano ou HTML rico) a uma prévia de altura limitada com fade e botão "ver mais"/"ver menos" — exibido **apenas quando o conteúdo realmente transborda** (mede `scrollHeight` contra a altura da prévia, recalculando via `ResizeObserver`; medir em px funciona igual em `whitespace-pre-wrap` e no `.md-view` multi-bloco).

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `children` | `ReactNode` | — | Conteúdo colapsável |
| `alturaRecolhida` | `number` | `140` | Altura máxima (px) da prévia |
| `fadeColor` | `string` | `var(--c-surface)` | Cor de fundo do gradiente de fade (token, sem hex) |
| `expandirAoFocar` | `boolean` | `false` | Expande quando algo dentro recebe foco — necessário com conteúdo editável (ex.: RichEditor da descrição) |
| `acoes` | `ReactNode` | — | Ações do consumidor na mesma linha do controle (ex.: "Salvar"); com elas a linha aparece mesmo sem transbordo |
| `className` | `string` | — | — |

Transição de altura via Motion (~200ms; instantânea sob `prefers-reduced-motion`); expandido termina em altura `auto` (conteúdo editável cresce livre); `aria-expanded`/`aria-controls` no botão.

## EmptyState — `empty-state.tsx`

Estado vazio centralizado: `icon` (38px `--premium-silver`), `title` (15/700 steel), `description` (12.5 gray, máx. 300px), `action` (ghost sm opcional). Microcopy: ação positiva + próximo passo ("Nenhuma demanda hoje. Que tal revisar a fila de aprovações?"). Para drop areas: borda `2px dashed var(--premium-mist)`.

## CodeBlock — `code-block.tsx`

Bloco de código com realce e copiar, usado em `/docs`.

| Prop | Tipo | Default |
|---|---|---|
| `code` | `string` | — (conteúdo bruto — é o que vai à área de transferência) |
| `language` | `"bash" \| "json" \| "javascript" \| "text"` | `text` |
| `label` | `string` | rótulo por linguagem ("curl", "JSON", "JavaScript", "Código") |

Realce por tokenizador leve próprio (`code-highlight.ts`, sem dependência) emitindo classes `.tok-*` que apontam para os tokens `--code-*`. Botão copiar 40px com micro-animação Copy → Check e `toast.success("Copiado.")` (falha → `toast.warning` sem perder conteúdo) — requer `ToastProvider`. `<pre>` com rolagem horizontal fina (`.code-scroll`), `whitespace-pre`.

## code-highlight — `code-highlight.ts`

Utilitário de suporte do CodeBlock: `tokenize(code, lang)` devolve `CodeToken[]` (`{ cls: "tok-*" | null, text }`) por regras de regex sticky para `bash`, `json` e `javascript` (`text` = sem realce). Retorna **dados, nunca HTML** — o componente renderiza cada token como texto, o que elimina risco de injeção. As cores dos `.tok-*` vêm dos tokens de code theme em `globals.css` (sem hex no componente).

## RichEditor — `rich-editor.tsx`

Editor rico único do sistema (Tiptap + Markdown GFM, client-only/SSR-safe via `immediatelyRender: false`).

| Prop | Tipo | Descrição |
|---|---|---|
| `value` / `onChange` | `string` / `(markdown) => void` | Lê e escreve **Markdown** |
| `label`, `placeholder`, `error`, `onBlur`, `id`, `className` | — | Como nos demais campos |
| `extraExtensions` | `AnyExtension[]` | Extensões Tiptap adicionais (ex.: menção `@` do comentário do card); desligado por padrão |
| `autoFocus` | `boolean` | Foca o editor ao montar (resposta / pré-preenchido) |
| `bare` | `boolean` | "Sem casca": remove borda/raio/realce de foco para se fundir a um contêiner pai que já é a caixa (ex.: composer de comentário); o divisor da toolbar fica |
| `onImageFiles` | `(files: File[]) => void` | Colar/soltar imagem **delegada** ao consumidor (ex.: comentário → lista de anexos), sem inserir no corpo |
| `uploadImage` | `(file: File) => Promise<string \| null>` | Sobe cada imagem e a **incorpora inline** como `![](url)` (ex.: briefing), com indicador "Enviando imagem…" — só a URL final entra no documento (nunca blob temporário). Sem nenhuma das duas, a imagem colada é ignorada |

Toolbar: bold, italic, h2/h3, listas, citação, código, tabela, link — o link abre um **dialog próprio** (substitui `window.prompt`; Esc cancela, Enter aplica, botão "Remover link"). Sublinhado desabilitado (não existe em Markdown puro).

Comportamento de links dentro do editor: caminho do Google Drive colado vira link `drive://` (clique único **copia** o caminho remontado para o SO do usuário; duplo clique entra em edição); link externo (`http/https/mailto/tel`) — clique único **abre em nova aba**, duplo clique edita; link **online** do Drive exibe a barra fixa de ações (`DriveLinkActions`) no hover/foco/clique, que persiste até clique fora/Esc/outro link. Links programáticos são inseridos com um espaço sem marca depois (o mark é inclusivo na borda — sem isso o próximo texto seria absorvido). **Nunca escrever atributos no DOM do editor** (o `title` do mark link é absorvido pelo documento e corrompe a digitação) — rótulos de hover ficam no modo leitura.

**Regra**: todo campo de texto longo nasce com ele (não `<textarea>`); em formulários por `FormData`, espelhe o valor em `<input type="hidden">`.

## MarkdownView — `markdown-view.tsx`

Renderização somente leitura do Markdown salvo: `renderMarkdownSafe` (`marked` GFM + `DOMPurify`, com esquema `drive:` permitido), classe `.md-view` com a tipografia do DS. Par de leitura do RichEditor. Props: `markdown`, `className`.

Interações: trechos `drive://` viram alvos de "copiar caminho" (clique/Enter/Espaço copiam o caminho remontado para o SO, com `title`/`aria-label` anunciando o destino); links externos abrem em nova aba (via renderer seguro); links **online** do Drive mostram a barra fixa `DriveLinkActions` no hover/foco/clique único (sem navegar — abrir fica no botão da barra), fechada por clique fora/Esc.

## DriveLinkActions — `drive-online-link.tsx`

Barra de ações de um link online do Google Drive: **dois botões redondos de 40px** — copiar o caminho do sistema (par `--c-emphasis`, com spinner/estado "Copiado" dentro dele) e abrir em nova aba (superfície clara com borda). Props: `href`, `tooltipSide` (`top` default), `className`.

A resolução do caminho (server action `resolverCaminhoDrive`) dispara em **prefetch na montagem** e é memoizada por URL na sessão (`resolveDrivePathCached`, exportada): uma chamada em voo por URL, falhas seguram novas tentativas por 30s. Se a resolução falhar (sem acesso / não configurado / erro), o botão de copiar é **omitido** — degradação graciosa, sem toast. O caminho copiado é remontado para o SO/prefixo do usuário (`useDrivePrefs().remount`). Também exporta `posicaoBarraDrive(anchor, wrap)` — posição da barra ancorada ao canto superior direito do link (último client rect), clampada ao wrapper, abaixo do link quando não há espaço acima — usada por RichEditor e MarkdownView.

## DrivePrefsProvider — `drive-prefs-context.tsx`

Contexto de suporte às preferências de caminho do Drive. `DrivePrefsProvider` recebe `initial?: DrivePrefs` (SO + prefixo configurados pelo usuário) e detecta o SO do navegador após a hidratação. `useDrivePrefs()` devolve `{ os, prefix, configured, osMismatch, remount(canonical) }` — `remount` converte o caminho canônico para o SO/prefixo do usuário. Fora do provider (testes, portal público) o hook devolve um fallback seguro (`remount` = identidade).

---

## BarChart — `bar-chart.tsx`

Barras agrupadas em SVG próprio (sem lib), com linha sobreposta opcional de escala própria (ex.: saldo acumulado — suporta negativos). Entrada animada: as barras crescem da base (`scaleY` escalonado; neutralizado sob reduced-motion).

| Prop | Tipo | Descrição |
|---|---|---|
| `categorias` | `string[]` | Eixo X |
| `series` | `{ label, cor, valores }[]` | `cor` = **token** (`"var(--success)"`), nunca hex |
| `linha` | `{ label, cor, valores }` | Linha sobreposta opcional |
| `formatarValor` | `(v) => string` | Eixo/tooltips — default `moedaCompacta`; gráficos de contagem passam um formatador de inteiros |
| `descricao` | `string` | `aria-label` + `<title>` |
| `altura` | `number` | default 220 |

Largura acompanha o container (ResizeObserver); abaixo do mínimo legível (`max(480, categorias × 72)`), entra scroll horizontal. Grid `--premium-mist`, texto `--premium-gray`. **A tabela adjacente é a fonte completa dos dados** — o gráfico é resumo visual, nunca a única fonte.

## PieChart — `pie-chart.tsx`

Pizza/rosca em SVG próprio com furo central exibindo o total; retorna `null` com total ≤ 0. Props: `dados: { label, valor }[]`, `descricao`, `tamanho` (168), `formatarValor` (default `moedaCompacta`). Paleta categórica por tokens (`--violet`, `--teal`, `--info`, `--warning`, `--success`, `--danger`, `--slate`, `--amber`). Fatias revelam com fade escalonado. `<title>` por fatia; legenda com valor + % é a fonte completa.

## LineChart — `line-chart.tsx`

Gráfico de linha em SVG próprio para **séries temporais** (ex.: throughput) — mesmo padrão dos outros charts: largura via ResizeObserver com scroll abaixo do mínimo (`max(480, pontos × 56)`), `role="img"` + descrição, cores/grade só por token (linha em `--premium-ink`). Props: `pontos: { label, valor }[]`, `descricao`, `altura` (220), `formatarValor` (default inteiro). Entrada: a linha se **traça** (`pathLength`) e os pontos surgem depois; durações zeradas sob reduced-motion. Tooltips (`<title>`) e tabela adjacente são a fonte completa.

## BarraProgresso — `barra-progresso.tsx`

Barra de progresso **determinada** com preenchimento que cresce da esquerda na entrada (`scaleX` — neutralizado pelo `MotionConfig`). Props: `pct` (0–100, clampado), `background` (CSS do preenchimento — ex.: gradiente por token), `altura` (classe, default `h-2`), `trackClassName`, `className`. Decorativa (`aria-hidden`) — o valor textual fica no consumidor. Client leve, renderizável a partir de server components (recebe só números/strings).

## Contador — `contador.tsx`

Número com contagem crescente animada (`useCountUp`) para stat cards. Props: `valor`, `format` (preserva moeda/%/compacto), `duracao`, `className`. Sob `prefers-reduced-motion` mostra o valor final direto.

## MotionProvider — `motion-provider.tsx`

Provider único de animação do DS: `LazyMotion features={domAnimation} strict` (só `m.*` — o `motion.*` completo lança erro) + `MotionConfig reducedMotion="user"` (respeita `prefers-reduced-motion` por construção) + transição default com a curva `--ease`. Montado nos três shells (app interno, portal do cliente, docs); componentes `m.*` em portal (SlideOver etc.) continuam cobertos — o contexto atravessa `createPortal`.

---

## Padrões compostos do shell (`components/layout/`)

| Componente | Papel |
|---|---|
| `sidebar.tsx` | Sidebar 248px `--c-sidebar` (sempre escura); item ativo = fundo elevado + texto amarelo + **borda esquerda 3px amarela**; seções 9px/`.22em`; cadeado em itens admin; colapsável a 64px via `data-sidebar-collapsed` em `<html>` (aplicado pré-hidratação); toggle aparece no hover/foco; tooltips só colapsada |
| `topbar.tsx` | `min-h-[88px]` translúcida (`/80` + blur 12px + saturate 140%); conteúdo: [eyebrow + título + sub] ← → [busca pill ⌘K 280px] [tema] [sino] [avatar] |
| `theme-toggle.tsx` | `moon`/`sun`; alterna `.dark` + grava `premium-theme` (ver [`dark-mode.md`](dark-mode.md)) |
| `notificacoes-bell.tsx` | Icon-btn com `.dot` 8px vermelho quando há não-lidas; abre slide-over |
| `search-dialog.tsx` | Busca global `⌘K` |
| `fab-shell.tsx` | Monta o FAB + slide-overs de criação autocontidos |
| `page-header-context.tsx` | Contexto que leva título/eyebrow/sub/breadcrumb do `PageHeader` à topbar |
| `realtime-connection-provider.tsx` | Conexão realtime única do shell (presença/eventos) — fonte dos `PresenteRealtime` consumidos por `PresencaAvatares`/`DigitandoIndicador` |

Padrões de demandas com identidade própria (fora de `ui/`, documentados no [`ui-guidelines.md`](ui-guidelines.md) §4.7, §4.13–4.14): **workflow timeline/builder**, **comentários com menção `@`** (chip info, persistência `@[colaboradorId:Nome]`), **histórico vertical** (bolinha 30px em cor semântica + linha de 2px).

## Padrões próprios reconhecidos (auditoria 2026-08-04)

Casos que **não** devem ser migrados para os primitivos — são bespoke por decisão, não por descuido (todos reconferidos no código em 2026-08-04):

| Caso | Justificativa |
|---|---|
| Inputs de horas/minutos do `tempo-manual-dialog` | Padrão **entrada rápida** (§4.24): largura fixa 76px, 15px tabular-nums — métrica própria |
| CTAs grandes do portal (gate de e-mail e aprovação: 52px, sentence-case) | Identidade do portal cliente mobile-first; usam **tokens** corretamente, mas não a tipografia uppercase do `Button` |
| Paletas hex `STAGE_COLORS` / `COLORS` de departamento | São **dados persistidos** (cor gravada no banco), não estilo de componente |
| Campos de busca com lupa dentro de pickers/dropdowns | Padrão próprio compacto (ColaboradorPicker, Select, MultiSelect, FilterBar, docs-search) |
| Botões redondos minimalistas do workflow (concluir/apagar/mover) | §4.7 — identidade da timeline |
| "Novo lançamento" como ação de contexto do financeiro | O conjunto do FAB é **estático** (demanda/atividade/projeto); criação de lançamento vive na zona de contexto da tela |
| Superfícies **sempre escuras** (gate do portal, header de aprovação, login, toast, tooltip) | Usam `--brand-ink`/`--c-sidebar-*` — **nunca** `--premium-ink` como fundo (ele vira claro no escuro) |
| Toggle-chips com estado ativo invertido | Usam `--c-emphasis`/`--c-on-emphasis` (invertem certo no escuro); o chip toggle da FilterBar e o `ColumnSortToggle` usam `--brand-ink` fixo para o ícone amarelo ler |
