/**
 * Formatação do link interno compartilhável de demanda e atividade (capabilities
 * `atividade-link-compartilhavel` e `api-link-demanda-atividade`). Sem React e
 * sem `window`: é o UM formato consumido pelo atalho de copiar da tela, pelas
 * respostas da API v1 (`link`/`linkDiscord`) e pelo `linkDiscord` dos webhooks.
 * Três superfícies entregando "o link do Discord" do mesmo registro precisam
 * produzir a mesma string, caractere por caractere.
 *
 * O formato é Markdown `[rótulo](<url>)`, e cada detalhe tem motivo:
 *
 * - **Markdown**, para colar como link clicável em comentário, doc e chat, em vez
 *   de uma URL crua que a pessoa precisa ler para saber do que se trata.
 * - **`<>` envolvendo só o destino**: é sintaxe CommonMark válida (renderiza
 *   igual, sem os sinais aparecerem) que no Discord suprime o embed de preview da
 *   URL — inútil para link interno atrás de login, e que só ocupa a conversa.
 * - **Colchetes balanceados intactos**: pares (ex.: "[NL] POST") são válidos no
 *   texto de um link Markdown, e a barra invertida polui quando o texto é colado
 *   onde não há renderização de Markdown.
 * - **Colchete sem par escapado**: um `]` solto encerraria o rótulo antes da hora
 *   e um `[` solto abriria outro link, e nos dois casos o Markdown deixa de ser um
 *   link só. É o único caso em que a barra invertida compensa.
 * - **Fallback**: título vazio geraria `[](<url>)`, um link sem texto clicável.
 */

/** Caminho da tela de detalhe da demanda. */
export const CAMINHO_DEMANDA = (id: string) => `/demandas/${id}`;

/**
 * Caminho da rota dedicada da atividade — nunca `/minhas-atividades?atividade=`,
 * que só abre o detalhe quando a atividade está no escopo de quem recebe.
 */
export const CAMINHO_ATIVIDADE = (id: string) => `/atividades/${id}`;

/** Escapa com `\` os colchetes sem par; os pares balanceados passam intactos. */
export function escaparRotulo(titulo: string): string {
  const chars = Array.from(titulo);
  const semPar = new Set<number>();
  const abertos: number[] = [];
  chars.forEach((ch, i) => {
    if (ch === "[") abertos.push(i);
    else if (ch === "]") {
      if (abertos.length > 0) abertos.pop();
      else semPar.add(i);
    }
  });
  for (const i of abertos) semPar.add(i);
  return chars.map((ch, i) => (semPar.has(i) ? `\\${ch}` : ch)).join("");
}

type ParamsLink = {
  /** Origem da URL (ex.: `window.location.origin`, `publicOrigin(request)`). */
  origem: string;
  caminho: string;
  titulo: string;
  fallback: string;
};

/** Monta o Markdown do link. */
export function linkMarkdown(params: ParamsLink): string {
  const rotulo = params.titulo.trim() ? escaparRotulo(params.titulo) : params.fallback;
  return `[${rotulo}](<${params.origem}${params.caminho}>)`;
}

/** Par entregue pela API v1 e pelos webhooks: a URL direta e o Markdown do Discord. */
export function linksInternos(params: ParamsLink): { link: string; linkDiscord: string } {
  return { link: `${params.origem}${params.caminho}`, linkDiscord: linkMarkdown(params) };
}
