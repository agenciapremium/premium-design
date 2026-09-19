# Changelog

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
