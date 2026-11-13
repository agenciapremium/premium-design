import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "violet" | "teal" | "slate" | "gold";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--premium-bone)] text-[var(--premium-steel)]",
  success: "bg-[var(--success-bg)] text-[var(--success)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning)]",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)]",
  info: "bg-[var(--info-bg)] text-[var(--info)]",
  violet: "bg-[var(--violet-bg)] text-[var(--violet)]",
  teal: "bg-[var(--teal-bg)] text-[var(--teal)]",
  slate: "bg-[var(--slate-bg)] text-[var(--slate)]",
  gold: "bg-[var(--gold-bg)] text-[var(--amber)]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block text-[10px] font-bold uppercase tracking-wider px-[10px] py-[3px] rounded-full",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
