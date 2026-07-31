import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDismiss } from "./useDismiss";
import { IconButton } from "./IconButton";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Drawer({ open, onClose, title, children, side = "right", className }: DrawerProps) {
  useDismiss(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animate-overlay absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Панель"}
        className={cn(
          "animate-drawer absolute inset-y-0 flex w-full max-w-sm flex-col bg-surface shadow-modal",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <IconButton label="Закрыть" icon={<X />} size="sm" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
