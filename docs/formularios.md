# Padrões de formulário

Como o sistema coleta dados: campos, validação, erro e — central no produto — **auto-save**.

## Escolha do campo

| Necessidade | Componente | Observação |
|---|---|---|
| Texto curto (nome, título, e-mail, valor) | `Input` | Com máscara quando aplicável (monetária, telefone, CEP); trecho fixo não editável via `prefixo` (ex.: DDI `+55` no Celular) |
| Data | `Input type="date"` → `DatePicker` | Calendário custom do DS em **todo** lugar (inclusive FilterBar e popover de prazos do workflow) — o nativo não é usado. Digitação por segmentos dd/mm/aaaa com auto-avanço + ícone que abre o calendário (atalhos Hoje/Limpar) |
| Texto curto multilinha (motivo, justificativa) | `Textarea` | `min-height: 76px` |
| **Texto longo** (briefing, descrição, copy/legenda) | `RichEditor` | **Regra**: nasce com o editor, nunca `<textarea>`. Salva Markdown |
| Escolha única | `Select` | Combobox custom do DS (popover em portal) — substitui o `<select>` nativo. Busca automática a partir de 8 opções, navegação por teclado, `name` espelhado em hidden input para FormData; variante `inline` para células/pílulas |
| Escolha múltipla em formulário (departamentos, clientes de um grupo, membros do quadro) | `MultiSelect` | Badges removíveis no campo + popover com busca acento-insensível; `minSelecionados` garante um piso (ex.: 1). Para **pessoas**, use o `PessoasPicker` |
| Escolha de pessoas | `PessoasPicker` | Busca + badges com avatar (ver Padrões de interação, §"Seletor de pessoas") |
| Escolha múltipla em filtro | `FilterBar multiselect` | Dropdown de checkboxes |
| Dado curto pontual (horas, motivo de uma linha) | **Entrada rápida** | Popover ancorado ou `ConfirmDialog` com `children` |
| Comentário | `comentario-input` | Tratamento próprio (menções `@`) |

## Anatomia padrão

```
LABEL (eyebrow 11px / 700 / uppercase / --premium-gray)
┌─────────────────────────────────────────────┐
│ valor — 13px, borda --premium-mist, --r-md  │  foco: borda ink + halo --yellow-50
└─────────────────────────────────────────────┘
mensagem de erro (11px / --danger)               só quando inválido
```

- Gap entre label e campo: 7px. Campos em coluna com gap de 16px no slide-over.
- Placeholder (`--premium-gray`) **nunca substitui o label**.
- **Prefixo fixo** (`Input prefixo="+55"`): texto exibido dentro da moldura, antes do valor. Não é editável — o caret nunca entra nele — e não faz parte do valor salvo; foco e erro continuam na moldura inteira.
- Endereço estruturado (cadastro de cliente): CEP com busca ViaCEP preenchendo logradouro/bairro/cidade/UF.

## Onde o formulário vive

| Caso | Superfície |
|---|---|
| Criação/edição não-trivial (cliente, colaborador, projeto, lançamento, modelo…) | **SlideOver** com rodapé fixo (Cancelar ghost à esquerda, primária à direita) |
| Criação com 3+ campos correlacionados em passos (contrato, modelo de workflow) | **Wizard** dentro do slide-over: Dados → Resumo → Confirmação, indicador de passos no topo |
| Sub-fluxo opcional/independente (ex.: matriz de permissões no cadastro) | **Slide-over aninhado** (empilhado) — preferir ao wizard |
| Dado curto na hora (apontar horas ao concluir etapa) | **Entrada rápida**: popover/dialog compacto, foco no primeiro campo, primária desabilitada enquanto inválido |
| Detalhe complexo com abas | Rota dedicada + auto-save |

## Auto-save (regra de negócio)

Editar registro **existente** persiste **automaticamente** — sem botão "Salvar". Botão fica reservado à **criação** e a **ações intencionais/sensíveis** (definir senha, gerar token, ações em lote). Nunca senha/credencial em auto-save.

**Gatilhos por tipo de campo** (enviando apenas o campo alterado — action parcial com Zod `.partial()`):

| Tipo | Gatilho |
|---|---|
| Texto livre (input/textarea/editor) | **on-blur** (`commit`) — opcionalmente `commitDebounced` enquanto digita (padrão 500ms) |
| Seleção (select, data, toggle/checkbox) | **on-change** imediato (`commit`) |
| Valor igual ao último salvo | não dispara gravação |

**Feedback**: barra de progresso indeterminada no topo do painel — `SlideOver loading` ou `AutoSaveBar` em superfícies full-page. Nunca spinner de botão para auto-save.

**Falha**: **reverter** o campo ao último valor salvo e sinalizar — nunca perder a edição em silêncio nem deixar a tela divergente do servidor. O hook faz a reversão sozinho e notifica via `onError`.

**Padrão técnico** (não reimplementar): hook `useAutoSave` (`src/lib/hooks/use-auto-save.ts`) + `debounce` (`src/lib/debounce.ts`). Recebe `{ initial, save, debounceMs?, onError? }` e devolve `{ values, isSaving, setLocal, commit, commitDebounced, revert }`. Consumidores de referência: `atividade-detail.tsx`, `colaborador-list.tsx`.

```tsx
// Esqueleto típico de edição com auto-save
const auto = useAutoSave({
  initial: { nome: cliente.nome, grupoId: cliente.grupoId },
  save: (patch) => updateCliente(cliente.id, patch),
  onError: () => { /* sinalizar; o hook já reverteu o campo */ },
});

<SlideOver open onClose={...} title="Editar cliente" loading={auto.isSaving}>
  <Input label="Nome" value={auto.values.nome}
         onChange={(e) => auto.setLocal("nome", e.target.value)}
         onBlur={() => auto.commit("nome")} />
  <Select label="Grupo" value={auto.values.grupoId}
          onChange={(e) => auto.commit("grupoId", e.target.value)} ... />
</SlideOver>
```

## Validação e erro

1. **Erro de campo** → associado ao campo (`Input error="Informe um e-mail válido."`): borda `--danger` + mensagem 11px. Não usar só cor.
2. **Erro geral de submit/ação** → `FormErrorBanner` inline (`role="alert"`) no topo do formulário ou dentro do `ConfirmDialog` (prop `error`), mantendo a superfície aberta.
3. **Microcopy de erro**: o que aconteceu + o que fazer. _"Não conseguimos gerar o boleto. Verifique os dados do cliente no Asaas e tente novamente."_
4. **Obrigatoriedade**: nos campos custom (ex.: `Select required`), `required` é apenas advisory (`aria-required`) — a validação que vale é a do servidor (Zod).

> [!CAUTION]
> Proibido: erro em **toast**; janelas nativas (`window.alert/confirm/prompt` — barradas por lint); perder dados digitados ao falhar.

## Submissão (criação)

- Botão primário no rodapé fixo do slide-over; durante o submit: `disabled` + spinner pequeno no botão ("Salvando...").
- Formulários por `FormData` com componentes controlados (RichEditor, DatePicker) espelham o valor em `<input type="hidden" name=...>`.
- Sucesso: fecha o painel + `toast.success("Cliente salvo.")`; listas atualizam (refresh/otimista).

## Checklist

- [ ] Campo certo para o dado (texto longo = RichEditor; data = DatePicker; escolha múltipla = MultiSelect; pessoas = PessoasPicker).
- [ ] Labels eyebrow com `htmlFor`; placeholders não substituem labels.
- [ ] Edição auto-salva (parcial); criação tem botão; sensível tem ação dedicada.
- [ ] Erro de campo no campo; erro geral em banner; nunca toast/janela nativa.
- [ ] Feedback de gravação (barra indeterminada) + reversão em falha.
- [ ] Estado serializável (criação via FAB; filtros em `searchParams`).
