import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  /** Текущая страница (0-индексация, как в бэкенде). */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function range(page: number, total: number): (number | "…")[] {
  const pages = new Set<number>([0, total - 1, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let prev = -1;
  for (const p of sorted) {
    if (prev >= 0 && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const cellBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-control px-2 text-sm transition-colors duration-120 ease-metronome disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Пагинация" className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
        aria-label="Предыдущая страница"
        className={cn(cellBase, "text-ink-muted hover:bg-surface-alt")}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {range(page, totalPages).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              cellBase,
              item === page
                ? "bg-accent font-medium text-ink-invert"
                : "text-ink hover:bg-surface-alt",
            )}
          >
            {item + 1}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Следующая страница"
        className={cn(cellBase, "text-ink-muted hover:bg-surface-alt")}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
