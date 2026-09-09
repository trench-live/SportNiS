import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizes = { sm: "size-4", md: "size-6", lg: "size-8" } as const;

export function Spinner({ size = "md", className, label = "Загрузка" }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex text-accent", className)}>
      <Loader2 className={cn("animate-spin", sizes[size])} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
