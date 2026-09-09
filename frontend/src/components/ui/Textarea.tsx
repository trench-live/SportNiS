import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full resize-y rounded-control border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint",
        "transition-colors duration-120 ease-metronome focus:outline-none focus:ring-2 focus:ring-line-strong/40 focus:border-line-strong",
        "disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60",
        invalid ? "border-danger focus:border-danger focus:ring-danger/30" : "border-line",
        className,
      )}
      {...props}
    />
  );
});
