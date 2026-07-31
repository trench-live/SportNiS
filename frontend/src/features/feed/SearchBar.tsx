import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Поисковая строка — круглая форма по дизайн-правилам. */
export function SearchBar({ value, onChange, placeholder = "Искать…", className }: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 shadow-soft focus-within:border-line-strong",
        className,
      )}
    >
      <Search className="size-5 shrink-0 text-ink-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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
