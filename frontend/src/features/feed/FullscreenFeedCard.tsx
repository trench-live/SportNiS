import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatListingFormat, formatPriceRange } from "@/lib/format";
import type { FeedItemResponse } from "@/lib/api/types";

function monogram(title: string): string {
  return title.trim().slice(0, 2).toUpperCase() || "—";
}

export function FullscreenFeedCard({ item }: { item: FeedItemResponse }) {
  const isListing = item.itemType === "PROVIDER_LISTING";
  const href = isListing ? `/listings/${item.itemId}` : `/users/${item.profileId}`;
  const price = formatPriceRange(item.priceFrom, item.priceTo, item.currency);
  const format = formatListingFormat(item.format);

  return (
    <Link
      to={href}
      state={{ from: "/feed" }}
      className="relative flex h-full snap-start snap-always flex-col justify-end overflow-hidden"
    >
      {/* Фон-поле (пока без фото): тёплый градиент, у листингов — с бордовым оттенком. */}
      <div
        className={
          isListing
            ? "absolute inset-0 bg-gradient-to-br from-accent-soft via-surface-alt to-base"
            : "absolute inset-0 bg-gradient-to-br from-surface to-surface-alt"
        }
      />

      {/* Крупная монограмма/аватар по центру. */}
      <div className="absolute inset-0 flex items-center justify-center">
        {item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt=""
            className="size-40 rounded-full object-cover shadow-lift"
          />
        ) : (
          <span className="font-display text-8xl font-bold text-ink/15">{monogram(item.title)}</span>
        )}
      </div>

      {/* Нижняя плашка с текстом поверх градиента. */}
      <div className="relative z-10 flex flex-col gap-3 bg-gradient-to-t from-base via-base/92 to-transparent px-6 pb-10 pt-16">
        <div>
          <Badge tone={isListing ? "accent" : "neutral"}>
            {isListing ? "Предложение" : "Ищет услугу"}
          </Badge>
        </div>

        <h2 className="line-clamp-3 font-display text-2xl font-bold leading-tight text-ink">
          {item.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
          {format && <span>{format}</span>}
          {format && item.city && <span className="text-line-strong">·</span>}
          {item.city && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3.5" aria-hidden />
              {item.city}
            </span>
          )}
        </div>

        {item.subtitle && <p className="line-clamp-2 text-sm text-ink-muted">{item.subtitle}</p>}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-badge bg-surface/80 px-2.5 py-0.5 text-xs text-ink-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <div className="min-w-0">
            {price && <div className="font-display text-lg font-bold text-ink">{price}</div>}
            <div className="truncate text-xs text-ink-faint">{item.ownerDisplayName}</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-control bg-accent px-4 py-2 text-sm font-medium text-ink-invert">
            Открыть
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
