"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Atraso da busca: o mesmo da busca que grava na URL. */
export const ATRASO_BUSCA_MS = 300;

interface UseBuscaLocalOptions {
  /** Recebe o termo (sem espaços nas pontas) depois do atraso, ou `""` ao limpar. */
  aoBuscar: (termo: string) => void;
  atrasoMs?: number;
}

/**
 * Busca da `FilterBar` fora da URL (opção `aoBuscar` do filtro `search`;
 * change catalogo-filterbar-faixa-busca-correcoes, D2).
 *
 * O termo vive só aqui, no estado do componente: não vai para a URL, para os
 * filtros persistidos nem para as views salvas, porque pode ser dado pessoal
 * (nome, e-mail) que não deve ficar no histórico, em log de acesso ou em link
 * compartilhado. Depois do mesmo atraso da busca pela URL, chama `aoBuscar`.
 *
 * O `aoBuscar` fica guardado em ref: o consumidor pode passar uma função nova
 * a cada render sem refazer o atraso. `alterar` e `limpar` têm identidade
 * estável, para a barra registrar o limpador do "Limpar filtros".
 */
export function useBuscaLocal({ aoBuscar, atrasoMs = ATRASO_BUSCA_MS }: UseBuscaLocalOptions) {
  const [valor, setValor] = useState("");
  const aoBuscarRef = useRef(aoBuscar);
  const atrasoRef = useRef(atrasoMs);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    aoBuscarRef.current = aoBuscar;
    atrasoRef.current = atrasoMs;
  });

  // Desmontou com o atraso correndo: a busca pendente não dispara mais.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const alterar = useCallback((v: string) => {
    setValor(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      aoBuscarRef.current(v.trim());
    }, atrasoRef.current);
  }, []);

  const limpar = useCallback(() => {
    setValor("");
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    aoBuscarRef.current("");
  }, []);

  return { valor, alterar, limpar };
}
