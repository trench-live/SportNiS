import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { ProfileResponse } from "@/lib/api/types";

export function usePublicProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["profiles", "public", id],
    queryFn: ({ signal }) => apiRequest<ProfileResponse>(`/api/v1/profiles/${id}`, { signal }),
    enabled: Boolean(id),
  });
}
