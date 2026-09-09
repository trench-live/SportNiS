import { Link } from "react-router-dom";
import { formatPriceRange } from "@/lib/format";
import { usePublicListings } from "./queries";
import type { ListingResponse } from "@/lib/api/types";

export function SimilarListings({ listing }: { listing: ListingResponse }) {
  const { data } = usePublicListings();
  if (!data) return null;

  const tags = new Set(listing.tags);
  const similar = data
    .filter((l) => l.id !== listing.id && l.tags.some((t) => tags.has(t)))
    .slice(0, 4);

  if (similar.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">Похожие объявления</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {similar.map((l) => (
          // from = текущий листинг → на детальной похожего кнопка возврата станет «Назад».
          <SimilarItem key={l.id} listing={l} fromPath={`/listings/${listing.id}`} />
        ))}
      </div>
    </section>
  );
}

function SimilarItem({ listing, fromPath }: { listing: ListingResponse; fromPath: string }) {
  const price = formatPriceRange(listing.priceFrom, listing.priceTo, listing.currency);
  return (
    <Link
      to={`/listings/${listing.id}`}
      state={{ from: fromPath }}
      className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 shadow-soft transition-[transform,box-shadow] duration-120 ease-metronome hover:-translate-y-0.5 hover:shadow-lift"
    >
      <h3 className="line-clamp-2 font-display text-sm font-semibold text-ink">{listing.title}</h3>
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        {listing.city && <span>{listing.city}</span>}
        {price && (
          <>
            <span className="text-line-strong">·</span>
            <span className="font-medium text-ink">{price}</span>
          </>
        )}
      </div>
    </Link>
  );
}
