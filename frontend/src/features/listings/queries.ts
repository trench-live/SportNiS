import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type {
  ListingReplyCreateRequest,
  ListingReplyResponse,
  ListingResponse,
} from "@/lib/api/types";

export const listingKeys = {
  detail: (id: string) => ["listings", "detail", id] as const,
  publicList: ["listings", "public"] as const,
  myReplies: ["listings", "my-replies"] as const,
};

/** Листинги, на которые откликнулся текущий профиль (для consumer «Мои отклики»). */
export function useMyReplies() {
  return useQuery({
    queryKey: listingKeys.myReplies,
    queryFn: ({ signal }) => apiRequest<ListingResponse[]>("/api/v1/listings/responses/my", { signal }),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: ({ signal }) => apiRequest<ListingResponse>(`/api/v1/listings/${id}`, { signal }),
    enabled: Boolean(id),
    // Возврат на вкладку освежает статус: откликнувшийся увидит решение автора
    // (контакты открыты / отклонён) без перезагрузки.
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

/** Все публичные листинги (только фильтр по type на бэке) — для блока «похожие». */
export function usePublicListings() {
  return useQuery({
    queryKey: listingKeys.publicList,
    queryFn: ({ signal }) => apiRequest<ListingResponse[]>("/api/v1/listings", { signal }),
  });
}

export function useRespondToListing(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ListingReplyCreateRequest) =>
      apiRequest<ListingReplyResponse>(`/api/v1/listings/${listingId}/responses`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
      // Новый/повторный отклик должен появиться в «Мои отклики».
      queryClient.invalidateQueries({ queryKey: listingKeys.myReplies });
    },
  });
}

/** Отзыв своего отклика — освобождает возможность откликнуться заново. */
export function useWithdrawReply(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<void>(`/api/v1/listings/${listingId}/responses/me`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
      // Отозванный отклик должен исчезнуть из «Мои отклики».
      queryClient.invalidateQueries({ queryKey: listingKeys.myReplies });
    },
    onError: () => {
      // Гонка (напр. отклик уже принят) — подтягиваем актуальный статус листинга и список.
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.myReplies });
    },
  });
}
