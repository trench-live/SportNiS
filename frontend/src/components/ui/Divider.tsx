import { cn } from "@/lib/cn";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  /** Опциональная подпись по центру горизонтального разделителя. */
  label?: string;
  className?: string;
}

/** Волосяной разделитель 1px по --line: разметка на асфальте, а не рамка. */
export function Divider({ orientation = "horizontal", label, className }: DividerProps) {
  if (orientation === "vertical") {
    return <span role="separator" aria-orientation="vertical" className={cn("inline-block w-px self-stretch bg-line", className)} />;
  }

  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)} role="separator">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }

  return <hr className={cn("border-0 border-t border-line", className)} />;
}
