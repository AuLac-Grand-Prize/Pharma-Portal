import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      {icon && <div className="mb-3 text-brand">{icon}</div>}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
