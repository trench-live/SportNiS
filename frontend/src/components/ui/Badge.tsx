import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "accent" | "neutral" | "success" | "warning" | "danger" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  leftIcon?: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  neutral: "bg-surface-alt text-ink-muted",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/12 text-danger",
  outline: "border border-line text-ink-muted",
};

export function Badge({ tone = "neutral", leftIcon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-badge px-2 py-0.5 text-xs font-medium [&_svg]:size-3",
        tones[tone],
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </span>
  );
}
