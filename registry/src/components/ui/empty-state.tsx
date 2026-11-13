import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-[fadeIn_.18s_ease]">
      <div className="text-[var(--premium-silver)] mb-4">{icon}</div>
      <h3 className="text-[15px] font-bold text-[var(--premium-steel)] mb-1">{title}</h3>
      {description && (
        <p className="text-[12.5px] text-[var(--premium-gray)] max-w-[300px] mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
