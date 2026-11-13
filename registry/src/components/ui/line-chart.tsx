"use client";

/**
 * Gráfico de linha em SVG próprio (change quadros-wip-aging, design D-D). Novo
 * primitivo justificado: o catálogo só tinha barra (`bar-chart.tsx`) e donut
 * (`pie-chart.tsx`), e o throughput é uma **série temporal** — pede linha. Espelha
 * fielmente o padrão dos outros charts: SVG próprio (sem lib), largura via
 * `ResizeObserver` com scroll horizontal abaixo do mínimo legível, `role="img"` +
 * descrição em pt-BR, cores/grade SÓ por token semântico (claro/escuro
 * automáticos), foco visível e contraste AA. A tabela/tooltips são a fonte
 * completa dos valores.
 */

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

export interface LineChartPonto {
  label: string;
  valor: number;
}

interface LineChartProps {
  pontos: LineChartPonto[];
  descricao: string;
  altura?: number;
  /** Formatação dos valores do eixo/tooltips. Padrão: inteiro. */
  formatarValor?: (valor: number) => string;
}

const inteiroPadrao = (n: number) => String(Math.round(n));

export function LineChart({
  pontos,
  descricao,
  altura = 220,
  formatarValor = inteiroPadrao,
}: LineChartProps) {
  const formatar = formatarValor;
  const minimo = Math.max(480, pontos.length * 56);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(minimo);
  const prefersReduced = useReducedMotion();

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

  const margem = { topo: 12, direita: 12, base: 28, esquerda: 44 };
  const areaW = largura - margem.esquerda - margem.direita;
  const areaH = altura - margem.topo - margem.base;
  const max = Math.max(1, ...pontos.map((p) => p.valor));
  const passo = pontos.length > 1 ? areaW / (pontos.length - 1) : 0;

  const x = (i: number) =>
    margem.esquerda + (pontos.length > 1 ? i * passo : areaW / 2);
  const y = (v: number) => margem.topo + areaH * (1 - v / max);

  const linhasGrade = [0, 0.25, 0.5, 0.75, 1];
  const caminho = pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(" ");

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
            const yy = margem.topo + areaH * (1 - p);
            return (
              <g key={p}>
                <line
                  x1={margem.esquerda}
                  x2={largura - margem.direita}
                  y1={yy}
                  y2={yy}
                  stroke="var(--premium-mist)"
                  strokeWidth={1}
                />
                <text
                  x={margem.esquerda - 6}
                  y={yy + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="var(--premium-gray)"
                >
                  {formatar(max * p)}
                </text>
              </g>
            );
          })}

          {pontos.length > 1 && (
            <m.polyline
              points={caminho}
              fill="none"
              stroke="var(--premium-ink)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              // "Traça" a linha (pathLength não é transform → guarda manual).
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: prefersReduced ? 0 : 0.6, ease: EASE }}
            />
          )}

          {pontos.map((p, i) => (
            <g key={`${p.label}-${i}`}>
              <m.circle
                cx={x(i)}
                cy={y(p.valor)}
                r={3.5}
                fill="var(--premium-ink)"
                stroke="var(--premium-white)"
                strokeWidth={1.5}
                // Pontos surgem depois da linha traçar até eles.
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: prefersReduced ? 0 : 0.15 + (i / Math.max(1, pontos.length - 1)) * 0.5 }}
              >
                <title>{`${p.label}: ${formatar(p.valor)}`}</title>
              </m.circle>
              <text
                x={x(i)}
                y={altura - 10}
                textAnchor="middle"
                fontSize={9.5}
                fill="var(--premium-gray)"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
