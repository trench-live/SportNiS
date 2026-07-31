import { useParams, useLocation, Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Badge, Skeleton, ErrorState, Divider } from "@/components/ui";
import { formatListingFormat, formatPriceRange, formatRelativeDate } from "@/lib/format";
import { useListing } from "@/features/listings/queries";
import { ContactCard } from "@/features/listings/ContactCard";
import { SimilarListings } from "@/features/listings/SimilarListings";

const STATUS_LABELS = {
  PUBLISHED: null,
  ARCHIVED: "В архиве",
  CLOSED: "Закрыто",
} as const;

export function ListingDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { data: listing, isLoading, isError, refetch } = useListing(id);

  // Кнопка возврата зависит от того, откуда пришли (лента vs мои объявления).
  const from = (location.state as { from?: string } | null)?.from;
  const back =
    from === "/listings/my"
      ? { to: "/listings/my", label: "Мои объявления" }
      : from === "/replies/my"
        ? { to: "/replies/my", label: "Мои отклики" }
        : { to: "/feed", label: "Лента" };

  if (isLoading) {
    return (
      <Container size="default" className="py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </Container>
    );
  }

  if (isError || !listing) {
    return (
      <Container size="default" className="py-8">
        <ErrorState description="Объявление не найдено или недоступно." onRetry={() => refetch()} />
        <p className="mt-4 text-center text-sm">
          <Link to={back.to} className="text-accent hover:underline">
            ← {back.label}
          </Link>
        </p>
      </Container>
    );
  }

  const price = formatPriceRange(listing.priceFrom, listing.priceTo, listing.currency);
  const format = formatListingFormat(listing.format);
  const statusLabel = STATUS_LABELS[listing.status];

  return (
    <Container size="default" className="py-8">
      <Link to={back.to} className="text-sm text-ink-muted hover:text-ink">
        ← {back.label}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Основной блок */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Предложение</Badge>
            {format && <Badge tone="outline">{format}</Badge>}
            {statusLabel && <Badge tone="warning">{statusLabel}</Badge>}
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
            {listing.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            {listing.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {listing.city}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-4" aria-hidden />
              {formatRelativeDate(listing.createdAt)}
            </span>
          </div>

          {price && <p className="mt-4 font-display text-2xl font-bold text-ink">{price}</p>}

          <Divider className="my-6" />

          <div className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
            {listing.description}
          </div>

          {listing.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {listing.tags.map((tag) => (
                <span key={tag} className="rounded-badge bg-surface-alt px-2.5 py-1 text-sm text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <SimilarListings listing={listing} />
        </div>

        {/* Правый липкий блок автора */}
        <aside>
          <ContactCard listing={listing} />
        </aside>
      </div>
    </Container>
  );
}
