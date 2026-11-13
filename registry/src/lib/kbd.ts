/**
 * Estilo do `kbd`, o mesmo já usado na dica de `Ctrl K` da topbar. Quatro
 * superfícies desenham teclas (topbar, painel de atalhos, FAB e menu), e elas
 * precisam ser a mesma tecla aos olhos de quem vê.
 *
 * Mora num módulo próprio, sem dependência de domínio, para o FAB entrar no
 * catálogo do premium-design sem levar o registro de atalhos, que importa o
 * menu e as ferramentas do Tasks (change catalogo-componentes-premium-design,
 * D7). `src/lib/atalhos.ts` reexporta a constante.
 */
export const CLASSE_KBD =
  "text-[10px] leading-none bg-[var(--premium-white)] border border-[var(--premium-mist)] rounded px-[6px] py-[3px] text-[var(--premium-gray)] font-[family-name:var(--font-ubuntu),system-ui,sans-serif] shrink-0";
