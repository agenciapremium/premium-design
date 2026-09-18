# Changelog

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
