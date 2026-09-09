import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
}

const HEIGHT = { md: "h-12", lg: "h-14" } as const;
const ICON = { md: "size-5", lg: "size-6" } as const;
const TEXT = { md: "text-sm", lg: "text-base" } as const;
const PAD = { md: "px-4", lg: "px-5" } as const;

/** Поисковая строка — круглая форма по дизайн-правилам. */
export function SearchBar({ value, onChange, placeholder = "Искать…", size = "md", className }: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-line bg-surface shadow-soft focus-within:border-line-strong",
        HEIGHT[size],
        PAD[size],
        className,
      )}
    >
      <Search className={cn("shrink-0 text-ink-muted", ICON[size])} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "h-full flex-1 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden",
          TEXT[size],
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Очистить"
          className="shrink-0 rounded-full p-1 text-ink-faint transition-colors duration-120 ease-metronome hover:bg-surface-alt hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
