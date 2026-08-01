import { Fragment, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Inbox } from "lucide-react";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { useInfiniteFeed } from "@/features/feed/queries";
import { FullscreenFeedCard } from "./FullscreenFeedCard";
import { FullscreenPromoSlot } from "./PromoSlot";
import { computePromoPositions, promoSeed } from "./promo";

// Позиция скролла контейнера сохраняется между заходами (возврат из детальной — на ту же карточку).
const scrollStore = new Map<string, number>();
const SCROLL_KEY = "feed-fullscreen";

/** Полноэкранная лента (портрет / мобильный): карточка на весь экран, snap-скролл. */
export function FeedFullscreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag")?.trim() || undefined;

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteFeed({ tag });

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  // Полноэкранная реклама — тот же интервал 3–4, что и в списке.
  const promoPositions = useMemo(
    () => computePromoPositions(items.length, promoSeed(tag ?? "", "")),
    [items.length, tag],
  );

  // Смена фильтра — начинаем ленту сверху (позиция старого списка неактуальна).
  useEffect(() => {
    scrollStore.set(SCROLL_KEY, 0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [tag]);

  // Восстановление позиции контейнера (не окна) — синхронно, до отрисовки.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || isLoading || items.length === 0) return;

    const saved = scrollStore.get(SCROLL_KEY);
    if (saved && saved > 0) {
      let frames = 0;
      const restore = () => {
        el.scrollTop = saved;
        if (frames++ < 10 && Math.abs(el.scrollTop - saved) > 1) requestAnimationFrame(restore);
      };
      restore();
    }
    return () => {
      scrollStore.set(SCROLL_KEY, el.scrollTop);
    };
  }, [isLoading, items.length]);

  function onScroll() {
    const el = containerRef.current;
    if (!el) return;
    scrollStore.set(SCROLL_KEY, el.scrollTop);
    // Догрузка, когда до низа осталось меньше ~1.5 экрана.
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      el.scrollTop + el.clientHeight >= el.scrollHeight - el.clientHeight * 1.5
    ) {
      fetchNextPage();
    }
  }

  const shell = "fixed inset-x-0 bottom-0 top-16 z-0 bg-base";

  if (isLoading) {
    return (
      <div className={`${shell} flex items-center justify-center`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${shell} flex items-center justify-center p-6`}>
        <ErrorState description="Не удалось загрузить ленту." onRetry={() => refetch()} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${shell} flex items-center justify-center p-6`}>
        <EmptyState
          icon={<Inbox />}
          title={tag ? "Ничего не найдено" : "Пока пусто"}
          description={
            tag
              ? "Попробуйте изменить запрос."
              : "Здесь появятся объявления и анкеты, как только они будут."
          }
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`${shell} snap-y snap-mandatory overflow-y-auto overscroll-contain`}
    >
      {items.map((item, index) => (
        <Fragment key={`${item.itemType}-${item.itemId}`}>
          <FullscreenFeedCard item={item} />
          {promoPositions.has(index) && <FullscreenPromoSlot />}
        </Fragment>
      ))}
      {isFetchingNextPage && (
        <div className="flex h-24 items-center justify-center">
          <Spinner />
        </div>
      )}
      {!hasNextPage && (
        <div className="flex h-24 items-center justify-center text-sm text-ink-faint">
          Это всё, что есть.
        </div>
      )}
    </div>
  );
}
