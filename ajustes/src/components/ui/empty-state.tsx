import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex animate-[fadeIn_.18s_ease] flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-[var(--premium-silver)]">{icon}</div>
      <h3 className="mb-1 text-[15px] font-bold text-[var(--premium-steel)]">{title}</h3>
      {description && (
        <p className="mb-4 max-w-[300px] text-[12.5px] text-[var(--premium-gray)]">{description}</p>
      )}
      {action}
    </div>
  );
}
