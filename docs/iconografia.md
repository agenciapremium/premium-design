# Iconografia

Biblioteca única: **[lucide-react](https://lucide.dev) `^1.17`**. Não misturar com outras bibliotecas nem SVGs avulsos (exceção: logo da marca em `components/brand/`).

## Tamanhos

| Contexto | Tamanho |
|---|---|
| UI padrão (botões, chips, inputs) | **16px** |
| Sidebar (subitens do submenu: 15px) | 18px |
| Metadados de card do Kanban | 13px |
| Separador de breadcrumb / chips de filtro | 14px |
| Tabs | 15px |
| Setas de ordenação (`sort-controls`) | 12px |
| Controles de overlay (navegação do lightbox, ícone do ConfirmDialog) | 18–20px |
| FAB principal | 24px |
| Empty state | 38px |

## Cor

O ícone **herda a cor do contexto** (`currentColor`) — nunca colorir o `<svg>` diretamente. Acentos via wrapper (ex.: ícone do toast em `text-[var(--yellow)]`).

## Mapa conceito → ícone

Manter consistência ao adicionar telas — consultar antes de escolher ícone novo.

### Navegação e módulos

| Conceito | Ícone |
|---|---|
| Dashboard | `layout-dashboard` |
| Atividades | `check-square` |
| Demandas | `kanban-square` |
| Meus cards (Quadros) | `columns-3` |
| Quadros | `map` |
| Projetos | `folder-kanban` / `folder` |
| Gestão / Departamento | `layers` |
| Entregas / BI | `bar-chart-3` |
| Relatórios de produtividade | `file-bar-chart` |
| Financeiro | `wallet` (submenu: `layout-grid`, `list-checks`, `file-signature`, `pie-chart`) |
| Conhecimento | `book-open` |
| Configurações | `settings` |
| Calendário do time | `calendar-heart` |
| Mural de avisos | `megaphone` |
| Desempenho | `target` |
| Reconhecimento | `award` |
| Bem-estar | `heart-pulse` |

### Entidades

| Conceito | Ícone |
|---|---|
| Cliente | `briefcase` |
| Colaborador | `users` / `user` |
| Workflow / etapa | `git-branch` (o antigo `git-commit` saiu de uso) |
| Modelo de demanda | `file-stack` |
| HERMES / IA | `sparkles` (painel de ações de IA do card usa também `bot`) |
| Selos de reconhecimento | `flame`, `heart-handshake`, `cake`, `award`, `trophy`, `medal` |

### Estados e ações

| Conceito | Ícone |
|---|---|
| Prazo / data | `calendar` |
| Atraso / aviso | `alert-triangle` |
| Erro de formulário | `alert-circle` |
| Aprovação | `eye` / `user-check` |
| Concluído / sucesso | `check-circle` (`check-circle-2` no toast) |
| Informação | `info` |
| Ajuste | `wrench` |
| Notificação | `bell` (`bell-ring` quando há não lidas) |
| Busca | `search` |
| Tema | `moon` / `sun` |
| Admin restrito | `lock` |
| Comentário | `message-square` |
| Anexo | `paperclip` |
| Etiqueta | `tag` |
| Arquivar / restaurar | `archive` / `archive-restore` |
| Histórico | `history` |
| Layout / arte | `image` |
| Vídeo | `video` |
| Áudio | `music` |
| Adicionar | `plus` |
| Fechar / dispensar | `x` |
| Excluir | `trash-2` |
| Copiar / copiado | `copy` / `check` |
| Tela cheia | `maximize` |
| Zoom | `zoom-in` / `zoom-out` (restaurar: `rotate-ccw`) |
| Expandir / recolher | `chevron-down` (rotaciona 180°) |
| Navegação lateral | `chevron-left` / `chevron-right` |
| Link externo | `external-link` |
| Enviar | `send` |
| Favorito | `star` |
| Pasta do Drive | `folder` (via mask CSS no trecho `drive://`) |
| Troféu da marca | `trophy` |

### Editor rico (toolbar)

`bold`, `italic`, `heading-2`, `heading-3`, `list`, `list-ordered`, `quote`, `code`, `table`, `link-2`.

## Regras

- ✅ Ícone sempre **antes** do texto no botão.
- ✅ Ícone sem texto exige `aria-label` (e `title` quando útil).
- ✅ `strokeWidth` padrão (2); `2.5` apenas em ícones muito pequenos que precisam de peso (ex.: limpar filtros, chevrons de colapso da sidebar).
- ❌ Não usar emoji como ícone.
- ❌ Ícone não é o único portador de significado ([`acessibilidade.md`](acessibilidade.md)).
