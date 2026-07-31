import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-alt text-ink-muted [&_svg]:size-6">
          {icon}
        </span>
      )}
      <div>
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
