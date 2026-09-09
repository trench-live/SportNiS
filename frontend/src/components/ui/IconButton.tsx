import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type IconButtonVariant = "solid" | "soft" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Обязательная подпись для скринридера — иконочная кнопка без текста. */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const base =
  "inline-flex items-center justify-center rounded-full transition-colors duration-120 ease-metronome " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-line-strong disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<IconButtonVariant, string> = {
  solid: "bg-accent text-ink-invert hover:bg-accent-hover",
  soft: "bg-surface-alt text-ink hover:bg-line",
  ghost: "text-ink-muted hover:bg-surface-alt hover:text-ink",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-5",
  lg: "size-12 [&_svg]:size-6",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = "ghost", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
});
