import { useParams, Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Avatar, Badge, Card, ErrorState, Skeleton, EmptyState } from "@/components/ui";
import { PROFILE_TYPE_LABELS, formatPriceRange } from "@/lib/format";
import { usePublicProfile } from "@/features/profile/queries";
import { usePublicListings } from "@/features/listings/queries";
import type { ListingResponse } from "@/lib/api/types";

export function PublicProfilePage() {
  const { id = "" } = useParams();
  const { data: profile, isLoading, isError, refetch } = usePublicProfile(id);
  const { data: allListings } = usePublicListings();

  if (isLoading) {
    return (
      <Container size="default" className="py-8">
        <Skeleton className="h-40 w-full rounded-card" />
      </Container>
    );
  }

  if (isError || !profile) {
    return (
      <Container size="default" className="py-8">
        <ErrorState description="Профиль не найден или скрыт." onRetry={() => refetch()} />
        <p className="mt-4 text-center text-sm">
          <Link to="/feed" className="text-accent hover:underline">
            ← В ленту
          </Link>
        </p>
      </Container>
    );
  }

  const isProvider = profile.profileType === "PROVIDER";
  const listings = (allListings ?? []).filter((l) => l.ownerProfileId === profile.id);

  return (
    <Container size="default" className="py-8">
      <Card padded={false} className="overflow-hidden">
        <div className="h-24 bg-surface-alt" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:gap-5">
          <Avatar
            src={profile.avatarUrl}
            name={profile.displayName}
            size="xl"
            className="-mt-16 border-4 border-surface"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{profile.displayName}</h1>
              <Badge tone={isProvider ? "accent" : "neutral"}>
                {PROFILE_TYPE_LABELS[profile.profileType]}
              </Badge>
              {profile.isLookingFor && (
                <Badge tone="success" leftIcon={<Search />}>
                  В поиске
                </Badge>
              )}
            </div>
            {profile.city && (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
                <MapPin className="size-4" aria-hidden />
                {profile.city}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          {profile.about && (
            <Card>
              <h2 className="mb-2 font-display text-sm font-semibold text-ink">О себе</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">{profile.about}</p>
            </Card>
          )}
          {profile.sportsTags.length > 0 && (
            <Card>
              <h2 className="mb-2 font-display text-sm font-semibold text-ink">Виды спорта</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.sportsTags.map((tag) => (
                  <span key={tag} className="rounded-badge bg-surface-alt px-2.5 py-1 text-sm text-ink-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Объявления</h2>
          {isProvider ? (
            listings.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {listings.map((l) => (
                  <ListingTile key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <EmptyState title="Нет активных объявлений" />
            )
          ) : (
            <p className="text-sm text-ink-muted">
              Этот профиль ищет услугу и не размещает объявлений.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}

function ListingTile({ listing }: { listing: ListingResponse }) {
  const price = formatPriceRange(listing.priceFrom, listing.priceTo, listing.currency);
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-4 shadow-soft transition-[transform,box-shadow] duration-120 ease-metronome hover:-translate-y-0.5 hover:shadow-lift"
    >
      <h3 className="line-clamp-2 font-display text-sm font-semibold text-ink">{listing.title}</h3>
      <p className="line-clamp-2 text-xs text-ink-muted">{listing.description}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {listing.city && <span className="text-ink-muted">{listing.city}</span>}
        {price && <span className="font-medium text-ink">{price}</span>}
      </div>
    </Link>
  );
}
