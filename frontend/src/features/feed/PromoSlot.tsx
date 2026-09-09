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

/**
 * Полноэкранный рекламный слот для тикток-режима: карточка на весь экран,
 * обязательная пометка «Реклама», по сути картинка/креатив во всю площадь.
 */
export function FullscreenPromoSlot() {
  return (
    <div className="relative flex h-full snap-start snap-always items-center justify-center overflow-hidden bg-gradient-to-br from-surface-alt to-base">
      <span className="absolute left-4 top-4 rounded-badge bg-surface/80 px-2.5 py-1 text-xs font-medium text-ink-muted">
        Реклама
      </span>
      <span className="font-display text-lg font-medium text-ink-faint">Рекламный блок</span>
    </div>
  );
}
