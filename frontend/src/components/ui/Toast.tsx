import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "success" | "error";

export interface ToastOptions {
  message: ReactNode;
  tone?: ToastTone;
  /** мс до авто-скрытия; 0 — не скрывать автоматически. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  neutral: "border-line",
  success: "border-success/40",
  error: "border-danger/40",
};

const toneIcon: Record<ToastTone, ReactNode> = {
  neutral: <Info className="size-5 text-steel" aria-hidden />,
  success: <CheckCircle2 className="size-5 text-success" aria-hidden />,
  error: <AlertCircle className="size-5 text-danger" aria-hidden />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++counter.current;
      const duration = options.duration ?? 4000;
      setItems((list) => [...list, { ...options, id }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
          {items.map((item) => (
            <div
              key={item.id}
              role="status"
              aria-live="polite"
              className={cn(
                "animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-surface p-3 pr-2 shadow-lift",
                toneStyles[item.tone ?? "neutral"],
              )}
            >
              <span className="mt-0.5 shrink-0">{toneIcon[item.tone ?? "neutral"]}</span>
              <div className="flex-1 pt-0.5 text-sm text-ink">{item.message}</div>
              {item.action && (
                <button
                  type="button"
                  onClick={() => {
                    item.action?.onClick();
                    dismiss(item.id);
                  }}
                  className="shrink-0 rounded-[8px] px-2 py-1 text-sm font-medium text-accent transition-colors duration-120 ease-metronome hover:bg-accent-soft"
                >
                  {item.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Закрыть уведомление"
                className="shrink-0 rounded-full p-1 text-ink-faint transition-colors duration-120 ease-metronome hover:bg-surface-alt hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast должен использоваться внутри <ToastProvider>");
  return ctx;
}
