import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Приподнимать карточку на ховере (интерактивные карточки-ссылки). */
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ interactive, padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-soft",
        padded && "p-5",
        interactive &&
          "transition-[transform,box-shadow] duration-120 ease-metronome hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
