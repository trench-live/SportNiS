import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { setToken } from "@/lib/api/token";
import { authKeys } from "@/features/auth/queries";
import type {
  ProfileCreateRequest,
  ProfileResponse,
  ProfileUpdateRequest,
} from "@/lib/api/types";

function useInvalidateSession() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: authKeys.me });
    queryClient.invalidateQueries({ queryKey: authKeys.profile });
    queryClient.invalidateQueries({ queryKey: authKeys.myProfiles });
  };
}

export function useUpdateProfile() {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: (body: ProfileUpdateRequest) =>
      apiRequest<ProfileResponse>("/api/v1/profiles/me", { method: "PUT", body }),
    onSuccess: invalidate,
  });
}

export function useSearchingToggle() {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: (isLookingFor: boolean) =>
      apiRequest<ProfileResponse>("/api/v1/profiles/me/searching", {
        method: "PUT",
        body: { isLookingFor },
      }),
    onSuccess: invalidate,
  });
}

export function useCreateProfile() {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: (body: ProfileCreateRequest) =>
      apiRequest<ProfileResponse>("/api/v1/profiles", { method: "POST", body }),
    onSuccess: invalidate,
  });
}

export function useSwitchProfile() {
  const invalidate = useInvalidateSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) =>
      apiRequest<ProfileResponse>("/api/v1/profiles/me/switch", {
        method: "POST",
        body: { profileId },
      }),
    onSuccess: () => {
      invalidate();
      // Смена активного профиля меняет роль зрителя — лента другая.
      queryClient.resetQueries({ queryKey: ["feed"] });
      // Мои объявления тоже принадлежат конкретному профилю.
      queryClient.invalidateQueries({ queryKey: ["listings", "my"] });
    },
  });
}

/** Удаляет активный профиль. Бэкенд запрещает удалять последний и сам переключает активный. */
export function useDeleteProfile() {
  const invalidate = useInvalidateSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<void>("/api/v1/profiles/me", { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      // Активный профиль сменился — роль зрителя и «Мои объявления» другие.
      queryClient.resetQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["listings", "my"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<void>("/api/v1/auth/me", { method: "DELETE" }),
    onSuccess: () => {
      setToken(null);
      queryClient.clear();
    },
  });
}
