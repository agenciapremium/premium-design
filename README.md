# Premium Design

Identidade visual da **Agência Premium** (PREMIUM · MARKETING 360°): tokens de design, tema Tailwind v4 e a documentação completa do design system. Este repositório é a **fonte da verdade** da identidade entre os sistemas da agência (Tasks, Central de Mídia, Ultra Popular, portais).

- Acento de marca: **amarelo Premium** (`--brand-yellow #FBDA25`) sobre **preto Premium** (`--brand-ink #0A0A0A`). Símbolo: troféu.
- Dois temas, uma implementação: só a camada semântica `--c-*` muda em `html.dark`.
- Tipografia: **Ubuntu** (300/400/500/700) — a fonte não é embutida; cada app a carrega (next/font, `@font-face` ou `<link>`) e o pacote a usa por `var(--font-ubuntu, "Ubuntu")`: com `next/font`, declare a variável `--font-ubuntu`.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| [`css/premium.css`](css/premium.css) | Entrada única — importa tokens + tema + base + motion. |
| [`css/tokens.css`](css/tokens.css) | Camada 1A (marca crua `--brand-*`) + 1B (semântica `--c-*`) + escala neutra `--premium-*`, status, raios, sombras, easing, code theme — claro e escuro. |
| [`css/theme.css`](css/theme.css) | Ponte Tailwind v4: `@custom-variant dark` + `@theme inline` (utilities `bg-surface`, `text-ink`, `bg-brand`, …). |
| [`css/base.css`](css/base.css) | Base global: `body`, `::selection` amarela, scrollbar, `.eyebrow`. |
| [`css/motion.css`](css/motion.css) | Keyframes de identidade (`fadeIn`, `flash-novo`, `timer-pulse`, View Transitions), todos sob `prefers-reduced-motion`. |
| [`brand/`](brand/) | **Logo oficial** (horizontal, vertical e ícone, em branco e preto) e favicons, os mesmos arquivos de `public/brand/` do Tasks. Regras de uso em [`docs/index.md`](docs/index.md#logo). |
| [`css/patterns/`](css/patterns/) | **Padrões de projeto (opt-in)** — CSS de recursos que nem todo sistema tem. Se o seu sistema implementar o recurso, importe o padrão em vez de recriar o visual. |
| [`docs/`](docs/) | Documentação completa do design system — comece por [`docs/index.md`](docs/index.md). O [`docs/showroom.html`](docs/showroom.html) demonstra tudo ao vivo nos dois temas (abra no navegador). |
| [`registry.json`](registry.json), [`registry/`](registry/) e [`public/r/`](public/r/) | **Catálogo de componentes** no formato de registry do shadcn (v0.24.0): as peças copiadas do Tasks, a peça base e o JSON de cada peça, servido pela tag. Gerados por `npm run catalogo:sincronizar`; nunca edite à mão. Ver [Catálogo de componentes](#catálogo-de-componentes). |
| [`scripts/sincronizar-catalogo.mjs`](scripts/sincronizar-catalogo.mjs) | Sincronização do catálogo a partir do Tasks e o modo `--verificar`. |

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
@import "@agenciapremium/premium-design/patterns/sidebar.css";        /* sidebar colapsável 248↔64px */
@import "@agenciapremium/premium-design/patterns/editor-rico.css";    /* editor rico + leitura de Markdown */
@import "@agenciapremium/premium-design/patterns/drive-link.css";     /* chip drive:// "clique para copiar" */
@import "@agenciapremium/premium-design/patterns/kanban.css";         /* scrollbar fina da coluna do kanban */
@import "@agenciapremium/premium-design/patterns/code-block.css";     /* realce de sintaxe (.tok-*) + rolagem */
@import "@agenciapremium/premium-design/patterns/autosave.css";       /* barra indeterminada do auto-save */
@import "@agenciapremium/premium-design/patterns/pilha-rolagem.css";  /* rolagem sem barra, com degradê (alerta fixo, painel) */
@import "@agenciapremium/premium-design/patterns/pilula.css";         /* pílula de ação e de seleção fora da barra */
@import "@agenciapremium/premium-design/patterns/tooltip.css";        /* atraso da dica (--tt-delay, data-tooltip-group) */
@import "@agenciapremium/premium-design/patterns/blocknote.css";      /* editor de blocos BlockNote nos tokens */
```

Cada arquivo documenta no cabeçalho o **contrato com o app** (classes e atributos esperados na marcação — ex.: a sidebar exige `data-sidebar-collapsed` estampado pré-hidratação). O comportamento (JS/React) é implementação de cada app; o padrão garante que o **visual** seja idêntico entre sistemas.

### Projeto sem Tailwind

```css
@import "@agenciapremium/premium-design/tokens.css";
@import "@agenciapremium/premium-design/base.css";
@import "@agenciapremium/premium-design/motion.css";
```

E use os tokens direto: `var(--c-surface)`, `var(--brand-yellow)`, etc.

## Catálogo de componentes

Desde a v0.24.0, os componentes do Tasks que não dependem do domínio dele (os primitivos de `src/components/ui/`, a `FilterBar`, o `Fab`, o card de seção de configurações e as funções de apoio) são copiáveis por um comando, no formato de registry do shadcn. **Sistema novo nunca reescreve componente do catálogo: copia pelo comando.**

### Pré-requisitos

- Next.js com App Router e o código em `src/`.
- Tailwind CSS v4.
- Alias `@/*` apontando para `src/*` no `tsconfig.json` (o padrão do `create-next-app` com `src/`).

As peças mantêm os imports do Tasks (`@/lib/motion`, `@/lib/hooks/use-dialogo-foco`, `@/components/ui/tooltip`) e são gravadas no mesmo caminho que têm lá (`src/components/ui/`, `src/lib/`, `src/lib/hooks/`). Por isso compilam sem nenhuma reescrita quando o alias é esse.

### `components.json`

O `shadcn add` lê o `components.json` da raiz do projeto. Crie o arquivo à mão, com este conteúdo, em vez de rodar `npx shadcn init`: o `init` grava o próprio `src/lib/utils.ts` e mexe no `globals.css`, e o `add` não sobrescreve um arquivo que já existe sem `--overwrite`.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@premium": "https://raw.githubusercontent.com/agenciapremium/premium-design/v0.24.0/public/r/{name}.json"
  }
}
```

### Comando

Por URL fixada na tag, sem configurar nada além do `components.json`:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/agenciapremium/premium-design/v0.24.0/public/r/filter-bar.json
```

Ou pelo namespace `@premium` do `components.json` acima:

```bash
npx shadcn@latest add @premium/filter-bar @premium/slide-over @premium/confirm-dialog @premium/card-secao
```

O comando copia a peça, as peças de que ela depende (cada uma declara as outras em `registryDependencies`, por URL fixada na mesma tag), a peça base e instala os pacotes npm declarados (`motion`, `lucide-react` e, no `emoji-picker`, o `emoji-mart`). `react`, `react-dom` e `next` não são instalados: o projeto já os tem. A tag fixa a versão: a peça copiada é a da v0.24.0, mesmo que a `main` avance. Atualizar é trocar a tag e copiar de novo.

### Peça base e CSS

Toda peça visual depende de `premium-base`, que grava em `src/styles/premium/` o núcleo do `css/` deste repo (`tokens.css`, `theme.css`, `base.css`, `motion.css`) e os padrões de `css/patterns/` que as peças usam: `autosave.css` (`autosave-bar`, `slide-over`), `code-block.css` (`code-block`), `kanban.css` (`select`), `pilha-rolagem.css` (`painel-cards`), `pilula.css` (`pilula`, e por ela a `FilterBar`) e `tooltip.css` (`tooltip`). Importe-os no `globals.css`, depois do Tailwind:

```css
@import "tailwindcss";
@import "../styles/premium/tokens.css";
@import "../styles/premium/theme.css";
@import "../styles/premium/base.css";
@import "../styles/premium/motion.css";
@import "../styles/premium/patterns/autosave.css";
@import "../styles/premium/patterns/code-block.css";
@import "../styles/premium/patterns/kanban.css";
@import "../styles/premium/patterns/pilha-rolagem.css";
@import "../styles/premium/patterns/pilula.css";
@import "../styles/premium/patterns/tooltip.css";
```

Quem já consome o pacote (`@import "@agenciapremium/premium-design"`, acima) pode manter esse import e importar só os padrões, desde que a tag do pacote seja a mesma do catálogo. A fonte Ubuntu continua por conta do app (variável `--font-ubuntu`).

### FilterBar: gravação dos filtros e views salvas

Sem provedor, a `FilterBar` filtra pela URL normalmente, mas **não grava os filtros da tela e não mostra o menu de views salvas**, mesmo com `telaKey`. Para ligar os dois, declare o `FiltrosPersistenciaProvider` (peça `filtros-persistencia`) num layout acima das telas, com um objeto estável (constante de módulo) que implementa o contrato `FiltrosPersistencia`: `carregarFiltros`, `salvarFiltros` e `limparFiltros` (o último filtro de cada `telaKey`) e `listarViews`, `salvarView`, `renomearView`, `excluirView`, `definirViewPadrao` e `restaurarView` (as views salvas). O menu de views usa o `useToast`, então o `ToastProvider` (peça `toast`) fica acima também.

```tsx
"use client";
import type { ReactNode } from "react";
import { FiltrosPersistenciaProvider, type FiltrosPersistencia } from "@/components/ui/filtros-persistencia";
import { ToastProvider } from "@/components/ui/toast";

// Cada método chama o backend do sistema (server action, rota de API, localStorage).
const persistencia: FiltrosPersistencia = {
  /* carregarFiltros, salvarFiltros, limparFiltros, listarViews, salvarView,
     renomearView, excluirView, definirViewPadrao, restaurarView */
};

export function Persistencia({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <FiltrosPersistenciaProvider persistencia={persistencia}>{children}</FiltrosPersistenciaProvider>
    </ToastProvider>
  );
}
```

No Tasks, a ligação é `src/components/layout/filtros-persistencia-tasks.tsx`, que chama as server actions de preferências; ela fica fora do catálogo porque é domínio.

Com o Next 16 e `cacheComponents`, a tela que usa a `FilterBar` (que lê `useSearchParams`) precisa de um `<Suspense>` acima dela.

### Peças

A lista completa, com dependências e arquivos, está em [`registry.json`](registry.json).

- **Base:** `premium-base`.
- **Ações e formulários:** `button`, `context-icon-button`, `input`, `textarea`, `select`, `multi-select`, `switch`, `date-picker`, `pessoas-picker`, `campo-busca`, `emoji-picker`, `form-error-banner`, `autosave-bar`, `copiar-link`.
- **Barra e navegação:** `filter-bar`, `filtros-persistencia`, `views-salvas-menu`, `pilula`, `segmented-tabs`, `sort-controls`, `pagination`, `breadcrumb`, `coluna-infinita`.
- **Superfícies e overlays:** `card`, `card-secao`, `slide-over`, `confirm-dialog`, `painel-cards`, `tooltip`, `toast`, `fab`, `accordion`, `expansivel`, `texto-expansivel`.
- **Estado e conteúdo:** `badge`, `avatar`, `empty-state`, `skeleton`, `code-block`, `digitando-indicador`, `botao-lido`, `grupo-prazo`, `contador`, `barra-progresso`.
- **Gráficos:** `bar-chart`, `line-chart`, `pie-chart`.
- **Motion:** `motion-provider`.
- **Hooks:** `use-dialogo-foco`, `use-toast`, `use-count-up`, `use-infinite-window`, `use-set-params`, `use-filtros-persistidos`.
- **Funções de apoio:** `utils`, `format`, `motion`, `constants`, `popover-pos`, `overlay-pilha`, `foco`, `view-transition`, `painel-cards-pos`, `kbd`, `debounce`, `link-markdown`, `view-sort`, `filtros-ativos`, `busca-filtro-url`, `views-salvas`.

Ficam fora, porque dependem do domínio do Tasks: o shell (sidebar, topbar, menu da conta), o cartão de documento, o Drive, o `Lightbox`, o `MarkdownView`, o editor rico, a presença em tempo real, a página de erro com a logo e o `PageHeader`.

### Copiar sem reescrever

- A peça copiada é o arquivo do Tasks, byte a byte. Não reescreva, não "simplifique" e não troque imports: o arquivo igual é o que permite atualizar pela tag sem perder nada.
- **Ajuste nasce no Tasks.** Se um sistema precisa de uma prop ou de uma correção numa peça, a mudança é feita no Tasks (a origem), chega ao catálogo pela sincronização e sai numa versão nova deste repo. Edição local divergente numa peça copiada é defeito de revisão.
- Composição é livre: o sistema monta as próprias telas com as peças, e o que é do domínio dele (as actions da persistência, por exemplo) fica fora delas, como no Tasks.

### Manutenção do catálogo

- A origem é o Tasks: o manifesto `src/components/ui/catalogo.json` lista as peças, e a guarda `catalogo-guarda.test.ts` de lá impede que uma peça importe domínio.
- `npm run catalogo:sincronizar` (com o Tasks em `../tasks`, ou `TASKS_DIR=<caminho>`) copia as peças para `registry/`, deriva as dependências pelos imports, gera o `registry.json`, roda `shadcn build` para `public/r/` e grava a origem (commit do Tasks e sha256 por arquivo) em `registry/origem.json`.
- `npm run catalogo:verificar` não escreve nada: compara o Tasks atual com `registry/`, `registry/origem.json`, `registry.json` e `public/r/`, lista os divergentes e sai com código 1. Rode antes de toda release.
- `registry/`, `registry.json` e `public/r/` nunca são editados à mão.

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
- **Componentes**: os primitivos React não são distribuídos como pacote npm. O modelo é **registry**: a documentação está em `docs/componentes.md`, a implementação de referência no Tasks, e as peças genéricas são copiadas pelo [catálogo](#catálogo-de-componentes), sem reescrita. O que não está no catálogo continua sendo cópia deliberada, seguindo a documentação.
- Recomendado em cada projeto consumidor: teste de paridade no CI comparando os tokens locais com os do pacote, para pegar drift automaticamente.
