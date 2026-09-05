import { useState } from "react";
import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizes: Record<AvatarSize, string> = {
  xs: "size-7 text-xs",
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  // Запоминаем именно тот src, что не загрузился — при смене картинки пробуем заново
  // (иначе после замены фото навсегда показывались бы инициалы).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src && failedSrc !== src;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-alt font-display font-semibold text-ink-muted",
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? ""}
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}
