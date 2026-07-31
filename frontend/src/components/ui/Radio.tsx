import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  hint?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, hint, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <span className="relative inline-flex shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="peer size-5 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface transition-colors duration-120 ease-metronome checked:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <span className="pointer-events-none absolute size-2.5 rounded-full bg-accent opacity-0 peer-checked:opacity-100" aria-hidden />
      </span>
      {(label || hint) && (
        <label htmlFor={inputId} className="cursor-pointer select-none text-sm leading-5 text-ink">
          {label}
          {hint && <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>}
        </label>
      )}
    </div>
  );
});
