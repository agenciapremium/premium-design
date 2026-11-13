"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { debounce } from "@/lib/debounce";
import { useFiltrosPersistencia } from "@/components/ui/filtros-persistencia";

interface UseFiltrosPersistidosOptions {
  /**
   * Identificador estável da tela. Quando ausente, a persistência é desligada.
   * Também desligada quando não há `FiltrosPersistenciaProvider` acima.
   */
  telaKey?: string;
  /**
   * Conjunto de parâmetros de URL que contam como filtro (inclui `${k}De`/
   * `${k}Ate` de daterange). Só estes são salvos e considerados na restauração;
   * `view` e demais parâmetros são ignorados.
   */
  filterKeys: string[];
  /** Janela do debounce do salvamento. Padrão 600ms. */
  debounceMs?: number;
  /**
   * A tela recorta no navegador (prop `recorteLocal` da `FilterBar`): a
   * restauração escreve a URL por `history.replaceState`, sem refazer a página
   * no servidor (change calendario-time-filtros, D5).
   */
  local?: boolean;
}

/** Recorta da query string apenas os pares de filtro com valor presente. */
function recortarFiltros(searchParams: URLSearchParams, filterKeys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = searchParams.get(key);
    if (value !== null && value !== "") out[key] = value;
  }
  return out;
}

/** Serialização estável (chaves ordenadas) para comparar estados de filtro. */
function serializar(filtros: Record<string, string>): string {
  const entries = Object.entries(filtros).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

/**
 * Persistência por usuário do último filtro de uma tela
 * (capability persistencia-filtros-usuario).
 *
 * - Restaura na abertura quando a URL não traz nenhum filtro conhecido (a URL
 *   tem precedência — link compartilhado vence o salvo). Desde a capability
 *   `views-salvas`, o que se restaura é a **view padrão** da tela quando existe
 *   uma, e só então o último filtro (design D4); a tela sem view padrão se
 *   comporta exatamente como antes.
 * - Salva de forma debounced quando o usuário altera um filtro.
 * - Não salva no mount nem refaz um save redundante logo após restaurar.
 *
 * Retorna `limpar()` para que o botão "Limpar filtros" apague também o salvo.
 *
 * Quem lê e grava é o `FiltrosPersistenciaProvider` (change
 * catalogo-componentes-premium-design, D6). Sem provedor, o hook não faz nada:
 * não restaura, não grava e `limpar()` não chama ninguém.
 */
export function useFiltrosPersistidos({ telaKey, filterKeys, debounceMs = 600, local = false }: UseFiltrosPersistidosOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const persistencia = useFiltrosPersistencia();

  const ativo = Boolean(telaKey) && persistencia !== null;

  // Estado de filtros atual, serializado para comparação estável.
  const filtrosAtuais = useMemo(
    () => recortarFiltros(new URLSearchParams(searchParams.toString()), filterKeys),
    [searchParams, filterKeys]
  );
  const serializado = serializar(filtrosAtuais);

  // Último estado conhecido como "já persistido" — evita o loop restore→save e
  // o save redundante no mount.
  const lastSalvoRef = useRef<string | null>(null);
  const restauradoRef = useRef(false);

  const saveDebounced = useMemo(
    () =>
      debounce((tela: string, filtros: Record<string, string>) => {
        if (persistencia) void persistencia.salvarFiltros(tela, filtros);
      }, debounceMs),
    [debounceMs, persistencia]
  );

  // Restauração na abertura — roda uma vez por tela.
  useEffect(() => {
    if (!ativo || !persistencia || !telaKey || restauradoRef.current) return;
    restauradoRef.current = true;

    // Marca o estado atual da URL como baseline para o efeito de save não gravar
    // no mount.
    lastSalvoRef.current = serializado;

    // Precedência da URL: se já há qualquer filtro conhecido, não restaura.
    if (Object.keys(filtrosAtuais).length > 0) return;

    let cancelado = false;
    // Precedência da capability views-salvas (design D4), resolvida no servidor
    // em UMA chamada: view padrão da tela, senão o último filtro, senão nada.
    // Perguntar as duas coisas em separado arriscaria aplicar o último filtro
    // por cima da view padrão, dependendo de qual resposta chegasse antes.
    void persistencia.carregarFiltros(telaKey).then(({ query: salvos }) => {
      if (cancelado) return;
      const chaves = Object.keys(salvos);
      if (chaves.length === 0) return;

      // Aplica o estado inicial preservando os demais parâmetros (ex.: view,
      // quando a própria view salva não o define).
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(salvos)) params.set(k, v);
      const qs = params.toString();

      // Baseline = estado restaurado, para que o save não regrave o mesmo.
      lastSalvoRef.current = serializar(recortarFiltros(params, filterKeys));
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (local) window.history.replaceState(null, "", url);
      else router.replace(url, { scroll: false });
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, telaKey]);

  // Salvamento debounced ao alterar filtros (pula mount e restauração).
  useEffect(() => {
    if (!ativo || !telaKey) return;
    if (lastSalvoRef.current === null) {
      // Ainda não passou pela restauração: estabelece baseline sem salvar.
      lastSalvoRef.current = serializado;
      return;
    }
    if (lastSalvoRef.current === serializado) return;
    lastSalvoRef.current = serializado;
    saveDebounced(telaKey, filtrosAtuais);
  }, [ativo, telaKey, serializado, filtrosAtuais, saveDebounced]);

  // Limpa o filtro persistido (chamado junto do "Limpar filtros" da FilterBar).
  function limpar() {
    if (!telaKey || !persistencia) return;
    lastSalvoRef.current = serializar({});
    saveDebounced.cancel();
    void persistencia.limparFiltros(telaKey);
  }

  return { limpar };
}
