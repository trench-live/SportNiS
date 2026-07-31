import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Разрешить несколько открытых секций одновременно. */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ items, multiple, defaultOpen = [], className }: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className={cn("divide-y divide-line rounded-card border border-line", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.key);
        const headingId = `${baseId}-${item.key}-h`;
        const panelId = `${baseId}-${item.key}-p`;
        return (
          <div key={item.key}>
            <h3>
              <button
                id={headingId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-ink transition-colors duration-120 ease-metronome hover:bg-surface-alt/60"
              >
                {item.title}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-ink-muted transition-transform duration-200 ease-metronome",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            {isOpen && (
              <div id={panelId} role="region" aria-labelledby={headingId} className="px-4 pb-4 text-sm text-ink-muted">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
