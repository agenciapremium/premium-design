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
- **Estados:** skeleton no carregamento, "Nenhum colaborador encontrado." no vazio, erro inline (nunca toast).
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
