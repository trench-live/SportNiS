import { cn } from "@/lib/cn";

export interface PromoSlotProps {
  className?: string;
}

/**
 * Рекламный слот. Пока без бэкенда — визуальная заглушка с обязательной пометкой «Реклама».
 * По форме близок к карточке ленты: блок с рекламной картинкой во всю площадь.
 */
export function PromoSlot({ className }: PromoSlotProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-28 items-center justify-center overflow-hidden rounded-card border border-line bg-surface-alt",
        className,
      )}
    >
      <span className="absolute left-3 top-3 rounded-badge bg-surface/80 px-2 py-0.5 text-xs font-medium text-ink-muted">
        Реклама
      </span>
      <span className="font-display text-sm font-medium text-ink-faint">Рекламный блок</span>
    </div>
  );
}
