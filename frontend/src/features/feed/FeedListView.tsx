import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Inbox } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip, EmptyState, ErrorState, Input, Spinner } from "@/components/ui";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useIntersection } from "@/lib/useIntersection";
import { useScrollRestoration } from "@/lib/useScrollRestoration";
import { useInfiniteFeed } from "@/features/feed/queries";
import { FeedCard } from "@/features/feed/FeedCard";
import { FeedCardSkeleton } from "@/features/feed/FeedCardSkeleton";
import { SearchBar } from "@/features/feed/SearchBar";
import { PromoSlot } from "@/features/feed/PromoSlot";
import { computePromoPositions, promoSeed } from "@/features/feed/promo";

/** Обычная лента-список (десктоп / ландшафт). */
export function FeedListView() {
  const [searchParams] = useSearchParams();
  const [tagInput, setTagInput] = useState(() => searchParams.get("tag") ?? "");
  const [cityInput, setCityInput] = useState(() => searchParams.get("city") ?? "");

  const tag = useDebouncedValue(tagInput.trim());
  const city = useDebouncedValue(cityInput.trim());

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteFeed({ tag: tag || undefined, city: city || undefined });

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const hasFilters = Boolean(tag || city);

  const seed = useMemo(() => promoSeed(tag, city), [tag, city]);
  const promoPositions = useMemo(
    () => computePromoPositions(items.length, seed),
    [items.length, seed],
  );

  useScrollRestoration("feed", !isLoading && items.length > 0 && !hasFilters);

  const sentinelRef = useIntersection<HTMLDivElement>(
    () => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    Boolean(hasNextPage),
  );

  return (
    <Container size="narrow" className="py-8">
      <PageHeader
        title="Лента"
        description="Предложения тренеров и организаций, а также те, кто ищет услугу."
      />

      <div className="mt-6 flex flex-col gap-3">
        <SearchBar value={tagInput} onChange={setTagInput} placeholder="Вид спорта или тег" />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            leftIcon={<MapPin />}
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Город"
            className="h-10 max-w-56"
          />
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {tag && <Chip onRemove={() => setTagInput("")}>{tag}</Chip>}
              {city && <Chip onRemove={() => setCityInput("")}>{city}</Chip>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-3" aria-busy>
            {Array.from({ length: 5 }).map((_, i) => (
              <FeedCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState description="Не удалось загрузить ленту." onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title={hasFilters ? "Ничего не найдено" : "Пока пусто"}
            description={
              hasFilters
                ? "Попробуйте изменить фильтры или очистить поиск."
                : "Здесь появятся объявления и анкеты, как только они будут."
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <Fragment key={`${item.itemType}-${item.itemId}`}>
                  <FeedCard item={item} />
                  {promoPositions.has(index) && <PromoSlot />}
                </Fragment>
              ))}
            </div>

            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
            {!hasNextPage && (
              <p className="py-6 text-center text-sm text-ink-faint">Это всё, что есть.</p>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
