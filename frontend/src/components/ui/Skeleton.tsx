import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
}

export function Skeleton({ circle, className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse bg-surface-alt", circle ? "rounded-full" : "rounded-control", className)}
      {...props}
    />
  );
}
