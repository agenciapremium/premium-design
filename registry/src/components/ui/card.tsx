import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

/**
 * Superfície, borda, raio e sombra do cartão. Exportada para quem precisa da
 * mesma superfície em outro elemento (o `CardSecao` a aplica direto no link).
 */
export const CLASSE_CARD =
  "bg-[var(--premium-white)] border border-[var(--premium-mist)] rounded-[var(--r-lg)] shadow-[var(--sh-sm)]";

export function Card({ children, hover, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        CLASSE_CARD,
        hover && "cursor-pointer transition-all duration-150 ease-[var(--ease)] hover:shadow-[var(--sh-md)] hover:-translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between px-[18px] py-4 border-b border-[var(--premium-mist)]", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-2", className)}>{children}</div>;
}
