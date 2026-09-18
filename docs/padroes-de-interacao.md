# Padrões de interação

Comportamentos transversais do produto — como as telas se organizam, navegam e respondem.

## Layout global

```
┌──────────────┬────────────────────────────────────────────────┐
│              │ Topbar 88px (eyebrow + título + sub | busca ⌘K │
│   Sidebar    │           | tema | sino | avatar)               │
│   248px      ├────────────────────────────────────────────────┤
│ (colapsável  │ [Breadcrumb — só detalhe com hierarquia]       │
│  a 64px)     │ PageHeader.actions (quando houver)             │
│              │ FilterBar: filtros ◄──► contexto · views · ★   │
│              │ Conteúdo (cards, kanban, tabela, detalhe)      │
└──────────────┴────────────────────────────────────────────────┘
                                                      FAB (canto inferior direito)
```

- O título da tela vive na **topbar** (via `PageHeader` + contexto), não no corpo.
- A **criação não vive na topbar nem na FilterBar** — entrada única é o FAB.
- O FAB é um **speed-dial**: no desktop, o botão amarelo cria direto e as ações secundárias se revelam no hover/foco; no toque, tocar abre o dial (a principal entra como primeiro item). É arrastável — a posição persiste por usuário.
- Detalhe complexo: grid `1fr 320px` (conteúdo + meta-cards), 1 coluna < 1100px.

## Barra de ações da tela (FilterBar)

Ordem fixa, válida para **toda** tela: **FILTROS (esquerda) ► CONTEXTO · VIEWS · FAVORITO (direita)**. Zonas ausentes não renderizam, mas a ordem nunca muda. Nenhuma tela dispõe esses controles fora da barra. Estado dos filtros sempre em `searchParams` (URL compartilhável).

- **Linha única** por padrão: os filtros rolam horizontalmente; os dropdowns abrem em portal (não são cortados pela rolagem). Opt-out `permitirQuebra` volta ao `flex-wrap`.
- **Busca por palavra-chave colapsável**: lupa que expande o campo ao clicar/focar (debounce de 300ms para a URL); permanece aberta enquanto há termo. Opt-out `buscaSempreAberta`.
- Listas longas de opções (≥ 8) ganham **busca** automática no dropdown e mostram só as 6 primeiras sem termo — ao digitar, a busca cobre a lista inteira.
- Com filtro ativo, aparece o botão amarelo **Limpar filtros** ao fim da zona de filtros.
- Com `telaKey`, os filtros **persistem por usuário**: a tela restaura o último filtro salvo quando a URL não traz filtros; "Limpar filtros" apaga também o persistido.
- Qualquer mudança de filtro ou visão **reseta a paginação** (`?pagina=` sai da URL).

## Toggle de visualização

Kanban / Lista / Tabela / Calendário via tabs na zona de views; estado em `?view=` (ou outro `viewParam`, ex.: `?tab` no detalhe de projeto). A pílula ativa desliza até a aba escolhida e a troca de conteúdo usa View Transitions quando o navegador suporta. Para abas que vivem **fora** da barra (ex.: "Todas / Para hoje / Atrasadas" da visão Tabela, em `?aba=`; abas de Lançamentos), use `SegmentedTabs`/`ViewTabsPill` — mesma implementação de estado em searchParam, mesmo visual e mesmo reset de página.

## List → detalhe

| Situação | Padrão |
|---|---|
| Edição/visualização rápida | Card/linha clicável (extensão **inteira**) abre **slide-over** |
| Detalhe com múltiplas abas (Briefing, Texto, Layouts, Comentários…) | **Rota dedicada** (`/demandas/[id]`) |
| Voltar | **Breadcrumb** acima do page-head — não existe botão "Voltar" |

## Ordenação

- Estado em `?sort=campo-direção` na URL (ex.: `entrega-desc`); ausência do param = ordem natural (a de carregamento). Um clique cicla **natural → ↑ → ↓ → natural**.
- **Tabela**: cabeçalho de coluna clicável (`SortableTh`, com `aria-sort`), ícone ▲/▼ no header ativo.
- **Kanban**: toggle de ícone no header da coluna (`ColumnSortToggle`) — o campo é fixo por kanban, então cada coluna guarda só a direção, em param próprio, e ordena apenas a própria coluna.
- A ordenação por `?sort=` viaja entre as visões (kanban ↔ tabela); mudar a ordenação reseta a paginação.

## Paginação e listas longas

- **Tabelas/listas**: `Pagination` — "Anterior · Página X de Y · Próxima", estado em `?pagina=` preservando filtros e ordenação; oculta com uma página ou menos; mudar filtro, visão ou ordenação volta à página 1. O `param` permite paginar listas independentes na mesma tela.
- **Kanban (scroll infinito)**: `ColunaInfinita` — a coluna renderiza um lote inicial e carrega mais conforme a rolagem (sentinela + indicador "Carregando mais…"); a janela reinicia ao mudar filtro/ordenação. O badge de total da coluna segue refletindo a lista completa.

## Mídia em tela cheia (Lightbox)

Clicar numa mídia abre o `Lightbox`: overlay full-viewport com fundo escuro fixo nos **dois** temas, nome do arquivo + contador "X / Y" no topo. Imagem tem zoom (botões ampliar/reduzir/restaurar, 1–4x) e arrasto quando ampliada; vídeo/áudio usam o leitor próprio. Setas `←`/`→` navegam **apenas** entre os materiais do layout atual; `Esc`, scrim ou botão fecham, devolvendo o foco ao gatilho.

**A mídia cabe inteira, sempre** — inclusive vídeo vertical de reels. Quem garante isso é o wrapper com altura definida (`h-full`), não uma classe de tamanho passada ao leitor: `max-height` percentual contra pai indefinido vira `none`, e o palco corta o excedente. Detalhe da armadilha em [`ui-guidelines.md`](ui-guidelines.md) §4.22 e §2.8.

## Aprovação / reprovação

- Aprovar = `btn-primary` (amarelo). Reprovar = `btn-ghost` com texto `--danger`.
- Reprovar **sempre exige comentário** (gera etapa AJUSTE no workflow).
- Concluir etapa de aprovação abre a decisão Aprovar / Pedir ajuste.

## Seletor de pessoas (busca + badges)

Para escolher **uma ou várias pessoas**, use o `PessoasPicker` (`pessoas-picker.tsx`) — **não** use chips de toggle (lista tudo de uma vez, sem busca) nem `<select>` nativo.

- **Fluxo:** clicar no campo → abre popover com **busca** (ignora acentos) → escolher → vira **badge** (avatar + nome) no campo.
- **Multi** (`multiple`): popover fica aberto, itens selecionados ganham `check`, cada escolhido é um badge removível; `minSelecionados={1}` garante "ao menos um" (ex.: responsáveis da atividade).
- **Single:** escolhe um e fecha; mostra um badge no campo. Substitui o select de responsável em formulários.
- **Seções:** com contexto de projeto, separe "Equipe do projeto" / "Outros colaboradores" (`grupos`); sem projeto, lista única (`colaboradores`).
- **Grupo revelado por busca** (`revelarSoComBusca` no grupo): o grupo só é desenhado quando há termo digitado, e no lugar dele fica a dica "Outros colaboradores aparecem ao buscar pelo nome." Use quando o caso comum é uma lista curta e a longa é exceção — ex.: responsáveis do ajuste, onde abrir com a agência inteira enterrava a equipe do projeto. **Quem já está selecionado continua visível** mesmo sem busca: em hosts que usam o `PessoasSearchPanel` inline (sem badges), a lista é a única superfície da seleção, e um selecionado escondido fica impossível de desmarcar.
- **Estados:** skeleton no carregamento, "Nenhum colaborador encontrado." no vazio, erro inline (nunca toast). Com um grupo escondido atrás da busca e o campo de busca vazio, o vazio orienta ("Busque pelo nome para encontrar um colaborador.") em vez de negar que exista alguém.
- **Onde se aplica:** responsáveis da atividade (multi); responsável de etapa/ajuste no workflow (single, via `PessoasSearchPanel`); responsável do projeto, "Para" de kudo/feedback, colaborador de 1:1 e de meta (single). Filtros de listagem (FilterBar) e menções `@` seguem padrões próprios.

## Batch actions

Com seleção múltipla ativa em tabela (checkbox na primeira coluna), **toolbar fixa no rodapé** mostra contagem e ações; confirmação via `ConfirmDialog`.

## Presença em tempo real

- **Quem está vendo**: pilha de avatares (`PresencaAvatares`) no cabeçalho do detalhe (card do quadro, demanda) — até 4 avatares + sufixo "+k", nomes por tooltip acessível. Não renderiza **nada** quando vazia ou quando a presença está indisponível — degrada em silêncio, nunca mostra erro.
- **Digitação**: linha "_fulano está digitando…_" (`DigitandoIndicador`) junto à thread de comentários; some sozinha ~5s após o último sinal; anuncia por `aria-live="polite"` sem roubar o foco; os três pontos respeitam `prefers-reduced-motion`.
- Comportamento: uma única conexão de tempo real por sessão do navegador; abas do mesmo usuário são deduplicadas e o próprio usuário não aparece na própria pilha.

## Feedback — qual camada usar

| Situação | Camada |
|---|---|
| Ação concluída (salvo, copiado, arquivado) | `toast.success/info` — 4s, não bloqueante |
| Ação reversível | Toast com `action: { label: "Desfazer" }` — executa já e oferece undo |
| Ação destrutiva irreversível | `ConfirmDialog` (variant `danger`) **antes** de executar |
| Erro de submit/ação | `FormErrorBanner` inline (nunca toast) |
| Coleta rápida de um dado | Entrada rápida (popover / dialog compacto) |
| Salvamento automático | Barra indeterminada (`SlideOver loading` / `AutoSaveBar`) |
| Aviso que exige ação e não pode se perder (novo ajuste na peça) | Alerta fixo — fica até a pessoa abrir o item |

- **Toast**: fundo escuro de marca com acento amarelo nos dois temas; variantes `success`/`info`/`warning` mudam só o ícone — **não existe toast de erro**. No máximo 3 empilhados; o cronômetro pausa no hover/foco.
- **ConfirmDialog**: além do destrutivo (`variant="danger"`), atende confirmações informativas (`tone="neutral"`), aceita um campo (`children`, com `confirmDisabled` enquanto inválido) e uma ação secundária destrutiva entre Cancelar e a primária; falha aparece em banner inline (`error`) mantendo o diálogo aberto.

> [!CAUTION]
> Proibido falar com o usuário por `window.alert/confirm/prompt` — destoam da marca, ignoram o tema e bloqueiam a UI. Garantido por lint (`no-alert` / `no-restricted-globals`).

## Estados de carregamento

- **Skeletons** (`--premium-bone`, shimmer) para listas e cards — estrutura da tela no `loading.tsx` da rota.
- Spinner **só** dentro de botão durante submit.
- Evitar spinner full-page.

## Estados vazios

`EmptyState` com microcopy de ação positiva + próximo passo. Drop areas com borda tracejada. Coluna vazia do kanban em altura total mostra hint "Solte aqui.".

## Erros de rota

`error.tsx` global com CTA "Recarregar" + link "Voltar para o início".

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `⌘K` / `Ctrl+K` | Busca global |
| `Esc` | Fecha overlay do topo da pilha |
| `Enter` | Confirma diálogo com primária em foco; ativa linha de tabela |
| `↑` / `↓` | Navega opções em select/dropdown aberto (`Enter` escolhe) |
| `←` / `→` | Material anterior/próximo no lightbox |
| `t` `f` | Abre ou fecha a gaveta de ferramentas |
| `t` + letra | Abre a gaveta já numa ferramenta (`t` `c` Caminho do Drive, `t` `r` Tempo de roteiro, `t` `l` Contador de caracteres, `t` `u` Dias úteis) |

## Gaveta de ferramentas e cartão de ferramenta

Utilitário de apoio (uma conta, uma conversão, uma contagem) não vira tela no
menu: vira card numa **gaveta lateral** que abre de qualquer lugar, pelo botão
"Ferramentas" da topbar (à esquerda do sino) ou por `t` `f`. O valor de uma
ferramenta dessas está em usá-la sem sair do que se está fazendo, e uma tela
própria cobra exatamente esse preço.

**A gaveta não é modal.** Painel `role="complementary"` à direita, em `z-40`:
acima da topbar e dos popovers de página, abaixo do slide-over e do scrim dele.
Sem scrim, sem `aria-modal`, sem prender o `Tab` e sem travar a rolagem acima de
768px, então a página atrás continua rolando e recebendo cliques. `Esc` fecha
apenas quando nenhum modal está aberto; com um modal por cima, quem responde ao
`Esc` continua sendo o topo da pilha. Abaixo de 768px ela cobre a tela, ganha
"Fechar" no cabeçalho e trava a rolagem do corpo.

**Fechada, ela continua montada** (`hidden` + `inert`). É isso que faz o texto
digitado, as escolhas e o resultado sobreviverem a fechar, reabrir e navegar
entre telas. A recarga da página zera, e está declarado que zera.

**Cartão de ferramenta.** Composição sobre `Card`, sem token novo: cabeçalho de
44px com alça de arrastar (`GripVertical`, rótulo acessível), ícone, título em
13px semibold, botão de recolher (`ChevronDown` girado, `aria-expanded`) e menu
`MoreHorizontal` com "Mover para cima", "Mover para baixo" e "Ocultar". O menu
é a alternativa por teclado ao arraste, e não fecha ao mover. Corpo com 16px de
respiro e `Skeleton` de três linhas enquanto o componente carrega. Recolhido,
sobra o cabeçalho; o corpo fica `hidden`, nunca desmontado.

**A personalização é da pessoa.** Ordem, recolhido e oculto são gravados sozinhos
nas preferências do colaborador e voltam em qualquer dispositivo; o rodapé
oferece "Adicionar ferramenta" (as ocultas, com a descrição de cada uma) e
"Restaurar padrão" (com confirmação). Ferramenta nova do sistema entra visível ao
fim da pilha, sem apagar a ordem que a pessoa já tinha.

**Ferramenta nova não mexe na gaveta.** O catálogo é declarativo (no Tasks,
`src/lib/ferramentas/registro.ts`): id, título, descrição de uma linha, ícone,
teclas e componente sob demanda. A gaveta, o menu de adicionar e o registro de
atalhos leem de lá. Implementação de referência: `src/components/ferramentas/`
no Tasks.

## Alerta fixo

Aviso que **fica na tela até a pessoa agir**: some só quando ela abre o item a que
se refere. É a camada mais agressiva de feedback e existe para o caso em que um
aviso perdido atrasa uma entrega (no Tasks: novo ajuste na peça, para quem faz o
ajuste e para quem recebe a peça de volta). Toast some sozinho, callout é
estático no conteúdo e o sino é passivo; nenhum dos três cobre esse caso.

**Onde fica.** Canto inferior esquerdo da área de conteúdo, ao lado da sidebar
(acompanha a largura dela, completa ou recolhida), em `z-40`: abaixo do
slide-over e de diálogos, acima da topbar. O canto direito é do FAB e o topo é
dos toasts. Nunca sobe além da topbar. Abaixo de 768px ocupa a largura da tela
com 12px de margem, acima do FAB, com no máximo metade da altura. Some com o
drawer de navegação aberto, como o FAB.

**O card tem o mínimo de texto.** Fundo `--alert-solid`, texto
`--on-alert-solid`, raio `--r-lg`, altura mínima de 64px. Conteúdo: ícone que
identifica o tipo (num quadrado branco a 16%, piscando), o título do item em até
duas linhas e uma etiqueta curta dizendo por que **esta** pessoa foi avisada. Sem
rótulo de categoria, sem tempo relativo, sem "clique aqui" e **sem botão de
fechar**: o card inteiro é um `<button>` que abre o item. O nome acessível
carrega o que o texto visível omite (categoria, título, contexto, papel e a ação).

**Pilha e contador.** Vários alertas empilham com o mais novo em cima, todos no
mesmo formato. Abaixo deles fica um **contador fixo** ("7 ajustes") enquanto
houver alerta pendente, inclusive com um só: clicar minimiza os cards e deixa só
o contador (fundo `--alert-solid`); clicar de novo mostra. Aberto, o contador
usa `--c-surface` com borda e texto `--danger`. Alerta novo reabre a pilha
minimizada. Com muitos, a lista rola **sem barra aparente**, com degradê (máscara)
na borda que tem mais conteúdo e `overscroll-behavior: contain`; a folga em volta
da lista, que evita cortar a sombra dos cards, não bloqueia cliques.

**Movimento.** Entrada deslizando da esquerda só no card que acabou de chegar; o
ícone dos cards **e o do contador** piscam em `steps(2)` abaixo de 3 vezes por
segundo, enquanto houver alerta pendente, inclusive com a pilha minimizada: o
contador é a última marca na tela e continua chamando atenção. Sob
`prefers-reduced-motion`, nada anima, e esse é o único jeito de parar o piscar.
Por isso o padrão fica restrito a avisos que exigem ação e que somem quando a
pessoa age; o WCAG 2.2.2 pede pausa para o que pisca por mais de 5 segundos,
e aqui a "pausa" é resolver o aviso.

**Acessibilidade.** Foco visível em amarelo (`--yellow`) sobre o vermelho; o
contador tem `aria-expanded` e `aria-controls`; a chegada de alerta novo é
anunciada numa região `aria-live="polite"`, sem roubar o foco.

**Persistência e controle.** O alerta é registro no servidor por pessoa (não
estado de tela): sobrevive a navegação e recarga, e fechar em uma aba fecha nas
outras. Por ser agressivo, nasce com um interruptor geral em Configurações.
Implementação de referência: `src/components/layout/alertas-ajuste.tsx` no Tasks.

## Voz e microcopy

- **Títulos** descrevem a tela ("Minhas Demandas"); pessoa do verbo é "você".
- **Subtítulos** explicam o propósito em uma frase.
- **Botões**: verbo no infinitivo curto; evitar "OK"/"Sim".
- **Estados vazios**: ação positiva + próximo passo.
- **Erros**: o que aconteceu + o que fazer.
- **Datas**: relativas até 7 dias ("Hoje 14h", "Atrasada há 2 dias"); absolutas depois ("12 jun 2026").
- **Pluralização** correta; sem "(s)".
- Sem emoji em UI de produção; pt-BR sempre acentuado.

## Responsividade

| Breakpoint | Comportamento |
|---|---|
| 1100px | Grids de detalhe → 1 coluna |
| 768px | Sidebar → drawer; tabelas → cards empilhados; kanban volta à altura natural (página rola) |
| 640px | Busca da topbar → ícone |
| sempre | Kanban mantém scroll horizontal |

## Do / Don't

✅ Tokens semânticos sempre · reusar primitivos · estado em `searchParams` · slide-over para criar/editar · breadcrumb no detalhe · skeleton para loading · screenshots claro+escuro no PR.

❌ Hex direto · modal central novo · amarelo como texto em fundo claro · spinner full-page · emoji · sombra arbitrária · duplicar lógica do `workflow-engine` · janelas nativas do navegador.
