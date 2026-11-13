"use client";

import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { motionPreset, presets } from "@/lib/motion";
import { useDialogoFoco } from "@/lib/hooks/use-dialogo-foco";
import { Button } from "./button";
import { FormErrorBanner } from "./form-error-banner";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Banner de erro inline exibido dentro do diálogo (ui-guidelines §5.8). */
  error?: string;
  /** Cor da ação primária. Destrutivo usa `danger` (nunca amarelo). */
  variant?: "danger" | "primary";
  /** Ícone/cor do cabeçalho. `danger` (padrão) = alerta; `neutral` = informativo. */
  tone?: "danger" | "neutral";
  /** Desabilita a ação primária (ex.: enquanto o campo do diálogo é inválido). */
  confirmDisabled?: boolean;
  /** Foca a ação primária ao abrir. Desligue quando o diálogo tem um campo. */
  autoFocusConfirm?: boolean;
  /** Conteúdo extra (ex.: um campo de formulário) abaixo da mensagem. */
  children?: ReactNode;
  /**
   * Ação secundária DESTRUTIVA opcional, entre Cancelar e a ação primária (ex.:
   * "Excluir definitivamente" no diálogo de arquivar card). Use quando o diálogo
   * precisa oferecer duas saídas distintas para o mesmo gesto; a confirmação de
   * uma ação irreversível deve acontecer em um segundo diálogo.
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    /** Ícone opcional à esquerda do rótulo (lucide-react). */
    icon?: ReactNode;
  };
}

/**
 * Diálogo de confirmação central (ui-guidelines §4.10). `role="dialog"` com foco
 * gerenciado por `useDialogoFoco`: foca a ação primária ao abrir, prende o `Tab`
 * na caixa enquanto aberto e devolve o foco ao gatilho ao fechar;
 * `Esc` cancela e `Enter` confirma a ação em foco (§5.6, §7). Erros de falha são
 * exibidos em banner inline (`error`), mantendo o diálogo aberto. Aceita `children`
 * (ex.: um campo) e o tom `neutral` para diálogos informativos (não destrutivos).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  loading,
  error,
  variant = "danger",
  tone = "danger",
  confirmDisabled = false,
  autoFocusConfirm = true,
  children,
  secondaryAction,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);

  // Foco gerenciado pelo hook compartilhado (capability overlays-gestao-de-foco):
  // guarda o gatilho, foca a ação primária ao abrir, prende o `Tab` na caixa e
  // devolve o foco ao fechar. Quando o diálogo tem um campo, o auto-foco da
  // primária é desligado (o campo se foca sozinho via autoFocus).
  useDialogoFoco({
    aberto: open,
    ref: caixaRef,
    inicial: autoFocusConfirm ? confirmRef : "nenhum",
    alternativo: confirmRef,
  });

  function handleKeyDown(e: React.KeyboardEvent) {
    if (loading) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!confirmDisabled) onConfirm();
    }
  }

  const isNeutral = tone === "neutral";

  // Portal no `body`, montado só ao abrir: a confirmação entra DEPOIS de qualquer
  // overlay já aberto (slide-over, painel de cards). Assim fica por cima dele na
  // mesma camada (`z-50`) e fora do `inert` que ele aplicou ao resto da página;
  // dentro da árvore da app ela herdaria esse `inert` e o scrim do overlay a
  // cobriria (change central-notificacoes-cards).
  const noCliente = useSyncExternalStore(semAssinatura, () => true, () => false);
  if (!noCliente) return null;

  // O container externo faz o fade (scrim) e centraliza; a caixa herda o estado de
  // animação (scale + opacity do preset `modal`) por propagação de variants, sem
  // conflitar com a centralização por flex. Foco é devolvido pelo hook (keyed em
  // `open`), no início do fechamento.
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="confirm"
          {...motionPreset("scrim")}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onKeyDown={handleKeyDown}
        >
          {/* `data-foco-livre`: fora do reforço `inert`, para o clique fora
              continuar fechando (capability overlays-gestao-de-foco). */}
          <div className="absolute inset-0 bg-black/30" onClick={onClose} data-foco-livre="" />
          <m.div
            ref={caixaRef}
            variants={presets.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative bg-[var(--c-surface)] rounded-[var(--r-xl)] shadow-[var(--sh-lg)] p-6 max-w-[420px] w-full mx-4"
          >
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isNeutral ? "bg-[var(--premium-bone)]" : "bg-[var(--danger-bg)]"
            }`}
          >
            {isNeutral ? (
              <Clock size={20} className="text-[var(--premium-steel)]" />
            ) : (
              <AlertTriangle size={20} className="text-[var(--danger)]" />
            )}
          </div>
          <div>
            <h3 id={titleId} className="text-[18px] font-bold text-[var(--c-ink)]">
              {title}
            </h3>
            <p id={descId} className="text-[13.5px] text-[var(--premium-steel)] mt-1">
              {message}
            </p>
          </div>
        </div>

        {children && <div className="mb-4">{children}</div>}

        <FormErrorBanner message={error} className="mb-4" />

        <div className="flex flex-wrap justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          {secondaryAction && (
            <Button
              variant="danger"
              size="sm"
              onClick={secondaryAction.onClick}
              disabled={loading}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
          <Button
            ref={confirmRef}
            variant={variant}
            size="sm"
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? "Processando..." : confirmLabel}
          </Button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

const semAssinatura = () => () => {};
