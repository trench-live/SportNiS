import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatListingFormat, formatPriceRange } from "@/lib/format";
import type { FeedItemResponse } from "@/lib/api/types";

function monogram(title: string): string {
  return title.trim().slice(0, 2).toUpperCase() || "—";
}

export function FeedCard({ item }: { item: FeedItemResponse }) {
  const isListing = item.itemType === "PROVIDER_LISTING";
  const href = isListing ? `/listings/${item.itemId}` : `/users/${item.profileId}`;
  const price = formatPriceRange(item.priceFrom, item.priceTo, item.currency);
  const format = formatListingFormat(item.format);
  const meta = [format, item.city].filter(Boolean);

  return (
    <Link
      to={href}
      className="group block rounded-card border border-line bg-surface shadow-soft transition-[transform,box-shadow] duration-120 ease-metronome hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
    >
      <article className="flex gap-4 p-4">
        {/* Квадрат слева: фото листингов пока нет — монограмма/аватар. */}
        <div className="relative hidden size-24 shrink-0 overflow-hidden rounded-[10px] bg-surface-alt sm:block">
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-2xl font-semibold text-ink-faint">
              {monogram(item.title)}
            </span>
          )}
        </div>

        {/* Центр */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Badge tone={isListing ? "accent" : "neutral"}>
              {isListing ? "Предложение" : "Ищет услугу"}
            </Badge>
          </div>
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
            {item.title}
          </h3>
          {meta.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
              {format && <span>{format}</span>}
              {format && item.city && <span className="text-line-strong">·</span>}
              {item.city && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="size-3" aria-hidden />
                  {item.city}
                </span>
              )}
            </div>
          )}
          {item.subtitle && <p className="line-clamp-2 text-sm text-ink-muted">{item.subtitle}</p>}
          {item.tags.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-badge bg-surface-alt px-2 py-0.5 text-xs text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Правая колонка */}
        <div className="flex shrink-0 flex-col items-end justify-between text-right">
          <span className="text-xs text-ink-faint">{item.ownerDisplayName}</span>
          <div className="flex flex-col items-end gap-2">
            {price && <span className="font-display text-sm font-bold text-ink">{price}</span>}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium text-accent transition-transform duration-120 ease-metronome group-hover:translate-x-0.5",
              )}
            >
              Открыть
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
