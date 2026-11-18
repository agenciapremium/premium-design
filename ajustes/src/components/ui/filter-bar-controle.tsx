"use client";

import { cn } from "@/lib/utils";
import { buscaLocal, chavesDaFaixa } from "@/lib/helpers/filtros-ativos";
import { DatePicker } from "@/components/ui/date-picker";
import { chipActive, chipBase, chipIdle, chipOn } from "@/components/ui/pilula";
import type { EscreverParams, FilterConfig, ParamsDaUrl } from "@/components/ui/filter-bar-config";
import { BuscaLocalControl, SearchFilterControl } from "@/components/ui/filter-bar-busca";
import { FaixaFilterControl } from "@/components/ui/filter-bar-faixa";
import { MultiSelectControl, SingleSelectControl } from "@/components/ui/filter-bar-selecao";

/** Um filtro da barra: escolhe o controle pelo tipo. */
export function FilterControl({
  filter,
  searchParams,
  setParams,
  buscaColapsavel,
  registrarLimpador,
}: {
  filter: FilterConfig;
  searchParams: ParamsDaUrl;
  setParams: EscreverParams;
  buscaColapsavel: boolean;
  registrarLimpador: (key: string, limpar: () => void) => () => void;
}) {
  const Icon = filter.icon;

  if (buscaLocal(filter) && filter.aoBuscar) {
    return (
      <BuscaLocalControl
        filter={filter}
        aoBuscar={filter.aoBuscar}
        colapsavel={buscaColapsavel}
        registrarLimpador={registrarLimpador}
      />
    );
  }

  if (filter.type === "search") {
    return (
      <SearchFilterControl
        filter={filter}
        searchParams={searchParams}
        setParams={setParams}
        colapsavel={buscaColapsavel}
      />
    );
  }

  if (filter.type === "toggle") {
    const active = searchParams.get(filter.key) === "1";
    return (
      <button
        onClick={() => setParams({ [filter.key]: active ? null : "1" })}
        aria-pressed={active}
        className={cn(chipBase, active ? chipOn : chipIdle)}
      >
        {Icon && (
          <Icon
            size={14}
            className={active ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]"}
          />
        )}
        {filter.label}
      </button>
    );
  }

  if (filter.type === "daterange") {
    const [chaveDe, chaveAte] = chavesDaFaixa(filter);
    const de = searchParams.get(chaveDe) ?? "";
    const ate = searchParams.get(chaveAte) ?? "";
    const active = Boolean(de || ate);
    return (
      <div className={cn(chipBase, active ? chipActive : chipIdle, "cursor-default")}>
        {Icon && <Icon size={14} className="text-[var(--premium-gray)]" />}
        <span className="text-[var(--premium-gray)]">{filter.label}</span>
        <DatePicker
          variant="inline"
          value={de}
          max={ate || undefined}
          onChange={(e) => setParams({ [chaveDe]: e.target.value || null })}
          placeholder="Início"
          ariaLabel={`${filter.label}: data inicial`}
        />
        <span className="text-[var(--premium-gray)]">–</span>
        <DatePicker
          variant="inline"
          value={ate}
          min={de || undefined}
          onChange={(e) => setParams({ [chaveAte]: e.target.value || null })}
          placeholder="Fim"
          ariaLabel={`${filter.label}: data final`}
        />
      </div>
    );
  }

  if (filter.type === "faixa") {
    return <FaixaFilterControl filter={filter} searchParams={searchParams} setParams={setParams} />;
  }

  if (filter.type === "multiselect") {
    return <MultiSelectControl filter={filter} searchParams={searchParams} setParams={setParams} />;
  }

  // select (padrão) — pílula com dropdown custom (mesmo painel do multiselect).
  return <SingleSelectControl filter={filter} searchParams={searchParams} setParams={setParams} />;
}
