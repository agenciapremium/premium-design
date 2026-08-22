# E-mail transacional

A única superfície da marca que **não roda dentro do app**. O e-mail chega ao cliente sem CSS externo, sem tokens, sem tema escuro e sem garantia de que o cliente de e-mail respeite o que você escreveu — e mesmo assim precisa parecer Premium.

Esta página é o contrato: o que é invariante da marca, o que cada sistema pode variar e por que cada regra existe. Modelo de referência vivo: [`email-modelo.html`](email-modelo.html) (abra no navegador). Implementação de referência: [`src/emails/`](https://github.com/agenciapremium/tasks/tree/main/src/emails) no Tasks, sobre [React Email](https://react.email).

---

## As quatro regras que não se negociam

Nenhuma delas é preferência estética. Todas nasceram de um e-mail que chegou quebrado a um cliente real.

### 1. Cor em hex literal — a exceção legítima ao "token antes de cor"

Cliente de e-mail **não resolve `var(--premium-ink)`**. Custom properties em CSS inline são ignoradas por Outlook e pela maioria dos webmails: a declaração cai e o elemento herda preto, ou nada.

Então o e-mail é o único lugar do sistema onde hex direto é correto. Em compensação, ele **não inventa cor**: cada hex é a cópia de um token, declarado uma vez no topo do arquivo, com o nome do token de origem.

```ts
const INK    = "#0A0A0A"; // --brand-ink / --premium-ink
const BONE   = "#F2F2F2"; // --premium-bone
const MIST   = "#E5E5E5"; // --premium-mist
const STEEL  = "#4A4A4A"; // --premium-steel
const GRAY   = "#8A8A8A"; // --premium-gray
const SILVER = "#BFBFBF"; // --premium-silver
const YELLOW = "#FBDA25"; // --brand-yellow
```

> [!IMPORTANT]
> Mudou um desses tokens em [`css/tokens.css`](../css/tokens.css)? O espelho de e-mail de cada sistema muda junto — ele não acompanha sozinho. É o preço de sair do CSS.

Sem tema escuro: o e-mail é sempre a paleta clara. O modo escuro de alguns clientes (Gmail, Outlook.com) inverte cores por conta própria, e é justamente por isso que o header preto com logo **branca** e o CTA amarelo com texto **preto** funcionam nos dois cenários — não dependem do fundo que o cliente escolher.

### 2. Logo em PNG, por URL absoluta

O e-mail não tem acesso ao app, então a URL da logo é absoluta e aponta para produção. E é **PNG**: Gmail, Outlook e Yahoo **não renderizam WebP**, e o resultado é o alt text no lugar da marca.

```ts
const LOGO_URL = "https://<host-do-sistema>/brand/logo-horizontal-branca.png";
```

Sempre a versão **branca** (fundo do header é `INK`), com `alt` preenchido — parte dos clientes bloqueia imagem por padrão e o alt é o que sobra.

### 3. Centralizar imagem exige `display:block` + `margin:0 auto`

`textAlign: "center"` na Section **não centraliza `<img>` no Outlook**. A propriedade que vale é a do próprio elemento:

```tsx
<Img
  src={LOGO_URL}
  alt="Premium Marketing 360°"
  height={30}
  style={{ height: 30, width: "auto", display: "block", margin: "0 auto" }}
/>
```

O inverso vale para o **botão**: o alinhamento do CTA mora no **container**, nunca no `<a>` — `float` é ignorado por vários clientes, `textAlign` no wrapper não.

### 4. Recuo por tabela interna, nunca por padding na célula-pai

Tabelas aninhadas com `width: 100%` **vazam o padding** em alguns webmails (Titan) — o painel interno estoura a margem e encosta na borda.

A solução é não pedir recuo à célula-pai. Todo o conteúdo mora numa tabela centralizada de largura fixa; os painéis ficam a 100% **dela**, portanto sempre dentro do recuo:

```ts
const wrapper = { maxWidth: 520, width: "100%", margin: "0 auto" } as const;
```

O padding vertical fica na Section externa (`padding: "44px 0 8px"`); o horizontal é responsabilidade exclusiva do `wrapper`.

---

## Esqueleto canônico

```
┌─────────────────────────────────────────────┐  Body   BONE, padding 40px 16px
│ ┌─────────────────────────────────────────┐ │  Container 600px, branco, radius 14
│ │            [ logo branca 30px ]         │ │  Header INK, padding 40px 44px
│ ├─────────────────────────────────────────┤ │
│ │   ┌───────────────────────────────┐     │ │  wrapper 520px centralizado
│ │   │ PÍLULA DE CONTEXTO            │     │ │
│ │   │ Título 21/700 INK             │     │ │
│ │   │ Mensagem 15.5/1.7 STEEL       │     │ │
│ │   │ ┌───────────────────────────┐ │     │ │  painel BONE + borda MIST
│ │   │ │ Rótulo · valor            │ │     │ │  radius 12, padding 22/24
│ │   │ └───────────────────────────┘ │     │ │
│ │   │                  [ CTA → ]    │ │    │  CTA amarelo, à direita
│ │   ├───────────────────────────────┤     │ │  régua MIST 1px
│ │   │ rodapé 12/GRAY                │     │ │
│ │   └───────────────────────────────┘     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

| Medida | Valor |
|---|---|
| Fundo da mensagem | `BONE`, `padding: 40px 16px` |
| Container | `maxWidth: 600`, branco, `borderRadius: 14`, `overflow: hidden` |
| Header | `backgroundColor: INK`, `padding: 40px 44px` |
| Logo | altura `30`, largura automática |
| Largura útil do conteúdo | `520` (o `wrapper`) |
| Título | `21px / 700 / lineHeight 1.35`, `INK` |
| Mensagem | `15.5px / lineHeight 1.7`, `STEEL`, `whiteSpace: "pre-line"` |
| Painel de detalhe | `BONE`, borda `1px MIST`, `borderRadius: 12`, `padding: 22px 24px` |
| CTA | `YELLOW` com texto `#000000`, `700`, `padding: 14px 28px`, `borderRadius: 10`, à direita |
| Régua do rodapé | `height: 1`, `backgroundColor: MIST` |
| Rodapé | `12px / lineHeight 1.7`, `GRAY` |
| Tipografia | `"Ubuntu", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |

A **eyebrow** do e-mail segue a da UI: `letterSpacing` alto, `uppercase`, `700`. No corpo do e-mail ela vira a pílula de contexto (10.5px / `0.12em`); nos painéis de valor, rótulo de 12px / `0.22em` em `GRAY`.

---

## Pílula de contexto

A primeira linha do corpo responde **"por que estou recebendo isto"** antes de a pessoa ler o título. É a eyebrow em formato de pílula (`borderRadius: 999`), com o par cor/fundo espelhando os badges de status da UI:

| Tom | Fundo | Texto | Token de origem |
|---|---|---|---|
| `info` | `#E6F1FA` | `#1A6FB0` | `--info-bg` / `--info` |
| `violeta` | `#EDE9FB` | `#6E56CF` | `--violet-bg` / `--violet` |
| `atencao` | `#FFF3DB` | `#C97A0F` | `--warning-bg` / `--warning` |
| `sucesso` | `#E6F4EA` | `#1E8E4A` | `--success-bg` / `--success` |
| `perigo` | `#FBE9E7` | `#C0322B` | `--danger-bg` / `--danger` |

---

## Um template, dois contextos

Um mesmo modelo atende **equipe e cliente**. O que muda é a pílula, a copy e o destino do botão — **nunca a estrutura**. Dois templates para a mesma mensagem é o começo de dois layouts que divergem na terceira correção.

O mesmo vale para o e-mail de senha, que atende colaborador e cliente do portal por um parâmetro de contexto na frase, não por um arquivo separado.

## Rodapé: por que você recebeu e como desligar

Todo e-mail de notificação termina explicando **por que a pessoa recebeu** e **como desligar**, seguido da assinatura da agência. É o que separa a mensagem de spam aos olhos de quem recebe — e, na prática, o que evita que o domínio seja marcado.

Notificação por e-mail nasce **desligada**: é opt-in do destinatário, tanto para a equipe quanto para o cliente.

## Voz

A mesma da UI ([`ui-guidelines.md`](ui-guidelines.md) §8): pt-BR formal, sempre acentuado, direto, **sem emoji**. O assunto e o texto de preview (`<Preview>`) são os primeiros 120 caracteres úteis — escreva-os para serem lidos na lista, não depois de abertos.

---

## Prototipar antes de implementar

O layout é **aprovado em HTML standalone antes** de virar componente. O protótipo mostra as variantes empilhadas para comparação; no e-mail real cada uma chega sozinha. Só depois de aprovado nasce o `.tsx`, que declara no próprio comentário qual protótipo espelha.

Vale o trabalho porque e-mail não tem hot reload: cada rodada de ajuste passa por enviar de verdade e abrir em Gmail, Outlook e Titan.

## Checklist antes de enviar

- [ ] Cores em hex literal, todas espelhando token, declaradas no topo do arquivo.
- [ ] Logo PNG, URL absoluta de produção, versão branca, `alt` preenchido.
- [ ] Logo com `display: block` + `margin: 0 auto` (não confie no `textAlign` do pai).
- [ ] Conteúdo dentro do `wrapper` de 520px; nenhum padding horizontal na célula-pai.
- [ ] CTA alinhado pelo container (`textAlign: "right"`), nunca por `float`.
- [ ] `<Preview>` escrito — não deixe o cliente de e-mail escolher o trecho.
- [ ] Rodapé diz por que a pessoa recebeu e como desligar.
- [ ] Aberto de verdade em Gmail, Outlook e Titan (o Titan é o que pega vazamento de padding).

---

## Divergência conhecida

Os e-mails de **autenticação** (link mágico, redefinição de senha) do Tasks vieram antes deste esqueleto e usam container de `560px` com padding direto na Section, logo de até `220px` e sombra no container. As quatro regras invariantes eles já cumprem — o que difere são as medidas.

Ao tocar nesses arquivos, migre para o esqueleto canônico. Enquanto isso não acontece, **não copie as medidas deles** para um e-mail novo.
