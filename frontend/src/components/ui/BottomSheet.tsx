import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useDismiss } from "./useDismiss";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Панель, выезжающая снизу — мобильный паттерн «под палец». */
export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  useDismiss(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animate-overlay absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Меню"}
        className={cn(
          "animate-sheet absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-modal bg-surface pb-[env(safe-area-inset-bottom)] shadow-modal",
          className,
        )}
      >
        {/* Хват-полоска сверху. */}
        <div className="sticky top-0 flex justify-center bg-surface pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-line" aria-hidden />
        </div>
        {title && <h2 className="px-5 pb-1 pt-1 text-base font-semibold text-ink">{title}</h2>}
        <div className="p-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
