import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void; ref: (el: HTMLElement | null) => void }) => ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, items, align = "end", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("relative inline-block", className)}>
      {trigger({
        open,
        toggle: () => setOpen((v) => !v),
        ref: (el) => (triggerRef.current = el),
      })}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "animate-pop absolute z-40 mt-2 min-w-44 overflow-hidden rounded-card border border-line bg-surface p-1 shadow-lift",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm transition-colors duration-120 ease-metronome [&_svg]:size-4",
                "disabled:cursor-not-allowed disabled:opacity-50",
                item.destructive
                  ? "text-danger hover:bg-danger/10"
                  : "text-ink hover:bg-surface-alt",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
