/**
 * Formatação pt-BR compartilhada (change financeiro-fundacao). `formatCurrency`
 * é a única forma de exibir dinheiro no sistema — nunca formatar à mão.
 */

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompacto = new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL" });

/** R$ 1.234,56 — aceita number, string decimal do Prisma ou Decimal serializado. */
export function formatCurrency(valor: number | string): string {
  const n = typeof valor === "string" ? Number(valor) : valor;
  return brl.format(Number.isFinite(n) ? n : 0);
}

/** R$ 1,2 mil — moeda compacta para eixos/tooltips de gráficos. */
export function moedaCompacta(valor: number): string {
  return brlCompacto.format(Number.isFinite(valor) ? valor : 0);
}

/** Data date-only (vencimento/baixa) em pt-BR sem deriva de fuso. */
export function formatDateOnly(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Data de um INSTANTE (timestamp) no fuso da agência — America/Porto_Velho,
 * GMT-4 fixo, o mesmo de `horaNaAgencia`. Diferente de `formatDateOnly`, que é
 * para campos date-only e por isso lê em UTC: aplicar UTC a um timestamp real
 * mostra o dia seguinte para qualquer coisa gravada depois das 20h na agência.
 */
export function formatDateAgencia(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", { timeZone: "America/Porto_Velho" });
}

const diaHoraAgencia = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Porto_Velho",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * `dd/mm hh:mm` de um instante, no fuso da agência. O fuso fixo também evita
 * divergência de hidratação: servidor (UTC) e navegador escrevem o mesmo texto.
 */
export function formatDiaHoraAgencia(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  const p = Object.fromEntries(diaHoraAgencia.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`;
}
