import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { setToken } from "@/lib/api/token";
import { useToken } from "@/lib/api/useToken";
import type { AuthMeResponse, MyProfileItemResponse, ProfileResponse } from "@/lib/api/types";

export const authKeys = {
  me: ["auth", "me"] as const,
  profile: ["profiles", "me"] as const,
  myProfiles: ["profiles", "my"] as const,
};

export interface Session {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMe: AuthMeResponse | null;
  profile: ProfileResponse | null;
  myProfiles: MyProfileItemResponse[];
}

/** Текущая сессия: /auth/me + активный профиль. Загружается только при наличии токена. */
export function useSession(): Session {
  const token = useToken();
  const enabled = Boolean(token);

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: () => apiRequest<AuthMeResponse>("/api/v1/auth/me"),
    enabled,
  });

  const profileQuery = useQuery({
    queryKey: authKeys.profile,
    queryFn: () => apiRequest<ProfileResponse>("/api/v1/profiles/me"),
    enabled,
  });

  const myProfilesQuery = useQuery({
    queryKey: authKeys.myProfiles,
    queryFn: () => apiRequest<MyProfileItemResponse[]>("/api/v1/profiles/my"),
    enabled,
  });

  return {
    isAuthenticated: enabled,
    isLoading: enabled && (meQuery.isLoading || profileQuery.isLoading),
    authMe: meQuery.data ?? null,
    profile: profileQuery.data ?? null,
    myProfiles: myProfilesQuery.data ?? [],
  };
}

/** Очистка токена и кэша при выходе. */
export function useLogout(): () => void {
  const queryClient = useQueryClient();
  return () => {
    setToken(null);
    // Приватные данные убираем полностью.
    queryClient.removeQueries({ queryKey: authKeys.me });
    queryClient.removeQueries({ queryKey: authKeys.profile });
    queryClient.removeQueries({ queryKey: authKeys.myProfiles });
    queryClient.removeQueries({ queryKey: ["listings"] });
    queryClient.removeQueries({ queryKey: ["profiles"] });
    // Лента зависит от роли зрителя — сбрасываем к первой странице и перезапрашиваем как гость.
    queryClient.resetQueries({ queryKey: ["feed"] });
  };
}
