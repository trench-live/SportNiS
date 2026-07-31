import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ChipProps {
  children: ReactNode;
  /** Активное (выбранное) состояние — для фильтров. */
  selected?: boolean;
  /** Клик по самому чипу (переключение фильтра). */
  onClick?: () => void;
  /** Кнопка удаления справа (активный фильтр). */
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export function Chip({ children, selected, onClick, onRemove, removeLabel = "Убрать", className }: ChipProps) {
  const interactive = Boolean(onClick);
  const Tag = interactive ? "button" : "span";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-badge border px-3 py-1 text-sm transition-colors duration-120 ease-metronome",
        selected
          ? "border-accent bg-accent-soft text-accent"
          : "border-line bg-surface text-ink-muted",
        interactive && "cursor-pointer hover:border-line-strong",
        className,
      )}
    >
      <Tag
        type={interactive ? "button" : undefined}
        onClick={onClick}
        className={cn("bg-transparent", interactive && "focus-visible:outline-none")}
        aria-pressed={interactive ? selected : undefined}
      >
        {children}
      </Tag>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="-mr-1 inline-flex size-4 items-center justify-center rounded-full text-current hover:bg-ink/10"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  );
}
