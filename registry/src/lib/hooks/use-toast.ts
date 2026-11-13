"use client";

import { useContext } from "react";
import { ToastContext, type ToastApi } from "@/components/ui/toast";

/**
 * Hook/serviço central de feedback transitório (capability ui-feedback-system).
 * Única forma de disparar toasts — sem prop drilling. Requer `ToastProvider`
 * montado acima na árvore (shell autenticado). Variantes: success/info/warning;
 * erro de submit vai para banner inline, não toast (ver ui-guidelines §5.8).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  }
  return ctx;
}
