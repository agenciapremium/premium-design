"use client";

/**
 * Gráfico de barras agrupadas em SVG próprio (change financeiro-relatorios,
 * design D4). Primitivo novo justificado: o catálogo não tinha componente de
 * gráfico e nenhuma lib de chart existe no projeto — SVG próprio mantém a
 * disciplina de tokens (claro/escuro automáticos). Acessibilidade: role="img"
 * + descrição; a tabela adjacente é a fonte completa dos dados. A largura
 * acompanha o container (ResizeObserver) para ocupar toda a extensão; abaixo
 * do mínimo legível, entra o scroll horizontal.
 */

import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { moedaCompacta } from "@/lib/format";
import { EASE } from "@/lib/motion";

export interface BarChartSerie {
  label: string;
  /** Token semântico de cor (ex.: "var(--success)"). Nunca hex. */
  cor: string;
  valores: number[];
}

export interface BarChartLinha {
  label: string;
  /** Token semântico de cor. */
  cor: string;
  valores: number[];
}

interface BarChartProps {
  categorias: string[];
  series: BarChartSerie[];
  /**
   * Série de linha sobreposta (ex.: saldo acumulado). Escala PRÓPRIA
   * (suporta negativos) — os valores exatos ficam nos tooltips e na tabela
   * adjacente, como nas barras.
   */
  linha?: BarChartLinha;
  descricao: string;
  altura?: number;
  /**
   * Marco vertical ANTES de uma categoria (ex.: "preferências adotadas" no
   * gráfico de ajustes do QG): linha tracejada em `--premium-steel` com o
   * rótulo, entre a categoria `antesDe - 1` e a `antesDe`. O texto alternativo
   * do gráfico deve mencionar o marco (quem chama monta a `descricao`).
   */
  marco?: { antesDe: number; rotulo: string };
  /**
   * Formatação dos valores do eixo/tooltips. Padrão: moeda compacta (uso
   * financeiro). Gráficos de contagem (ex.: Dashboard de Quadros) passam um
   * formatador de inteiros para não exibir valores como moeda.
   */
  formatarValor?: (valor: number) => string;
}

export function BarChart({ categorias, series, linha, marco, descricao, altura = 220, formatarValor = moedaCompacta }: BarChartProps) {
  const formatar = formatarValor;
  const minimo = Math.max(480, categorias.length * 72);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(minimo);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entrada]) => {
      const w = Math.floor(entrada.contentRect.width);
      if (w > 0) setLargura(Math.max(minimo, w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [minimo]);

  const margem = { topo: 12, direita: 8, base: 28, esquerda: 64 };
  const areaW = largura - margem.esquerda - margem.direita;
  const areaH = altura - margem.topo - margem.base;
  const max = Math.max(1, ...series.flatMap((s) => s.valores));
  const passoCategoria = areaW / Math.max(1, categorias.length);
  const larguraBarra = Math.min(40, (passoCategoria - 12) / Math.max(1, series.length));

  const linhasGrade = [0, 0.25, 0.5, 0.75, 1];

  // Escala própria da linha (pode ser negativa — ex.: saldo acumulado).
  const linhaMin = linha ? Math.min(0, ...linha.valores) : 0;
  const linhaMax = linha ? Math.max(1, ...linha.valores) : 1;
  const yLinha = (v: number) =>
    margem.topo + areaH * (1 - (v - linhaMin) / Math.max(1e-9, linhaMax - linhaMin));
  const xCategoria = (i: number) => margem.esquerda + i * passoCategoria + passoCategoria / 2;

  return (
    <figure className="m-0">
      <div ref={wrapRef} className="overflow-x-auto">
        <svg
          role="img"
          aria-label={descricao}
          viewBox={`0 0 ${largura} ${altura}`}
          width={largura}
          height={altura}
        >
          <title>{descricao}</title>
          {linhasGrade.map((p) => {
            const y = margem.topo + areaH * (1 - p);
            return (
              <g key={p}>
                <line x1={margem.esquerda} x2={largura - margem.direita} y1={y} y2={y} stroke="var(--premium-mist)" strokeWidth={1} />
                <text x={margem.esquerda - 6} y={y + 3} textAnchor="end" fontSize={9} fill="var(--premium-gray)">
                  {formatar(max * p)}
                </text>
              </g>
            );
          })}
          {categorias.map((cat, i) => {
            const x0 = margem.esquerda + i * passoCategoria + (passoCategoria - larguraBarra * series.length) / 2;
            return (
              <g key={cat}>
                {series.map((s, j) => {
                  const v = s.valores[i] ?? 0;
                  const h = (v / max) * areaH;
                  return (
                    <m.rect
                      key={s.label}
                      x={x0 + j * larguraBarra}
                      y={margem.topo + areaH - h}
                      width={larguraBarra - 2}
                      height={h}
                      rx={3}
                      fill={s.cor}
                      // Cresce da base (scaleY é transform → neutralizado sob reduced-motion).
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.35, ease: EASE, delay: i * 0.03 }}
                      style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                    >
                      <title>{`${cat} · ${s.label}: ${formatar(v)}`}</title>
                    </m.rect>
                  );
                })}
                <text x={x0 + (larguraBarra * series.length) / 2} y={altura - 10} textAnchor="middle" fontSize={9.5} fill="var(--premium-gray)">
                  {cat}
                </text>
              </g>
            );
          })}
          {marco && marco.antesDe >= 0 && marco.antesDe < categorias.length && (
            <g aria-hidden>
              <line
                x1={margem.esquerda + marco.antesDe * passoCategoria}
                x2={margem.esquerda + marco.antesDe * passoCategoria}
                y1={margem.topo}
                y2={margem.topo + areaH}
                stroke="var(--premium-steel)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={margem.esquerda + marco.antesDe * passoCategoria + 4}
                y={margem.topo + 9}
                fontSize={9.5}
                fill="var(--premium-steel)"
              >
                {marco.rotulo}
              </text>
            </g>
          )}
          {linha && (
            <m.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3, ease: EASE }}>
              <polyline
                points={linha.valores.map((v, i) => `${xCategoria(i)},${yLinha(v)}`).join(" ")}
                fill="none"
                stroke={linha.cor}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {linha.valores.map((v, i) => (
                <circle key={i} cx={xCategoria(i)} cy={yLinha(v)} r={3.5} fill={linha.cor} stroke="var(--premium-white)" strokeWidth={1.5}>
                  <title>{`${categorias[i]} · ${linha.label}: ${formatar(v)}`}</title>
                </circle>
              ))}
            </m.g>
          )}
        </svg>
      </div>
      <figcaption className="flex items-center gap-4 mt-2">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--premium-gray)]">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.cor }} />
            {s.label}
          </span>
        ))}
        {linha && (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--premium-gray)]">
            <span aria-hidden className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: linha.cor }} />
            {linha.label}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
