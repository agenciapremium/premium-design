/**
 * Datas do `DatePicker`, sem fuso: ISO "yyyy-mm-dd", a exibição dd/mm/aaaa e os
 * segmentos digitados (dia, mês e ano). Funções puras.
 */

export const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
/** "yyyy-mm-dd" → "dd/mm/aaaa" (date-only, sem fuso). */
export function formatBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}
export function toISO(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export type Segmentos = { dd: string; mm: string; yyyy: string };
export const SEG_VAZIO: Segmentos = { dd: "", mm: "", yyyy: "" };

/** "yyyy-mm-dd" → segmentos { dd, mm, yyyy }; vazio se não for ISO válido. */
export function splitISO(iso: string): Segmentos {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return { ...SEG_VAZIO };
  const [, yyyy = "", mm = "", dd = ""] = m;
  return { dd, mm, yyyy };
}

/** dia/mês/ano → ISO "yyyy-mm-dd" válido ou null. Date-only, sem `new Date(texto)`. */
export function segParaISO(seg: Segmentos): string | null {
  if (!seg.dd || !seg.mm || seg.yyyy.length !== 4) return null;
  const dia = Number(seg.dd);
  const mes = Number(seg.mm);
  const ano = Number(seg.yyyy);
  if (mes < 1 || mes > 12) return null;
  // Dia 0 do mês seguinte (mês 1-based aqui) = último dia do mês → cobre bissexto.
  const diasNoMes = new Date(ano, mes, 0).getDate();
  if (dia < 1 || dia > diasNoMes) return null;
  return toISO(ano, mes - 1, dia);
}
