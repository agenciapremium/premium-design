"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { motionPreset } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "warning";

export interface ToastAction {
  /** Rótulo do botão (ex.: "Desfazer"). */
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Duração até o auto-dismiss, em ms. Padrão 4000. */
  duration?: number;
  /** Ação opcional (ex.: "Desfazer" no padrão undo). */
  action?: ToastAction;
}

export interface ToastInput extends ToastOptions {
  message: string;
  variant: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: string;
  duration: number;
}

export interface ToastApi {
  show: (input: ToastInput) => string;
  success: (message: string, opts?: ToastOptions) => string;
  info: (message: string, opts?: ToastOptions) => string;
  warning: (message: string, opts?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 4000;
const MAX_VISIBLE = 3;

let counter = 0;
function nextId() {
  counter += 1;
  return `toast-${counter}`;
}

// Visual de marca (ui-guidelines §4.19): fundo escuro fixo + acento amarelo.
// A variante muda apenas o ícone — o fundo e o acento são os mesmos.
const VARIANT_STYLE: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; label: string }
> = {
  success: { icon: CheckCircle2, label: "Sucesso" },
  info: { icon: Info, label: "Informação" },
  warning: { icon: AlertTriangle, label: "Aviso" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId();
    const item: ToastItem = {
      id,
      duration: input.duration ?? DEFAULT_DURATION,
      ...input,
    };
    // Fila: limita ao máximo visível, descartando o mais antigo.
    setToasts((prev) => [...prev, item].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const api: ToastApi = {
    show,
    success: (message, opts) => show({ message, variant: "success", ...opts }),
    info: (message, opts) => show({ message, variant: "info", ...opts }),
    warning: (message, opts) => show({ message, variant: "warning", ...opts }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed left-1/2 top-[76px] z-[100] flex w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 flex-col items-center gap-2"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const style = VARIANT_STYLE[toast.variant];
  const Icon = style.icon;
  const pausedRef = useRef(false);
  const remainingRef = useRef(toast.duration);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startRef.current = Date.now();
    timerRef.current = setTimeout(onDismiss, remainingRef.current);
  }, [clearTimer, onDismiss]);

  useEffect(() => {
    startTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pause() {
    if (pausedRef.current) return;
    pausedRef.current = true;
    clearTimer();
    remainingRef.current -= Date.now() - startRef.current;
  }

  function resume() {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    startTimer();
  }

  return (
    <m.div
      {...motionPreset("toast")}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className={cn(
        "pointer-events-auto flex w-full items-center gap-3 rounded-[var(--r-lg)] border border-white/10 bg-[var(--brand-ink)] p-3 shadow-[var(--sh-lg)]"
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--yellow)]">
        <Icon size={18} />
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-[1.45] text-[var(--brand-on-ink)]">
        {toast.message}
      </p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.onClick();
            onDismiss();
          }}
          className="flex min-h-[40px] shrink-0 items-center self-center rounded-[var(--r-sm)] px-3 text-[12px] font-bold uppercase tracking-wider text-[var(--yellow)] transition-colors hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dispensar aviso"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--r-sm)] text-[var(--premium-silver)] transition-colors hover:bg-white/10 hover:text-[var(--brand-on-ink)] cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
      >
        <X size={15} />
      </button>
    </m.div>
  );
}
