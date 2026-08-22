# Premium Design

Identidade visual da **Agência Premium** (PREMIUM · MARKETING 360°): tokens de design, tema Tailwind v4 e a documentação completa do design system. Este repositório é a **fonte da verdade** da identidade entre os sistemas da agência (Tasks, Central de Mídia, Ultra Popular, portais).

- Acento de marca: **amarelo Premium** (`--brand-yellow #FBDA25`) sobre **preto Premium** (`--brand-ink #0A0A0A`). Símbolo: troféu.
- Dois temas, uma implementação: só a camada semântica `--c-*` muda em `html.dark`.
- Tipografia: **Ubuntu** (300/400/500/700) — a fonte não é embutida; cada app a carrega (next/font, `@font-face` ou `<link>`).

## Estrutura

| Caminho | Conteúdo |
|---|---|
| [`css/premium.css`](css/premium.css) | Entrada única — importa tokens + tema + base + motion. |
| [`css/tokens.css`](css/tokens.css) | Camada 1A (marca crua `--brand-*`) + 1B (semântica `--c-*`) + escala neutra `--premium-*`, status, raios, sombras, easing, code theme — claro e escuro. |
| [`css/theme.css`](css/theme.css) | Ponte Tailwind v4: `@custom-variant dark` + `@theme inline` (utilities `bg-surface`, `text-ink`, `bg-brand`, …). |
| [`css/base.css`](css/base.css) | Base global: `body`, `::selection` amarela, scrollbar, `.eyebrow`. |
| [`css/motion.css`](css/motion.css) | Keyframes de identidade (`fadeIn`, `flash-novo`, `timer-pulse`, View Transitions), todos sob `prefers-reduced-motion`. |
| [`css/patterns/`](css/patterns/) | **Padrões de projeto (opt-in)** — CSS de recursos que nem todo sistema tem. Se o seu sistema implementar o recurso, importe o padrão em vez de recriar o visual. |
| [`docs/`](docs/) | Documentação completa do design system — comece por [`docs/index.md`](docs/index.md). O [`docs/showroom.html`](docs/showroom.html) demonstra tudo ao vivo nos dois temas (abra no navegador). |

## Como consumir

### Instalação (dependência git pinada em tag)

```jsonc
// package.json do projeto consumidor
"dependencies": {
  "@agenciapremium/premium-design": "github:agenciapremium/premium-design#v0.1.0"
}
```

Atualizar = trocar a tag e reinstalar. Nunca aponte para `#main` — sempre uma tag, para a atualização ser deliberada.

### Projeto com Tailwind v4 (CSS-first)

```css
/* globals.css */
@import "tailwindcss";
@import "@agenciapremium/premium-design";
```

Pronto: tokens nos dois temas, variante `dark:` por classe (`html.dark`) e utilities semânticas (`bg-surface`, `text-ink`, `border-border`, `bg-brand`, `text-danger`, …). O toggle de tema do app estampa/remove `.dark` no `<html>` (chave localStorage `premium-theme`; sem escolha salva, siga `prefers-color-scheme`).

### Padrões de projeto (opt-in)

O `premium.css` traz só o núcleo. Os padrões de recurso são importados **apenas pelos sistemas que têm o recurso** — regra: se o sistema implementa o recurso, ele importa o padrão em vez de recriar o visual.

```css
/* depois do import principal, conforme o sistema precisar: */
@import "@agenciapremium/premium-design/patterns/sidebar.css";      /* sidebar colapsável 248↔64px */
@import "@agenciapremium/premium-design/patterns/editor-rico.css";  /* editor rico + leitura de Markdown */
@import "@agenciapremium/premium-design/patterns/drive-link.css";   /* chip drive:// "clique para copiar" */
@import "@agenciapremium/premium-design/patterns/kanban.css";       /* scrollbar fina da coluna do kanban */
@import "@agenciapremium/premium-design/patterns/code-block.css";   /* realce de sintaxe (.tok-*) + rolagem */
@import "@agenciapremium/premium-design/patterns/autosave.css";     /* barra indeterminada do auto-save */
```

Cada arquivo documenta no cabeçalho o **contrato com o app** (classes e atributos esperados na marcação — ex.: a sidebar exige `data-sidebar-collapsed` estampado pré-hidratação). O comportamento (JS/React) é implementação de cada app; o padrão garante que o **visual** seja idêntico entre sistemas.

### Projeto sem Tailwind

```css
@import "@agenciapremium/premium-design/tokens.css";
@import "@agenciapremium/premium-design/base.css";
@import "@agenciapremium/premium-design/motion.css";
```

E use os tokens direto: `var(--c-surface)`, `var(--brand-yellow)`, etc.

## Regras de uso (resumo)

1. **Token antes de cor.** Nenhum componente usa hex direto — toda cor passa por `var(--token)`. É isso que faz o tema escuro funcionar "de graça".
2. **Amarelo é assinatura.** `--brand-yellow` sobre tinta escura (FAB, seleção de texto, hover de destaque). Nunca amarelo como texto sobre fundo claro (não passa AA) — no escuro, use os pares calibrados (`--gold-bg`, `--timer-idle`).
3. **`--yellow-50` é só anel de foco.** Para fundo amarelo suave, use `--gold-bg` (tem par escuro próprio).
4. **Acessível por padrão.** Contraste AA, foco visível, alvo ≥ 40px, `prefers-reduced-motion` em toda animação.
5. **pt-BR formal e acentuado, sem emoji em UI de produção.**

A regra 1 tem exatamente **duas exceções**, ambas documentadas — e nenhuma delas é "achei mais fácil assim":

- **E-mail** ([`docs/email.md`](docs/email.md)): cliente de e-mail não resolve `var(--token)`, então é hex literal. Mas cada hex é cópia de um token, declarado no topo do arquivo.
- **Cor de dado** ([`docs/tokens.md`](docs/tokens.md#cor-de-dado--paleta-fechada-de-cadastro)): cor escolhida pelo usuário e gravada no banco (departamento, motivo de ausência) é dado, não estilo. Lista **fechada** de dez valores espelhando tokens; seletor livre de cor, nunca.

A referência completa está em [`docs/`](docs/) — em especial [`docs/ui-guidelines.md`](docs/ui-guidelines.md) (regras de uso) e [`docs/componentes.md`](docs/componentes.md) (catálogo de primitivos, cuja implementação de referência vive no repositório [Tasks](https://github.com/agenciapremium/tasks)).

## Governança

- **Este repo é a fonte da verdade.** Elemento visual novo (token, padrão, regra) nasce **aqui** — via PR — e chega aos projetos por bump de versão (tag). Nenhum projeto cria token local por fora do CSS importado.
- **Versionamento semver**: correção de valor = patch; token/padrão novo = minor; remoção ou renomeação de token = major (com nota de migração no CHANGELOG).
- **Componentes**: os primitivos React não são distribuídos como pacote (dependem de internals de cada app). O modelo é **registry**: o catálogo canônico está em `docs/componentes.md`, a implementação de referência no Tasks, e cada projeto copia e adapta deliberadamente.
- Recomendado em cada projeto consumidor: teste de paridade no CI comparando os tokens locais com os do pacote, para pegar drift automaticamente.
