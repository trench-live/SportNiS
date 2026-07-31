import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const inputBase =
  "h-11 w-full rounded-control border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint " +
  "transition-colors duration-120 ease-metronome focus:outline-none focus:ring-2 focus:ring-line-strong/40 " +
  "focus:border-line-strong disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, leftIcon, rightSlot, className, ...props },
  ref,
) {
  if (leftIcon || rightSlot) {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-ink-faint [&_svg]:size-4" aria-hidden>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            inputBase,
            invalid && "border-danger focus:border-danger focus:ring-danger/30",
            leftIcon && "pl-9",
            rightSlot && "pr-10",
            !invalid && "border-line",
            className,
          )}
          {...props}
        />
        {rightSlot && <span className="absolute right-2 flex items-center">{rightSlot}</span>}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(inputBase, invalid ? "border-danger focus:border-danger focus:ring-danger/30" : "border-line", className)}
      {...props}
    />
  );
});
