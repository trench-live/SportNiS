import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { listingKeys } from "./queries";
import type {
  ListingCreateRequest,
  ListingReplyResponse,
  ListingResponse,
  ListingUpdateRequest,
} from "@/lib/api/types";

export const myListingKeys = {
  all: ["listings", "my"] as const,
  detail: (id: string) => ["listings", "my", id] as const,
  responses: (id: string) => ["listings", "my", id, "responses"] as const,
};

export function useMyListings() {
  return useQuery({
    queryKey: myListingKeys.all,
    queryFn: ({ signal }) => apiRequest<ListingResponse[]>("/api/v1/listings/my", { signal }),
    // Возврат на вкладку освежает список и счётчики — без кнопки и без постоянного таймера.
    refetchOnWindowFocus: true,
  });
}

export function useMyListing(id: string) {
  return useQuery({
    queryKey: myListingKeys.detail(id),
    queryFn: ({ signal }) => apiRequest<ListingResponse>(`/api/v1/listings/my/${id}`, { signal }),
    enabled: Boolean(id),
  });
}

export function useListingResponses(id: string, enabled = true) {
  return useQuery({
    queryKey: myListingKeys.responses(id),
    queryFn: ({ signal }) =>
      apiRequest<ListingReplyResponse[]>(`/api/v1/listings/my/${id}/responses`, { signal }),
    enabled: enabled && Boolean(id),
    // Освежаем на фокус вкладки; короткий staleTime — чтобы открытие панели показывало актуальное.
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ListingCreateRequest) =>
      apiRequest<ListingResponse>("/api/v1/listings", { method: "POST", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myListingKeys.all }),
  });
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ListingUpdateRequest) =>
      apiRequest<ListingResponse>(`/api/v1/listings/my/${id}`, { method: "PUT", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myListingKeys.all });
      queryClient.invalidateQueries({ queryKey: myListingKeys.detail(id) });
    },
  });
}

function useListingAction(path: (id: string) => string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<ListingResponse>(path(id), { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myListingKeys.all }),
  });
}

export function useArchiveListing() {
  return useListingAction((id) => `/api/v1/listings/my/${id}/archive`);
}

export function useCloseListing() {
  return useListingAction((id) => `/api/v1/listings/my/${id}/close`);
}

export function useRespondDecision(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ responseId, decision }: { responseId: string; decision: "accept" | "reject" }) =>
      apiRequest<ListingReplyResponse>(
        `/api/v1/listings/my/${listingId}/responses/${responseId}/${decision}`,
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myListingKeys.responses(listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
    },
    onError: () => {
      // Гонка: отклик мог быть отозван/изменён — подтягиваем актуальный список.
      queryClient.invalidateQueries({ queryKey: myListingKeys.responses(listingId) });
    },
  });
}
