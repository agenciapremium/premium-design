"use client";

/**
 * Gráfico de pizza/rosca em SVG próprio (change financeiro-polish-dashboard-
 * filtros, design D4 — mesmo racional do bar-chart: sem lib, cores só por
 * token, claro/escuro automáticos). Acessibilidade: role="img" + descrição,
 * <title> por fatia; a legenda traz os valores completos (valor + %).
 *
 * Entrada animada (change animacoes-graficos-abas-transicoes): as fatias
 * revelam com fade escalonado (o donut "monta"). Fatias preenchidas não combinam
 * com `pathLength` (que anima traço, não preenchimento), por isso o reveal
 * escalonado em vez do "desenho". Sob reduced-motion o fade fica imperceptível.
 */

import { m } from "motion/react";
import { moedaCompacta } from "@/lib/format";
import { EASE } from "@/lib/motion";

export interface PieSlice {
  label: string;
  valor: number;
}

interface PieChartProps {
  dados: PieSlice[];
  descricao: string;
  tamanho?: number;
  /**
   * Formatação dos valores (centro/tooltips/legenda). Padrão: moeda compacta
   * (uso financeiro). Gráficos de contagem passam um formatador de inteiros.
   */
  formatarValor?: (valor: number) => string;
}

/** Paleta categórica pelos tokens de badge — legível nos dois temas. */
const PALETA = [
  "var(--violet)",
  "var(--teal)",
  "var(--info)",
  "var(--warning)",
  "var(--success)",
  "var(--danger)",
  "var(--slate)",
  "var(--amber)",
];

function arco(cx: number, cy: number, r: number, inicio: number, fim: number): string {
  const a0 = 2 * Math.PI * inicio - Math.PI / 2;
  const a1 = 2 * Math.PI * fim - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const grande = fim - inicio > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${grande} 1 ${x1} ${y1} Z`;
}

export function PieChart({ dados, descricao, tamanho = 168, formatarValor = moedaCompacta }: PieChartProps) {
  const formatar = formatarValor;
  const total = dados.reduce((s, d) => s + d.valor, 0);
  if (total <= 0) return null;

  const cx = tamanho / 2;
  const cy = tamanho / 2;
  const r = tamanho / 2 - 2;

  // Offsets cumulativos sem mutação (regra react-hooks/immutability): a soma dos
  // anteriores é derivada por índice. `dados` costuma ter poucas fatias.
  const fatias = dados.map((d, i) => {
    const anteriores = dados.slice(0, i).reduce((s, x) => s + x.valor, 0);
    const inicio = anteriores / total;
    const fim = (anteriores + d.valor) / total;
    return { ...d, inicio, fim, cor: PALETA[i % PALETA.length], pct: Math.round((d.valor / total) * 100) };
  });

  return (
    <figure className="m-0 flex flex-wrap items-center gap-5">
      <svg role="img" aria-label={descricao} viewBox={`0 0 ${tamanho} ${tamanho}`} width={tamanho} height={tamanho} className="shrink-0">
        <title>{descricao}</title>
        {fatias.length === 1 ? (
          <circle cx={cx} cy={cy} r={r} fill={fatias[0].cor}>
            <title>{`${fatias[0].label}: ${formatar(fatias[0].valor)} (100%)`}</title>
          </circle>
        ) : (
          fatias.map((f, i) => (
            <m.path
              key={f.label}
              d={arco(cx, cy, r, f.inicio, f.fim)}
              fill={f.cor}
              stroke="var(--premium-white)"
              strokeWidth={1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, ease: EASE, delay: i * 0.06 }}
            >
              <title>{`${f.label}: ${formatar(f.valor)} (${f.pct}%)`}</title>
            </m.path>
          ))
        )}
        {/* furo do donut */}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--premium-white)" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--premium-ink)">
          {formatar(total)}
        </text>
      </svg>
      <figcaption className="flex flex-col gap-1.5 min-w-0">
        {fatias.map((f) => (
          <span key={f.label} className="inline-flex items-center gap-2 text-[12px]">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: f.cor }} />
            <span className="truncate text-[var(--premium-steel)]">{f.label}</span>
            <span className="ml-auto font-medium whitespace-nowrap">{formatar(f.valor)}</span>
            <span className="text-[var(--premium-gray)] w-9 text-right">{f.pct}%</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
