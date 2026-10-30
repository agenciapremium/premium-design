# Changelog

## v0.15.2 · 2026-09-24

Correção de uma regra de posicionamento. Nenhum token nem CSS do pacote mudou.

- **Popover colado ao gatilho (`docs/ui-guidelines.md`, posicionamento do DatePicker; `docs/componentes.md`, convenções).** O `popoverPos` posicionava o painel pelo topo calculado com a altura **estimada**: aberto acima, uma lista curta (3 opções num multi-select com estimativa de 360px) ficava cerca de 200px acima do campo; aberto abaixo perto da base da janela, o clamp final empurrava o painel para cima. A regra passa a ser: o painel encosta no gatilho a 6px (abrindo acima, ancorado por `bottom`); o flip continua decidido pela estimativa; sem espaço, o painel ganha `maxHeight` com o espaço disponível (mín. 120px) e rola por dentro em vez de ser deslocado; com espaço de sobra vale o `max-h-*` do próprio painel. Corrigido no Tasks no mesmo dia (change `popover-colado-ao-gatilho`), com teste do helper.
- **`package.json`**: `version` 0.15.2.

## v0.15.1 · 2026-09-24

Regra de uso do slide-over explicitada. Nenhum token nem CSS do pacote mudou.

- **Rodapé do slide-over pelo tipo de salvamento (`docs/ui-guidelines.md` §4.9).** Salvamento explícito: Cancelar + a ação. Edição com auto-save: Fechar + Concluir, os dois fechando, e o painel de edição nunca abre sem rodapé nem com "Fechar" solto no corpo. Sucesso sem nada a descartar: só Concluir. A regra já existia em linhas gerais; uma auditoria do Tasks (24/09/2026) achou 12 painéis fora dela, a maioria copiada do mesmo cadastro antigo (grupos de clientes, categorias, portadores, fornecedores, QA), corrigidos no Tasks no mesmo dia, com um teste que barra o erro.
- **Ação de seção no corpo (§4.9).** Botão que age na hora sobre um bloco independente ("Enviar foto", "Alterar senha", "Emitir agora", "Adicionar item", "Cancelar contrato") fica no corpo; o rodapé é do formulário principal. Ação de negócio não ocupa o lugar do "Fechar".
- **Formulário não mora em modal feito à mão (§4.9).** Criar ou editar com vários campos, wizard incluído, usa o `SlideOver`. Overlay próprio de onde um slide-over abre entra na pilha de overlays e só trata `Esc` e foco no topo.
- **`package.json`**: `version` 0.15.1.

## v0.15.0 · 2026-09-21

Uma regra nova no painel de cards flutuantes e a documentação das variantes white-label do Premium Assets. Nenhum token nem CSS do pacote mudou.

- **Ação do topo do painel só com ícone (`docs/padroes-de-interacao.md` §"Painel de cards flutuantes", `docs/componentes.md` §Pilula e §PainelCards, `docs/ui-guidelines.md` §3.4).** As ações no topo do painel (na central de notificações, "Marcar todas como lidas") passam a ser pílulas redondas de 40px **só com ícone** (`Pilula soIcone`), com o nome no `aria-label` e na dica. Com rótulo escrito, a linha quebrava no celular e a ação caía para baixo da pílula de seleção, longe do X; só com ícone ela fica ao lado do X em qualquer largura. O showroom segue a regra e deixa de quebrar a linha do topo abaixo de 768px. Pedido na validação do Pacote O do Premium Assets (21/09/2026); no Tasks, a pílula "Marcar todas como lidas" da central do sino passa a usar a variante.
- **Variantes white-label (`docs/componentes.md` §ErroRota e §BotaoLido).** `ErroRota` ganha `portal` (identidade do cliente pela camada de tokens do portal, sem a marca da agência, com o contato de atendimento) e `neutra` (sem marca alguma, para link público e falha do layout raiz em endereço de portal). No portal, o `BotaoLido` e a borda de chegada usam o acento do cliente (`--portal-accent`/`--portal-on-accent`) no lugar do amarelo. Sem token novo.
- **Busca em pílula do cabeçalho do portal** entra na tabela "Padrões próprios reconhecidos" de `docs/componentes.md`, com um só controle de limpar.
- **`docs/index.md`** deixa de chamar o DS de "Premium Demands System": ele serve o Premium Tasks e o Premium Assets.
- **`package.json`**: o `version` passa a acompanhar a tag (estava em `0.4.0` desde a v0.4.0).

## v0.14.0 · 2026-09-19

Uma regra de layout nova. Nenhum token nem CSS do pacote mudou.

- **Conteúdo com 100% da largura (`docs/ui-guidelines.md` §3.5, nova).** O conteúdo do shell ocupa a largura toda ao lado da sidebar: o `main` não tem `max-width` nem contêiner centralizado, e grade de cards e de widgets divide a sobra entre os itens (`auto-fill` com `minmax` ou `flex: 1 1 <base>`) em vez de deixar faixa vazia à direita. Largura fixa só em overlay e em controle de tamanho próprio. Ficam as duas exceções que já existiam, ambas de leitura: a medida do texto corrido (no Tasks, `max-w-[66ch]`) e o teto de 360px da coluna do kanban (§4.6). Fora do shell (login, portal do cliente, e-mail) a página pode centralizar. A regra entra também no Do/Don't (§11), no checklist de PR (§12, item 14), em `docs/padroes-de-interacao.md` §Layout global e na tabela de layout de `docs/tokens.md`.
- **`docs/showroom.html` segue a regra.** Sai o `max-width:1180px` do conteúdo (em 1920px sobravam 490px vazios à direita); stat cards e cards de painel crescem para dividir a linha; as colunas do kanban passam a ser elásticas entre 280 e 360px, como na §4.6; os gráficos de barras e de linha são redesenhados na largura do contêiner, com altura fixa e rolagem abaixo do mínimo legível, como o `ResizeObserver` da implementação React.

## v0.13.0 · 2026-09-19

Uma regra de shell nova, a logo oficial dentro do pacote e o showroom alinhado ao shell do Tasks. Nenhum token nem CSS do pacote mudou.

- **Logo oficial em `brand/` (novo).** Os dez arquivos de `public/brand/` do Tasks, idênticos: logo horizontal e vertical em branco e preto (WebP), a horizontal branca em PNG para e-mail, o ícone e os favicons. O `package.json` passa a publicar a pasta e a exportá-la em `@agenciapremium/premium-design/brand/*`. `docs/index.md` ganha a seção "Logo" (arquivo, pixels, onde cada um é usado no Tasks, e as regras: só a altura é fixa, branca sobre escuro e preta sobre claro, nunca recriar com o `lucide:trophy`) e o símbolo da marca deixa de ser descrito como o ícone do lucide. O showroom troca o troféu do lucide com o texto "PREMIUM / DESIGN SYSTEM" pela logo horizontal branca de 36px, como a sidebar do Tasks, e passa a usar o favicon da marca.
- **Faixa da logo com a altura da topbar (`docs/ui-guidelines.md` §2.5, §3, §3.1 e §3.2).** A faixa da logo, no topo da sidebar, tem a mesma altura da topbar: 88px, e 64px abaixo de 768px, no drawer. A logo fica centralizada na vertical, na linha do título da tela, e a lista de navegação começa na altura da borda inferior da topbar. Não há divisória na sidebar: o alinhamento vem só da altura. A sidebar passa a ser descrita em três partes (logo, lista que rola, rodapé com o usuário) e a topbar deixa de listar o avatar. `docs/tokens.md` troca o "Topbar 68px" pela medida real (`min-h-[88px]`; 64px abaixo de 768px) e ganha a linha da faixa da logo; os diagramas de `docs/ui-guidelines.md` §3 e `docs/padroes-de-interacao.md` §Layout global ganham a faixa da logo e o usuário no rodapé; o menu de conta passa a ter os quatro itens do Tasks. No Tasks a faixa hoje termina em 82px (22px de respiro + logo de 36px + 18px + 6px de gap), 6px antes da borda da topbar: para seguir a regra, a `sidebar.tsx` troca `py-[22px]` e `pb-[18px]` do topo por uma faixa de 88px com a logo centralizada.
- **`docs/showroom.html`: topbar de 88px e faixa da logo na mesma altura.** A topbar sai de 68px para `min-height` 88px (64px abaixo de 768px) e a faixa da logo usa a mesma medida, uma variável só para as duas; o clique no menu para a seção 16px abaixo da topbar nas duas larguras.
- **`docs/showroom.html`: menu lateral fixo, como no dashboard.** O menu era `sticky` dentro de um `body` com `height:100%` e, passada a primeira tela, subia junto com a página. Agora é `position:fixed`, rola por conta própria e só o conteúdo rola. O clique leva a página até a seção com rolagem suave (salto direto sob `prefers-reduced-motion`); o item ativo acompanha a rolagem, recebe `aria-current` e continua à vista dentro da lista. Abaixo de 768px o menu vira gaveta, como em `docs/padroes-de-interacao.md` §Responsividade: botão de menu na topbar, scrim, `Esc`, foco que entra no item ativo e volta ao botão. Em 390px a página deixa de abrir rolagem horizontal.
- **Usuário no rodapé do menu lateral, como no Tasks.** O avatar sai da topbar e vai para o rodapé fixo da sidebar, com nome e papel; o clique abre para cima o menu de conta (Minha conta, Trocar de senha, Atalhos de teclado, Sair), escuro nos dois temas. A sidebar passa a ter três partes: logo e usuário sempre à vista, só a lista do meio rola. O botão de menu da topbar continua existindo só abaixo de 768px, que é onde a sidebar vira gaveta. `docs/componentes.md` acerta a linha da `topbar.tsx`, que ainda listava o avatar, e ganha a linha do `account-menu.tsx`.
- **Travessões fora do texto do showroom**, pela regra de `docs/ui-guidelines.md` §8: `·` separando itens, dois-pontos ou vírgula nas pausas, parênteses no aposto e `aria-label` reescrito ("Ordenar por prazo em ordem crescente"). Intervalos com meia-risca viram "a" ("13 a 14px", "02 jun a 03 jun").

## v0.12.0 — 2026-09-19

Regras de shell, navegação e edição, e um padrão de CSS novo. Nenhum token de cor mudou de valor. Também vindas do Tasks (05/09 a 18/09/2026).

- **Editor rico: uma experiência, dois motores (`docs/componentes.md`, `docs/ui-guidelines.md` §4.8) e `css/patterns/blocknote.css` (novo)** — quando o sistema tem dois editores (Markdown e blocos), barra, atalhos, moldura, colagem limpa, menção `@` e trecho de Drive são os mesmos, e comando novo entra nos dois. O padrão novo liga o tema do BlockNote (`--bn-colors-*`) aos tokens, com um bloco só para os dois temas, e alinha a tipografia dos blocos à do modo de leitura. `drive-link.css` passa a valer também dentro de `.bn-editor`. Regra geral nova em `docs/ui-guidelines.md` §2.7: biblioteca de terceiro com tema próprio é mapeada **uma vez** para os tokens, com `var(--token)`, nunca hex.
- **Atalhos de teclado (`docs/padroes-de-interacao.md`, `docs/ui-guidelines.md` §5.6)** — registro único resolvido por um só `keydown`; sequências de duas teclas com até 800ms entre elas (`c` cria, `g` navega, `t` abre a gaveta de ferramentas); painel `?`; nada dispara com o foco onde se digita nem com diálogo aberto; a permissão é a mesma da interface; atalho sem dica visível não existe.
- **Ajuda contextual da tela (`docs/ui-guidelines.md` §5.6.1, novo)** — "?" ao lado do título abre um texto de uma a três frases por rota, com link para a documentação e o painel de atalhos; e o card "Primeiros passos" para quem entrou há menos de 14 dias, sem balão algum sobre a interface.
- **Shell responsivo (`docs/padroes-de-interacao.md` §Responsividade, `docs/ui-guidelines.md` §2.5)** — abaixo de 768px o menu lateral vira gaveta por cima do conteúdo (sempre com os 248px), o respiro do `main` cai para 16px e a topbar para 64px; abaixo de 640px o breadcrumb da topbar some.
- **Minha conta** — tudo o que é da pessoa (foto, dados, senha, notificações, preferências) vive numa tela só, em seções ancoráveis.
- **`DatePicker` é o único controle de data (`docs/formularios.md`)** — o `<input type="date">` nativo não é usado; no Tasks, lint o barra. A troca é um para um, com o mesmo valor `aaaa-mm-dd`.
- **Fonte servida pelo próprio app (`docs/tokens.md`, `docs/ui-guidelines.md` §2.1)** — nenhuma requisição ao Google em tempo de execução. `css/base.css` e `css/theme.css` passam a usar `var(--font-ubuntu, "Ubuntu")`: o sistema que carrega a fonte por `next/font` declara a variável (o nome de família que ele gera não casa com o literal `"Ubuntu"`); o que carrega por `@font-face` ou `<link>` não muda nada. Componente usa `font-sans` ou `var(--font-ubuntu)`, nunca o literal sozinho.
- **Demandas (`docs/ui-guidelines.md` §4.6 e §4.13)** — chip de tempo da etapa ("gasto / previsto") com as faixas do `Badge`, SLA restante em horas úteis com vocabulário fechado, comentários resolvidos (selo, seção recolhida, contagem do que está em aberto) e badge de comentários não vistos no card.
- **Checklist de PR de UI (`docs/ui-guidelines.md` §12)** — suíte de fumaça verde, no sistema que tem uma.

Implementado primeiro no Tasks (changes `editor-rico-convergencia`, `atalhos-teclado-e-ajuda`, `app-shell-responsivo`, `shell-tipografia-e-navegacao`, `minha-conta-e-configuracoes-secoes`, `demandas-tempo-sla-no-card`, `demandas-comentarios-novidades-resolucao` e `testes-e2e-smoke-visual`).

## v0.11.0 — 2026-09-19

Componentes novos e um padrão de CSS novo. Nenhum token mudou de valor. Tudo já vivia no Tasks desde a onda de 05/09/2026 e ainda não tinha subido para cá.

- **Dica contextual (`Tooltip`) e `css/patterns/tooltip.css` (novo)** — a dica passa a ser o **único** mecanismo de dica da interface. O `title` nativo não aparece no foco por teclado nem no toque, ignora o tema e cada navegador o desenha de um jeito; no Tasks ele é barrado por lint em elemento do DOM (ficam `iframe`, `abbr`, `svg`/`<title>` e os e-mails, onde é nome acessível e não dica). A dica aparece no hover com 300 ms de atraso e no foco por teclado na hora; um contêiner com `data-tooltip-group` zera o atraso entre ícones vizinhos (a custom property registrada `--tt-delay` mora no padrão novo); o balão se liga ao gatilho por `aria-describedby`; texto cortado só ganha dica quando não cabe (`useTruncado`). `docs/ui-guidelines.md` §4.34 (novo) e `docs/componentes.md` §Tooltip. `ContextIconButton`, `Switch` e `Avatar` deixam o `title`; o checklist de acessibilidade (`docs/ui-guidelines.md` §7) ganha a linha correspondente.
- **Gestão de foco em overlays (`useDialogoFoco`)** — fecha as duas pendências conhecidas de `docs/acessibilidade.md` (o `SlideOver` não levava o foco ao painel nem o devolvia, e nenhum overlay prendia o `Tab`). Todo overlay modal faz o foco **entrar** (primeiro campo, ou o título em painel de leitura e em viewport estreita, para não abrir o teclado virtual), **ficar** (`Tab` cicla no overlay do topo da pilha) e **voltar** ao gatilho, com `inert` no resto da página como reforço. Overlay com `aria-modal` sem o hook passa a ser defeito de revisão; nome acessível por `aria-labelledby` no título, nunca `aria-label` junto.
- **Skeleton e ErroRota (novos)** — blocos de carregamento `SkeletonLinha`, `SkeletonCard`, `SkeletonTabela` e `SkeletonKanban` (`aria-hidden`, pulso só sob `motion-safe`) e uma tela única de erro de rota: "Algo deu errado", "Tentar de novo", "Voltar para o início" e a referência do erro, **nunca** a mensagem da exceção em produção. Spinner de página inteira passa a ser proibido; "página não encontrada" segue a anatomia do estado vazio com o título em `h1`. `docs/padroes-de-interacao.md` §"Estados de carregamento" e §"Erros de rota".
- **Views salvas (`docs/ui-guidelines.md` §4.32, novo)** — o recorte da tela (filtros, visão e ordenação) vira uma view nomeada no menu da zona de contexto da `FilterBar`: aplicar, definir como padrão, renomear, copiar link e excluir com "Desfazer". Até 10 por tela; a view padrão abre a tela quando a URL não traz filtros.
- **Grupo por prazo (`docs/ui-guidelines.md` §4.33, novo)** — cabeçalho de seção agrupada por urgência (Em atraso, Hoje, Esta semana...), com os tons `neutro`, `atencao` e `critico` por token; a cor acompanha o rótulo, nunca o substitui.

Implementado primeiro no Tasks (changes `overlays-gestao-de-foco`, `tooltip-no-lugar-de-title`, `rotas-erro-e-carregamento`, `views-salvas-nomeadas` e `dashboard-meu-dia`).

## v0.10.1 — 2026-09-19

Só documentação — nenhum valor de token mudou.

- **`docs/padroes-de-interacao.md` §"Alerta fixo" e §"Painel de cards flutuantes"** — a cópia dos docs no Tasks tinha detalhado os dois padrões em outro lugar (`ui-guidelines.md` §4.35 a §4.37, que não existem aqui). Os detalhes voltam para as seções canônicas, e a cópia do Tasks passa a seguir esta estrutura. Alerta fixo: 320px de largura, a 16px da sidebar e a 20px da base; ícone de 18px num quadrado de 36px; `--sh-md`; ciclo do piscar de 1,1s; anel de foco `0 0 0 3px var(--yellow)` no card e no contador; estado vazio sem desenho, com a região `aria-live` montada. Painel: folga de 20px em volta da lista (clicar nela não fecha), rótulo de dia em 10px/700 caixa alta, pesos do título do card (700 não lido, 500 lido), mensagem e data em `--premium-gray` (o `--premium-silver` não passa AA no escuro), foco pintado por `:has(a:focus-visible)`, 900ms de verde antes de recolher e 55ms entre os botões no "Marcar todas".
- **Correção**: o quadrado do ícone do alerta fixo é `--on-alert-solid` a **15%**, como na implementação de referência (o texto dizia 16%).
- **Painel de cards: esqueleto só quando não há nada em memória** — trocar de recorte mostra na hora a última lista daquele recorte (ou, na primeira vez, os itens já em memória que caem nele, que o servidor só completa) e remonta a lista em cascata, em vez de piscar esqueleto. Ajuste pedido no Tasks depois da v0.10.0.
- **`docs/componentes.md`** — seção `NotificacaoCard` (o card das três superfícies de notificação, com variantes `flutuante` e `pagina` e os estados em card) e as props que faltavam em `PainelCards`, `BotaoLido` (`dica`, `rotuloLido`, `icone`) e `PilulaSelect` (`rotulo` como prefixo do nome do gatilho, `Esc` que não fecha o overlay hospedeiro).
- **README** — a lista de padrões opt-in ganha `pilha-rolagem.css` e `pilula.css`, publicados na v0.10.0 sem entrar nela.

Implementado primeiro no Tasks (change `central-notificacoes-cards`).

## v0.10.0 — 2026-09-18

Padrões novos e duas curvas de movimento. Nenhum token existente mudou de valor.

- **Tokens `--ease-mola` e `--ease-sai` (novos, `css/tokens.css`)** — `cubic-bezier(.3,1.35,.5,1)` e `cubic-bezier(.4,0,1,1)`, iguais nos dois temas. Exceção documentada à curva única: a mola dá um rebote curto só nas **entradas** do painel de cards flutuantes e no pulso do botão de lido; a saída acelera e é sempre mais curta. Fora desses padrões, continua valendo `--ease`.
- **`docs/padroes-de-interacao.md` §"Painel de cards flutuantes" (novo)** — lista aberta de propósito para ler e triar (primeiro uso: central de notificações do Tasks, na topbar e no portal do cliente) vira diálogo modal **sem moldura**: topo com pílula de seleção, pílulas de ação e o X exatamente sobre o gatilho; cards soltos agrupados por dia com rótulo em pílula; base com "Ver todas". Abre em cascata a partir do gatilho e fecha de baixo para cima em até 260ms; só opacidade sob movimento reduzido. Tabela completa das variantes em `docs/motion.md`.
- **Botão de lido (novo; `docs/componentes.md`, `css/motion.css`)** — só ícone (`CheckCheck`): **amarelo** da marca (igual nos dois temas) enquanto não lido, **verde** tonal (`--success-bg`/`--success`, sem foco) depois. A troca pulsa, solta uma onda verde e desenha o ícone (`.lido-vira`, keyframes `lidoPop`, `lidoOnda`, `lidoTraco`). Item que chega com o painel aberto ganha a borda amarela por um instante (`.flash-borda`).
- **Pílula de ação e de seleção (`docs/ui-guidelines.md` §3.4, `css/patterns/pilula.css`)** — o desenho do chip de filtro fora da barra, com uma fonte única de classes para os dois usos; variante flutuante (alvo de 40px, `--sh-md`) e pílula de ação que some com fade sem deslocar os vizinhos. Dentro de diálogo modal, o menu da pílula de seleção abre dentro do diálogo.
- **Pílula de seleção de largura fixa e esqueleto só na primeira carga** — ajustes pedidos depois da primeira publicação no Tasks: a pílula de seleção mantém a largura entre opções (rótulo curto na pílula, nome completo no menu) e o painel reaberto mostra a última lista na hora, atualizando em silêncio, em vez de piscar esqueleto.
- **`css/patterns/pilha-rolagem.css` (novo)** — a rolagem sem barra com degradê por máscara (`data-mais`) que o "Alerta fixo" usava sai do componente e vira padrão compartilhado com o painel de cards.
- **`docs/componentes.md` §ConfirmDialog** — passa a abrir em portal no `body`, montado só ao abrir: fica por cima de qualquer overlay já aberto e fora do `inert` que ele aplicou à página.
- **`docs/showroom.html`** — seção "Painel de cards & botão de lido" com a troca amarelo → verde ao vivo; curvas novas nos tokens do showroom.

Implementado primeiro no Tasks (change `central-notificacoes-cards`).

## v0.9.0 — 2026-09-18

Regra nova e CSS base novo. Nenhum token mudou de valor.

- **`css/base.css`: o "x" nativo do campo de busca sai** — Chrome e Safari desenham um "x" de limpar em todo `input[type="search"]` (o Firefox não desenha nenhum), que se somava ao `X` do sistema: dois controles para a mesma coisa, diferentes em cada navegador. A regra base esconde `::-webkit-search-cancel-button` e as decorações nativas. O campo continua `type="search"`: teclado "Buscar" no celular, `Esc` limpa, papel `searchbox`.
- **`docs/componentes.md` §"Campo de busca" (novo)** — primitivo `CampoBusca` para busca solta na tela, fora da barra de filtros: lupa, campo e um `X` "Limpar busca" (só com texto, alvo 28×28px, foco volta ao campo). A regra: **um controle de limpar por campo, sempre o do sistema**; campo de busca novo usa o `CampoBusca` ou o chip do `FilterBar`. A busca da árvore de Docs deixa a tabela "Padrões próprios reconhecidos", porque passa a usar o primitivo. O checklist de PR de UI (`docs/ui-guidelines.md` §12) ganha a linha correspondente.
- **`docs/componentes.md` §FilterBar e `docs/padroes-de-interacao.md` §"Barra de ações da tela"** — o botão amarelo **Limpar filtros** só aparece com algum filtro ativo além da busca (só com a busca, o `X` dela basta, e a barra deixava três "x" lado a lado) e troca o ícone `X` pelo funil com x (`FunnelX`), para não se ler como mais um limpar de campo. O `X` da busca colapsável ganha alvo de 24×24px. Implementado primeiro no Tasks (change `busca-um-x-por-campo`).

## v0.8.1 — 2026-09-18

Só documentação — nenhum valor de token mudou.

- **`docs/padroes-de-interacao.md` §"Alerta fixo"** — o ícone do **contador** também pisca, aberto ou minimizado, enquanto houver alerta pendente (pedido de quem usa o primeiro caso, o novo ajuste na peça no Tasks). Minimizar deixa de ser a pausa do piscar; a pausa passa a ser resolver o aviso, e `prefers-reduced-motion` continua parando tudo.

## v0.8.0 — 2026-09-18

- **Tokens `--alert-solid`, `--alert-solid-hover` e `--on-alert-solid` (novos)** — vermelho sólido **igual nos dois temas** (`#C0322B` / `#A82A24` / `#FFFFFF`, 5,6:1), com os utilitários Tailwind `bg-alert-solid`, `hover:bg-alert-solid-hover` e `text-on-alert-solid`. Existe porque o `--danger` do escuro (`#E87A72`) é tom de texto e perde a urgência como fundo. Regra: `--alert-solid` é fundo; vermelho como texto sobre superfície continua `--danger`. Nenhum token existente mudou de valor.
- **`docs/padroes-de-interacao.md` §"Alerta fixo" (novo)** — aviso que fica na tela até a pessoa abrir o item: card enxuto (ícone piscando, título, etiqueta do papel, card inteiro clicável, sem botão de fechar), pilha no canto inferior esquerdo com contador fixo que minimiza, rolagem sem barra aparente com degradê, minimizar como pausa do piscar (WCAG 2.2.2). Linha nova na tabela "Feedback — qual camada usar". Implementado primeiro no Tasks (novo ajuste na peça).

## v0.7.0 — 2026-09-14

Só documentação — nenhum valor de token mudou.

- **`docs/padroes-de-interacao.md` §"Gaveta de ferramentas e cartão de ferramenta" (novo)** — utilitário de apoio (conta, conversão, contagem) não vira tela no menu: vira card numa gaveta lateral **não modal** que abre de qualquer lugar (botão "Ferramentas" na topbar ou `t` `f`), convive com o slide-over por cima e continua montada quando fechada para preservar o que a pessoa digitou. O **cartão de ferramenta** é composição sobre `Card` (alça de arrastar, recolher, menu com mover e ocultar), sem token novo; a personalização (ordem, recolhido, oculto) é da pessoa e o catálogo é declarativo, para ferramenta nova não tocar na gaveta. Tabela de atalhos ganha o prefixo `t`.

## v0.6.0 — 2026-09-03

Só documentação — nenhum valor de token mudou.

- **`docs/ui-guidelines.md` §11 (voz e tom)** — o travessão (`—`) sai do texto que o usuário lê. Ele estava sendo usado para duas intenções diferentes (separar itens e marcar pausa), e um símbolo só para as duas achata a leitura. A regra: **ponto médio** (`·`) para separar itens; **dois-pontos** quando a segunda metade explica a primeira, **vírgula** no resto; **parênteses** para aposto que já contém vírgulas. Em `aria-label`/`title`, **reescrever a frase** em vez de trocar o símbolo — leitores de tela anunciam `·` de forma inconsistente. Uma exceção: o `—` sozinho como marcador de valor ausente numa célula ("Prazo: —"), que não é pontuação e permanece. No Tasks a regra é sustentada por lint (`no-restricted-syntax`), que não alcança comentário de código.

## v0.5.0 — 2026-09-03

Só documentação — **nenhum valor de token mudou**, então consumir esta versão não altera pixel de app existente.

- **`docs/padroes-de-interacao.md` §"Seletor de pessoas"** — nova opção **grupo revelado por busca** (`revelarSoComBusca`): o grupo só é desenhado quando há termo digitado, com uma dica no lugar dele. Existe para o caso em que a lista curta é o comum e a longa é exceção — o seletor de responsáveis do ajuste abria com a agência inteira e enterrava a equipe do projeto. Duas regras acompanham o padrão, e são o que o torna seguro: **quem já está selecionado continua visível** mesmo sem busca (em hosts que usam o painel inline, sem badges, a lista é a única superfície da seleção — um selecionado escondido fica impossível de desmarcar), e o **estado vazio orienta a digitar** em vez de afirmar que não há ninguém.

## v0.4.0 — 2026-08-25

- **`Switch` (novo primitivo)** — interruptor liga/desliga do catálogo: `button role="switch"` com trilho e polegar, nunca `<input type="checkbox">` com `accent-color`. Documentado em `docs/componentes.md` e na tabela "Escolha do campo" de `docs/formularios.md`, com a regra que faltava: quando a mudança precisa ser entendida antes, o switch **não vira sozinho** — o consumidor confirma primeiro. Já existiam duas implementações divergentes espalhadas pelo Tasks (uma com trilho, duas com checkbox nativo); esta é a canônica.

## v0.3.0 — 2026-08-22

Diretivas que já valiam no Tasks e não estavam escritas em lugar nenhum. Só documentação — **nenhum valor de token mudou**, então consumir esta versão não altera pixel de app existente.

- **`docs/email.md` (novo)** — e-mail transacional, a superfície de marca que não roda dentro do app. As quatro regras invariantes (hex literal, logo PNG por URL absoluta, `display:block`+`margin:0 auto` para centralizar, recuo por tabela interna de 520px), o esqueleto canônico com todas as medidas, os cinco tons da pílula de contexto e o checklist de envio. Cada regra existe porque um e-mail chegou quebrado a um cliente real.
- **`docs/email-modelo.html` (novo)** — modelo canônico em HTML standalone, para aprovar layout antes de escrever componente. E-mail não tem hot reload.
- **`docs/tokens.md`** — nova camada **cor de dado**: paleta fechada de dez hex para cor escolhida pelo usuário e gravada no banco (departamento, motivo de ausência). Segunda e última exceção ao "cor só por token", com as regras que a tornam segura (lista fechada, validação no servidor, escolha por amostras, nunca texto sobre fundo claro).
- **`docs/ui-guidelines.md` §2.8 (novo)** — `cn()` é join puro, sem `tailwind-merge`: classes conflitantes não são desempatadas e quem vence depende da ordem do CSS gerado. Elimine o conflito, não o arbitre.
- **`docs/ui-guidelines.md` §4.9 / `docs/formularios.md`** — popover é para **escolha atômica**; formulário com mais de dois campos é slide-over. A metade da regra que faltava, e a que mais era violada.
- **`docs/ui-guidelines.md` §4.6** — largura da coluna do kanban: elástica entre **280px e 360px**, sobra à direita (`justify-start`).
- **`docs/ui-guidelines.md` §4.22 / `componentes.md` / `padroes-de-interacao.md`** — contrato de dimensionamento de mídia em overlay: altura definida no wrapper (`h-full`), nenhuma classe de tamanho no leitor. `max-height` percentual contra pai indefinido computa como `none`.
- **`docs/ui-guidelines.md` §4.6** — removida menção a `GESTOR`/`ADMIN`: o modelo de autorização por papéis não existe mais nos sistemas da agência.

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
