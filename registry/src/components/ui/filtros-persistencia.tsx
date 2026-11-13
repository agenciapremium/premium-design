"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Persistência injetável da `FilterBar` (change catalogo-componentes-premium-design,
 * design D6): o último filtro de cada tela e as views salvas chegam por aqui, e
 * não por import direto das server actions. Assim a barra é a mesma peça no
 * Tasks e no catálogo do premium-design.
 *
 * - **Com provedor** (o Tasks declara `FiltrosPersistenciaTasks`, ligado às
 *   actions de preferências, nos layouts que usam a barra): restaura e grava os
 *   filtros por tela e mostra o menu de views, como sempre.
 * - **Sem provedor**: a barra filtra pela URL normalmente, não chama nenhuma
 *   action e não mostra o menu de views salvas.
 *
 * Este arquivo não importa action, banco nem validator de domínio: os tipos do
 * contrato moram aqui, e a guarda do catálogo (`catalogo-guarda.test.ts`) barra
 * qualquer import de domínio.
 */

/**
 * Uma view salva: o snapshot da query string da tela, com nome (capability
 * views-salvas, design D1). Mesmo formato que o servidor do Tasks grava.
 */
export interface ViewSalva {
  id: string;
  nome: string;
  query: Record<string, string>;
  /** No máximo uma view por tela abre a tela sozinha. */
  padrao?: boolean;
  /** ISO 8601. Só ordena a lista. */
  criadaEm: string;
}

/** Resultado de salvar, renomear ou restaurar uma view. */
export type ResultadoView = { success: true; view: ViewSalva } | { success: false; error: string };

/** Resultado de excluir: a view removida e a posição, para o "Desfazer". */
export type ResultadoExclusaoView =
  | { success: true; view: ViewSalva; posicao: number }
  | { success: false; error: string };

/** Resultado de definir (ou tirar) a view padrão da tela. */
export type ResultadoViewPadrao = { success: true } | { success: false; error: string };

/**
 * Contrato da persistência. As assinaturas seguem as actions de
 * `src/app/actions/preferencias.ts`, para a ligação do Tasks ser só a lista das
 * actions.
 */
export interface FiltrosPersistencia {
  /**
   * Estado inicial da tela quando a URL não traz filtros: a view padrão, senão
   * o último filtro, senão nada (a precedência é de quem implementa).
   */
  carregarFiltros(telaKey: string): Promise<{ query: Record<string, string> }>;
  /** Grava o último filtro da tela (chamado com debounce). */
  salvarFiltros(telaKey: string, filtros: Record<string, string>): Promise<unknown>;
  /** Apaga o último filtro da tela ("Limpar filtros"). */
  limparFiltros(telaKey: string): Promise<unknown>;

  listarViews(telaKey: string): Promise<ViewSalva[]>;
  salvarView(telaKey: string, dados: { nome: string; query: Record<string, string> }): Promise<ResultadoView>;
  renomearView(telaKey: string, id: string, nome: string): Promise<ResultadoView>;
  excluirView(telaKey: string, id: string): Promise<ResultadoExclusaoView>;
  /** Marca a view padrão da tela; `null` desmarca. */
  definirViewPadrao(telaKey: string, id: string | null): Promise<ResultadoViewPadrao>;
  /** Desfazer da exclusão: recoloca a view na posição em que estava. */
  restaurarView(telaKey: string, view: ViewSalva, posicao?: number): Promise<ResultadoView>;
}

const FiltrosPersistenciaContext = createContext<FiltrosPersistencia | null>(null);

/**
 * Declara a persistência para as `FilterBar` abaixo dele. Passe um objeto
 * estável (constante de módulo): os efeitos da barra dependem dele.
 */
export function FiltrosPersistenciaProvider({
  persistencia,
  children,
}: {
  persistencia: FiltrosPersistencia;
  children: ReactNode;
}) {
  return <FiltrosPersistenciaContext.Provider value={persistencia}>{children}</FiltrosPersistenciaContext.Provider>;
}

/** A persistência declarada acima, ou `null` quando não há provedor. */
export function useFiltrosPersistencia(): FiltrosPersistencia | null {
  return useContext(FiltrosPersistenciaContext);
}
