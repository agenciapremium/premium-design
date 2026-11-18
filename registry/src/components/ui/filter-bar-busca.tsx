"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { campoAdotaUrl } from "@/lib/helpers/busca-filtro-url";
import { useBuscaLocal } from "@/lib/hooks/use-busca-local";
import { chipActive, chipBase, chipIdle } from "@/components/ui/pilula";
import type { EscreverParams, FilterConfig, ParamsDaUrl } from "@/components/ui/filter-bar-config";

// Filtro de busca por palavra-chave: input textual persistido na URL
// (`<key>`), com debounce para não thrashar o histórico enquanto digita. Tokens
// semânticos, foco visível e contraste AA em claro/escuro.
export function SearchFilterControl({
  filter,
  searchParams,
  setParams,
  colapsavel,
}: {
  filter: FilterConfig;
  searchParams: ParamsDaUrl;
  setParams: EscreverParams;
  colapsavel: boolean;
}) {
  const urlValue = searchParams.get(filter.key) ?? "";
  const [valor, setValor] = useState(urlValue);
  const [urlAnterior, setUrlAnterior] = useState(urlValue);
  // Escrita do campo a caminho da URL: o debounce correndo (`digitando`) ou a
  // navegação disparada por ele ainda sem confirmar (`navegando`). Estado, não
  // ref, porque é lido durante o render.
  const [digitando, setDigitando] = useState(false);
  const [navegando, startNavegacao] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reflete mudanças externas da URL (ex.: "Limpar filtros") no campo, sem
  // efeito: padrão "ajuste de estado durante o render" do React (rastreia o
  // último valor da URL via estado, não ref). Só quando não há escrita do campo
  // a caminho: a URL muda quando a resposta do servidor chega, e a resposta
  // atrasada de uma escrita anterior traz o termo antigo, que apagaria o que
  // acabou de ser digitado (change filter-bar-busca-digitacao-estavel).
  if (campoAdotaUrl({ urlValue, urlAnterior, escritaPendente: digitando || navegando })) {
    setUrlAnterior(urlValue);
    setValor(urlValue);
  }

  function onChange(v: string) {
    setValor(v);
    setDigitando(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDigitando(false);
      // Na transição, `navegando` fica verdadeiro até a URL confirmar.
      startNavegacao(() => setParams({ [filter.key]: v.trim() || null }));
    }, 300);
  }

  function limpar() {
    setValor("");
    setDigitando(false);
    if (timer.current) clearTimeout(timer.current);
    startNavegacao(() => setParams({ [filter.key]: null }));
  }

  return (
    <ChipBusca
      filter={filter}
      valor={valor}
      onChange={onChange}
      onLimpar={limpar}
      colapsavel={colapsavel}
    />
  );
}

// Busca fora da URL (`aoBuscar`): o termo fica no estado do componente e chega
// à tela pela função, com o mesmo atraso (change
// catalogo-filterbar-faixa-busca-correcoes, D2). O limpador entra no registro
// da barra para o "Limpar filtros" esvaziar o campo e chamar `aoBuscar("")`.
export function BuscaLocalControl({
  filter,
  aoBuscar,
  colapsavel,
  registrarLimpador,
}: {
  filter: FilterConfig;
  aoBuscar: (termo: string) => void;
  colapsavel: boolean;
  registrarLimpador: (key: string, limpar: () => void) => () => void;
}) {
  const { valor, alterar, limpar } = useBuscaLocal({ aoBuscar });

  useEffect(() => registrarLimpador(filter.key, limpar), [registrarLimpador, filter.key, limpar]);

  return (
    <ChipBusca
      filter={filter}
      valor={valor}
      onChange={alterar}
      onLimpar={limpar}
      colapsavel={colapsavel}
    />
  );
}

// Chip da busca, o mesmo para a busca pela URL e para a busca fora dela: a
// lupa colapsável, o campo e o `X` de limpar.
function ChipBusca({
  filter,
  valor,
  onChange,
  onLimpar,
  colapsavel,
}: {
  filter: FilterConfig;
  valor: string;
  onChange: (v: string) => void;
  onLimpar: () => void;
  colapsavel: boolean;
}) {
  const Icon = filter.icon ?? Search;
  const [expandido, setExpandido] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = valor.trim().length > 0;
  // Aberto quando: não-colapsável (opt-out), expandido manualmente, ou há termo.
  const aberto = !colapsavel || expandido || active;

  // Foca o input ao expandir (capability filter-bar-busca-layout-global).
  useEffect(() => {
    if (aberto && expandido) inputRef.current?.focus();
  }, [aberto, expandido]);

  function limpar() {
    onLimpar();
    setExpandido(false);
  }

  // Um único elemento que cresce suavemente: a lupa fica sempre visível e o campo
  // anima a largura/opacidade de 0 → 200px ao abrir (capability
  // filter-bar-busca-layout-global). `overflow-hidden` esconde o campo recolhido.
  return (
    <div
      className={cn(
        chipBase,
        active ? chipActive : chipIdle,
        "shrink-0 overflow-hidden",
        aberto ? "cursor-text gap-2" : "cursor-pointer gap-0",
      )}
      onClick={() => {
        if (colapsavel && !aberto) setExpandido(true);
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          if (colapsavel && !aberto) {
            e.stopPropagation();
            setExpandido(true);
          }
        }}
        aria-label={filter.label}
        aria-expanded={aberto}
        tabIndex={aberto ? -1 : 0}
        className="flex shrink-0 items-center justify-center focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)] focus-visible:outline-none"
      >
        <Icon size={18} className="text-[var(--premium-gray)]" />
      </button>
      <input
        ref={inputRef}
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (!valor.trim()) setExpandido(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !valor.trim()) setExpandido(false);
        }}
        placeholder={filter.placeholder ?? filter.label}
        aria-label={filter.label}
        aria-hidden={!aberto}
        tabIndex={aberto ? 0 : -1}
        style={{ width: aberto ? 200 : 0, opacity: aberto ? 1 : 0 }}
        className="bg-transparent text-[13px] text-[var(--premium-ink)] transition-[width,opacity] duration-200 ease-out placeholder:text-[var(--premium-gray)] focus:outline-none"
      />
      {/* O único controle de limpar do campo: o "x" nativo do type="search" é
          escondido pela regra base do globals.css (change busca-um-x-por-campo).
          Alvo de 24×24px (antes o ícone de 14px era o próprio alvo); o -mr
          devolve o respiro direito do chip. Limpar recolhe o chip, então o foco
          não volta ao campo, que some. */}
      {active && (
        <button
          type="button"
          onClick={limpar}
          aria-label="Limpar busca"
          className="-mr-[5px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--premium-gray)] hover:text-[var(--premium-ink)] focus-visible:ring-2 focus-visible:ring-[var(--yellow-50)] focus-visible:outline-none"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
