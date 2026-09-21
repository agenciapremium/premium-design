# Padrões de interação

Comportamentos transversais do produto — como as telas se organizam, navegam e respondem.

## Layout global

```
┌──────────────┬────────────────────────────────────────────────┐
│ Logo · 88px  │ Topbar 88px (eyebrow + título + sub | busca ⌘K │
│┄┄┄┄┄┄┄┄┄┄┄┄┄┄│           | tema | ferramentas | sino)         │
│   Sidebar    ├────────────────────────────────────────────────┤
│   248px      │ [Breadcrumb · só detalhe com hierarquia]       │
│ (colapsável  │ PageHeader.actions (quando houver)             │
│  a 64px)     │ FilterBar: filtros ◄──► contexto · views · ★   │
│              │ Conteúdo (cards, kanban, tabela, detalhe)      │
│   Usuário    │                                                │
└──────────────┴────────────────────────────────────────────────┘
                                                      FAB (canto inferior direito)
```

- O título da tela vive na **topbar** (via `PageHeader` + contexto), não no corpo.
- O conteúdo ocupa **100% da largura** ao lado da sidebar: sem `max-width` nem contêiner centralizado, e grades que dividem a sobra entre os itens em vez de deixar faixa vazia. Só a medida de leitura do texto corrido e o teto de 360px da coluna do kanban limitam largura ([`ui-guidelines.md`](ui-guidelines.md) §3.5).
- A faixa da logo, no topo da sidebar, tem a **mesma altura da topbar** (88px; 64px abaixo de 768px): logo e título na mesma linha. O usuário fica no rodapé da sidebar, não na topbar.
- A **criação não vive na topbar nem na FilterBar** — entrada única é o FAB.
- O FAB é um **speed-dial**: no desktop, o botão amarelo cria direto e as ações secundárias se revelam no hover/foco; no toque, tocar abre o dial (a principal entra como primeiro item). É arrastável — a posição persiste por usuário.
- Detalhe complexo: grid `1fr 320px` (conteúdo + meta-cards), 1 coluna < 1100px.
- Tudo o que é **da pessoa** vive na tela **Minha conta** (`/conta`): foto, dados pessoais, senha, notificações e preferências (tema, menu lateral recolhido, Caminhos do Drive), em seções ancoráveis (`#perfil`, `#dados-pessoais`, `#seguranca`, `#notificacoes`, `#preferencias`, `#sessao`). O identificador do usuário na sidebar abre um popover de quatro itens ("Minha conta", "Trocar de senha", que aponta para `/conta#seguranca`, "Atalhos de teclado", que abre o painel de atalhos, e "Sair"), nunca um formulário. **Configurações** (`/configuracoes`) é do **sistema**, agrupada em seções (Cadastros, Produção, Pessoas, Financeiro, Acessos e integrações) com busca por título e descrição.

## Barra de ações da tela (FilterBar)

Ordem fixa, válida para **toda** tela: **FILTROS (esquerda) ► CONTEXTO · VIEWS · FAVORITO (direita)**. Zonas ausentes não renderizam, mas a ordem nunca muda. Nenhuma tela dispõe esses controles fora da barra. Estado dos filtros sempre em `searchParams` (URL compartilhável).

- **Linha única** por padrão: os filtros rolam horizontalmente; os dropdowns abrem em portal (não são cortados pela rolagem). Opt-out `permitirQuebra` volta ao `flex-wrap`.
- **Busca por palavra-chave colapsável**: lupa que expande o campo ao clicar/focar (debounce de 300ms para a URL); permanece aberta enquanto há termo. Opt-out `buscaSempreAberta`.
- Listas longas de opções (≥ 8) ganham **busca** automática no dropdown e mostram só as 6 primeiras sem termo — ao digitar, a busca cobre a lista inteira.
- Com algum filtro ativo além da busca, aparece o botão amarelo **Limpar filtros** ao fim da zona de filtros, com o ícone de funil (`FunnelX`). Só com a busca ativa ele não aparece: o `X` da própria busca já limpa.
- Com `telaKey`, os filtros **persistem por usuário**: a tela restaura o último filtro salvo quando a URL não traz filtros; "Limpar filtros" apaga também o persistido.
- Com `telaKey`, a zona de contexto ganha o menu **Views** (`views-salvas-menu.tsx`): o recorte atual (filtros, visão e ordenação, sem a página) vira uma **view nomeada**, aplicável com um clique, renomeável, compartilhável por link e excluível com "Desfazer". Máximo de 10 por tela, nomes únicos, tudo privado do usuário (`preferencias.views[telaKey]`).
- **Precedência na abertura** (sem filtros na URL): view **padrão** da tela ► último filtro persistido ► estado padrão da tela. "Limpar filtros" apaga o persistido e **não** desmarca a padrão (a pessoa tira o padrão pelo menu).
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

- **Skeletons** (`--premium-bone`, pulso sob `motion-safe`) para listas e cards — estrutura da tela no `loading.tsx` da rota.
- Os blocos vêm de [`skeleton.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/skeleton.tsx): `SkeletonLinha`, `SkeletonCard`, `SkeletonTabela` e `SkeletonKanban`, todos `aria-hidden`.
- O grupo `(app)` tem um skeleton genérico (cabeçalho, três blocos, tabela de oito linhas) que cobre toda rota sem `loading.tsx` próprio; as telas de uso diário têm o seu, com a estrutura de cada uma.
- Spinner **só** dentro de botão durante submit (prop `loading` do `Button`).
- **Nenhum `loading.tsx` usa spinner de página inteira.** Um lint (`no-restricted-syntax` sobre `**/loading.tsx`) barra `animate-spin` nesses arquivos.

## Estados vazios

`EmptyState` com microcopy de ação positiva + próximo passo. Drop areas com borda tracejada. Coluna vazia do kanban em altura total mostra hint "Solte aqui.".

## Erros de rota

Nenhuma tela do produto cai na página padrão do framework, em nenhum estado.

- **Erro** — `error.tsx` em cada shell, todos finos sobre [`ErroRota`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/erro-rota.tsx): ícone, `h1` "Algo deu errado", texto de orientação, `Referência: <digest>` e as ações "Tentar de novo" (reexecuta o segmento) e "Voltar para o início". A mensagem da exceção **nunca** aparece em produção. Variante `app` dentro do layout autenticado (sidebar e topbar de pé, tema resolvido por token); variante `publico` nos shells externos (portal de aprovação, link do cliente, Portal Quadros, autenticação): fundo da marca com a logo, sem menu e sem dado interno.
- **Falha do layout raiz** — `app/global-error.tsx`, autocontido: renderiza o próprio `<html>`/`<body>`, importa o `globals.css` e aplica o tema salvo com o trecho anti-FOUC do layout raiz. Sem provider algum, porque tem de funcionar quando o layout que os monta falhou.
- **Não encontrada** — `app/(app)/not-found.tsx` (dentro do layout, com "Voltar para o início" e "Buscar", que abre a busca global) e `app/not-found.tsx` (pública, com a logo). Tela de detalhe que não acha o registro chama `notFound()` em vez de renderizar vazio.
- Monitoramento externo não entra aqui: o registro é o `console.error` mais o `digest`, que casa com o log do servidor.

## Atalhos de teclado

Todo atalho global mora em [`lib/atalhos.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/atalhos.ts) e é
resolvido por um único `keydown` no `window`, instalado pelo `AtalhosProvider`
(capability `atalhos-teclado`). Atalho novo entra no registro, nunca num efeito
próprio: é o registro que alimenta o painel `?` e as dicas em `kbd` do FAB e do
menu, e um atalho fora dele seria um atalho que ninguém descobre.

| Atalho | Ação |
|---|---|
| `⌘K` / `Ctrl+K` | Busca global |
| `?` | Painel "Atalhos de teclado" (lista só o que o usuário pode executar) |
| `Esc` | Fecha overlay do topo da pilha |
| `c` `d` / `c` `a` / `c` `p` / `c` `e` | Criar demanda / atividade / projeto / evento |
| `g` `d` / `g` `m` / `g` `a` | Ir para Dashboard / Minhas Demandas / Minhas Atividades |
| `g` `q` / `g` `p` / `g` `n` | Ir para Quadros / Gestão de Projetos / Notificações |
| `g` `e` / `g` `c` | Ir para Entregas / Configurações |
| `t` `f` | Abrir ou fechar a gaveta de ferramentas |
| `t` `c` / `t` `r` / `t` `l` / `t` `u` | Abrir a gaveta em Caminho do Drive / Tempo de roteiro / Contador de caracteres / Dias úteis |
| `Enter` | Confirma diálogo com primária em foco; ativa linha de tabela |
| `↑` / `↓` | Navega opções em select/dropdown aberto e resultados da busca global, atravessando os grupos (`Enter` escolhe) |
| `←` / `→` | Material anterior/próximo no lightbox |

Regras que valem para todas as sequências:

- **Sequência, não combinação.** Duas teclas em ordem, com até 800ms entre elas.
  Não colidem com o navegador e são o vocabulário de Gmail, GitHub e Linear.
- **Permissão é a mesma da interface.** Criar respeita o predicado da ação no
  FAB; navegar respeita a visibilidade do item no menu lateral
  ([`lib/nav/itens.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/nav/itens.ts)). Sem permissão, a tecla não
  faz nada e o atalho não aparece no painel.
- **Silêncio onde se digita.** Nada dispara com o foco em `input`, `textarea`,
  `select`, `[contenteditable]` ou dentro do Tiptap (`.ProseMirror`) e do
  BlockNote (`.bn-editor`), nem com um diálogo modal aberto.
- **O caractere manda, não a tecla física.** `?` é reconhecido pelo caractere
  produzido, então funciona igual em ABNT e em ANSI.

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
dos toasts. Nunca sobe além da topbar. A partir de 768px: 320px de largura, a
16px da sidebar e a 20px da base, com altura máxima de `100dvh` menos 124px.
Abaixo de 768px ocupa a largura da tela com 12px de margem, acima do FAB, com no
máximo metade da altura. Some com o drawer de navegação aberto, como o FAB.

**O card tem o mínimo de texto.** Fundo `--alert-solid`, texto
`--on-alert-solid`, raio `--r-lg`, sombra `--sh-md`, altura mínima de 64px.
Conteúdo: ícone que identifica o tipo (18px, num quadrado de 36px em
`--on-alert-solid` a 15%, piscando), o título do item em até duas linhas e uma
etiqueta curta, em pílula no mesmo branco a 15%, dizendo por que **esta** pessoa
foi avisada. Sem rótulo de categoria, sem tempo relativo, sem "clique aqui" e
**sem botão de fechar**: o card inteiro é um `<button>` que abre o item. O nome
acessível carrega o que o texto visível omite (categoria, título, contexto,
papel e a ação).

**Pilha e contador.** Vários alertas empilham com o mais novo em cima, todos no
mesmo formato. Abaixo deles fica um **contador fixo** ("7 ajustes") enquanto
houver alerta pendente, inclusive com um só: clicar minimiza os cards e deixa só
o contador (fundo `--alert-solid`); clicar de novo mostra. Aberto, o contador
usa `--c-surface` com borda e texto `--danger`. Alerta novo reabre a pilha
minimizada. Com muitos, a lista rola **sem barra aparente**, com degradê
(máscara) na borda que tem mais conteúdo e `overscroll-behavior: contain` (desde
a v0.10.0, o padrão compartilhado `css/patterns/pilha-rolagem.css`); a folga de
20px em volta da lista, que evita cortar a sombra dos cards, não bloqueia
cliques.

**Movimento.** Entrada deslizando da esquerda só no card que acabou de chegar; o
ícone dos cards **e o do contador** piscam em `steps(2)`, num ciclo de 1,1s
(abaixo de 3 vezes por segundo), enquanto houver alerta pendente, inclusive com
a pilha minimizada: o contador é a última marca na tela e continua chamando
atenção. Sob `prefers-reduced-motion`, nada anima, e esse é o único jeito de
parar o piscar. Por isso o padrão fica restrito a avisos que exigem ação e que
somem quando a pessoa age; o WCAG 2.2.2 pede pausa para o que pisca por mais de
5 segundos, e aqui a "pausa" é resolver o aviso.

**Acessibilidade.** Foco visível em amarelo (`0 0 0 3px var(--yellow)`) sobre o
vermelho, no card e no contador; o contador tem `aria-expanded` e
`aria-controls`; a chegada de alerta novo é anunciada numa região
`aria-live="polite"`, sem roubar o foco.

**Estados.** Sem alerta pendente, nada é desenhado, mas a região `aria-live`
continua montada para anunciar a próxima chegada. Não há estado de carregamento:
o clique é otimista.

**Persistência e controle.** O alerta é registro no servidor por pessoa (não
estado de tela): sobrevive a navegação e recarga, e fechar em uma aba fecha nas
outras. Por ser agressivo, nasce com um interruptor geral em Configurações.
Implementação de referência:
[`alertas-ajuste.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/layout/alertas-ajuste.tsx)
no Tasks, com as animações `.alerta-ajuste-entra` e `.alerta-ajuste-pisca` no
`globals.css` dele.

## Painel de cards flutuantes

Lista que a pessoa abre **de propósito** para ler e triar (no Tasks: a central de
notificações do sino, na topbar e no portal do cliente) abre como painel de cards
flutuantes, não como slide-over: não há formulário, e a linguagem é a do alerta
fixo, com cada peça solta sobre o scrim. O slide-over é caixa (fundo, cabeçalho,
rodapé); aqui nada envolve as peças.

**Anatomia.** Três faixas sobre o scrim (`bg-black/40` com desfoque de 4px):
**topo** com pílulas à esquerda e um X de 40px à direita; **lista** de cards
soltos (8px entre eles), agrupados por dia com rótulo em **pílula** de 24px
(texto cinza solto sobre o scrim não passaria AA); **base** com pílulas
alinhadas à direita (a primeira de duas vai para a esquerda, como ação
secundária). Cada peça tem superfície própria: `--c-surface`, borda `--c-border`
(no escuro é ela que separa a peça do scrim), `--sh-md`. Título do diálogo
visualmente oculto (`h2` ligado por `aria-labelledby`), que recebe o foco ao
abrir.

**Posição.** Ancorado ao gatilho a partir de 768px: o X fica **exatamente sobre
o gatilho** (o sino "vira" o X), a lista alinha pela borda direita dele, 420px,
altura até a janela menos o respiro do topo nas duas pontas (conta pura em
[`painel-cards-pos.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/painel-cards-pos.ts)
no Tasks). Abaixo de 768px, ou sem gatilho visível, largura da tela com 16px nas
laterais e 12px em cima e embaixo. Camada dos overlays modais (`z-50`), na mesma
pilha do slide-over: acima da topbar, da gaveta de ferramentas e do alerta fixo;
confirmação e toasts por cima.

**Lista.** Rolagem sem barra (`.pilha-rolagem`, de
`css/patterns/pilha-rolagem.css`: degradê de 44px na borda com mais conteúdo e
`overscroll-behavior: contain`), com folga de 20px nas laterais e 12px em cima e
embaixo, para a sombra e o hover dos cards não serem cortados. Clicar na folga
não fecha: só o scrim fecha. O rótulo de dia tem superfície própria, `--sh-sm`,
10px/700, `.2em` e caixa alta.

**Pílulas.** Desenho do chip de filtro (§3.4 do `ui-guidelines.md`), com alvo de
40px e sombra. No topo: uma **pílula de seleção** de largura fixa, com rótulo curto,
para escolher um filtro não empurrar as vizinhas (na central de notificações:
Todas, Não lidas e as categorias com não lidas, cada uma com a contagem; na
pílula, "Menções", "Aprovações" etc.) e as **ações do topo, sempre só com
ícone**: pílula redonda de 40px com o desenho do chip, nome pelo `aria-label` e
dica pelo `Tooltip`, com o mesmo texto (na central de notificações, "Marcar todas
como lidas", com o `CheckCheck`, que some com fade quando não há o que marcar).
A ação do topo **nunca leva rótulo escrito**: com texto, a linha quebrava no
celular e a ação caía para baixo da pílula de seleção, longe do X; só com ícone,
ela fica na mesma linha e ao lado do X em qualquer largura. Na base: "Ver todas"
para a tela completa.

**Card.** Conteúdo do item: ícone e cor do tipo num quadrado de 36px, título em
até duas linhas (700 quando não lido; 500 em `--premium-steel` quando lido),
mensagem em até duas linhas e data em 11px, as duas em `--premium-gray` (o
`--premium-silver` não passa AA no escuro). `--c-surface`, borda `--c-border`,
raio `--r-lg`, `--sh-md` no painel e `--sh-sm` na tela completa; hover sobe 2px
com `--sh-lg`. O card inteiro é o link para o destino (e fecha o painel); o anel
de foco amarelo (`0 0 0 3px var(--yellow)`) é pintado no card, por
`:has(a:focus-visible)` (o link cobre o card com um `::after` absoluto). Lido
não usa opacidade reduzida (derruba o contraste): perde o negrito do título e
ganha o indicador verde.

**Botão de lido.** Só ícone (`CheckCheck`, os "dois V"). **Amarelo** (a marca,
igual nos dois temas, ícone preto) enquanto não lido: é convite, sólido.
**Verde** tonal (`--success-bg`/`--success`) depois: é estado resolvido, pesa
menos, não recebe foco nem clique. Marcar não fecha o painel e atualiza a
contagem na hora. A troca pulsa, solta uma onda verde e desenha o ícone
(`.lido-vira`); quem tinha o foco no botão passa para o link do card. No recorte
"Não lidas", o card lido fica verde por 900ms e depois recolhe. Marcar todas
vira os botões em onda, de cima para baixo, com 55ms entre eles.

**Movimento.** Abrir: o scrim aparece, o X gira no lugar do gatilho, as pílulas
deslizam a partir dele e os cards descem em cascata (teto de 7), com `--ease-mola`.
Fechar: os cards sobem de baixo para cima e tudo some em **até 260ms**, com
`--ease-sai` (saída sempre menor que a entrada). Item que chega com o painel
aberto entra pela direita com a borda amarela por um instante (`.flash-borda`).
Movimento reduzido: só opacidade, sem cascata, sem giro, sem pulso. Tabela
completa em `motion.md`.

**Acessibilidade.** `role="dialog"` + `aria-modal`; foco no título ao abrir, `Tab`
preso, volta ao gatilho ao fechar; `Esc` fecha só quando o painel é o topo da
pilha e a tecla nasceu nele (a confirmação e o menu de uma pílula fecham
sozinhos); o menu da pílula de seleção abre **dentro** do diálogo; alvo mínimo de
40px; chegada anunciada em região `aria-live="polite"`.

**Estados.** Carregando, vazio e erro aparecem como cards na própria lista
(quatro esqueletos; card de estado vazio com ação opcional; card de erro com
`role="alert"`). **Esqueleto só quando não há nada em memória**: reabrir o
painel ou trocar de recorte mostra na hora a última lista daquele recorte (ou,
na primeira vez, os itens já em memória que caem nele, que o servidor só
completa) e atualiza em silêncio (o que chegou desde então entra como chegada);
a troca de recorte remonta a lista em cascata; uma atualização que falha com a
lista na tela mantém a lista. A busca pode começar antes do clique, com o
ponteiro ou o foco no gatilho.

Implementação de referência: [`painel-cards.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/ui/painel-cards.tsx)
e a central de notificações ([`notificacoes-bell.tsx`](https://github.com/agenciapremium/tasks/blob/main/src/components/layout/notificacoes-bell.tsx))
no Tasks.

## Ajuda contextual

Toda tela do menu registra, pelo `PageHeader`, um texto de ajuda de uma a três
frases (o que a tela é e qual é o próximo passo). A topbar desenha um "?" ao lado
do título que abre esse texto num popover, com link para a documentação quando
houver e um atalho para o painel de teclas. Os textos vivem só em
[`lib/ajuda-telas.ts`](https://github.com/agenciapremium/tasks/blob/main/src/lib/ajuda-telas.ts), por rota, e um teste cobra
que nenhuma rota do menu fique sem o seu.

Para quem entrou há menos de 14 dias, o Dashboard mostra o card "Primeiros
passos" acima do "Meu dia": quatro passos que se marcam sozinhos (abrir Minhas
Demandas, ativar notificações, configurar os Caminhos do Drive, criar a primeira
atividade), dispensável num clique e sem nenhum balão sobre a interface.

## Voz e microcopy

- **Títulos** descrevem a tela ("Minhas Demandas"); pessoa do verbo é "você".
- **Subtítulos** explicam o propósito em uma frase.
- **Botões**: verbo no infinitivo curto; evitar "OK"/"Sim".
- **Estados vazios**: ação positiva + próximo passo.
- **Erros**: o que aconteceu + o que fazer.
- **Datas**: relativas até 7 dias ("Hoje 14h", "Atrasada há 2 dias"); absolutas depois ("12 jun 2026").
- **Pluralização** correta; sem "(s)".
- **SLA restante** (chip de tempo da etapa, capability `demandas-tempo-sla-no-card`): sempre em **horas úteis** da jornada, no plural correto e sem número quando o número não ajuda. Vocabulário fechado: "faltam 6h úteis", "falta 1h útil", "termina hoje" (abaixo de uma hora), "estourou há 3h úteis", "estourou há 1h útil", "acabou de estourar". O tempo da etapa é "gasto / previsto" ("2h15 / 8h"), com **til** quando o previsto é o padrão de um dia útil ("2h15 / ~8h").
- Sem emoji em UI de produção; pt-BR sempre acentuado.

## Responsividade

Comportamento do shell autenticado (capability `app-shell-responsivo`). Acima de
768px nada muda em relação ao desktop de sempre.

| Breakpoint | Comportamento |
|---|---|
| 1100px | Grids de detalhe (`1fr 320px`) → 1 coluna, conteúdo antes dos meta-cards |
| 768px | Sidebar → drawer sobre o conteúdo (botão de menu na topbar, scrim, `Esc`); topbar `min-h` 64px; respiro do `main` 16px; busca da topbar → ícone; kanban volta à altura natural (a página rola) |
| 640px | Breadcrumb da topbar oculto (o título continua, truncado) |
| sempre | Kanban mantém scroll horizontal |

O drawer abre sempre completo (248px, ícone + rótulo): a preferência de colapso
(`premium.sidebar.collapsed`) vale só de 768px para cima. Tabela em cards
empilhados continua pendente e é decidida por tela, não pelo shell.

## Do / Don't

✅ Tokens semânticos sempre · reusar primitivos · estado em `searchParams` · slide-over para criar/editar · breadcrumb no detalhe · skeleton para loading · screenshots claro+escuro no PR.

❌ Hex direto · modal central novo · amarelo como texto em fundo claro · spinner full-page · emoji · sombra arbitrária · duplicar lógica do `workflow-engine` · janelas nativas do navegador.
