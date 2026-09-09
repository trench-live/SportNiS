import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { FeedResponse } from "@/lib/api/types";

export const DEFAULT_PAGE_SIZE = 12;

export interface FeedFilters {
  city?: string;
  tag?: string;
}

/** Бесконечная лента: страницы догружаются и накапливаются в кэше. */
export function useInfiniteFeed({ city, tag }: FeedFilters) {
  // Токен не входит в ключ намеренно: при входе/выходе запрос остаётся тем же,
  // уже загруженные страницы остаются на экране и фоново перезапрашиваются
  // с новым токеном — высота списка не схлопывается, позиция скролла сохраняется.
  // Смену роли (гость/consumer/provider) закрывает invalidateQueries при auth.
  return useInfiniteQuery({
    queryKey: ["feed", { size: DEFAULT_PAGE_SIZE, city: city ?? "", tag: tag ?? "" }],
    queryFn: ({ pageParam, signal }) =>
      apiRequest<FeedResponse>("/api/v1/feed", {
        query: { page: pageParam, size: DEFAULT_PAGE_SIZE, city, tag },
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    // Возврат в ленту (ремаунт) не должен перезапрашивать: данные берём из кэша.
    // Обновление — только явной инвалидацией при смене роли (логин/логаут/переключение профиля)
    // или при смене фильтров (новый ключ запроса).
    refetchOnMount: false,
    staleTime: 5 * 60_000,
  });
}
