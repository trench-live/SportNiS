import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { setToken } from "@/lib/api/token";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/lib/api/types";

/**
 * Возвращает позицию скролла на несколько кадров после смены токена —
 * страховка от кратковременного реколла при фоновом перезапросе ленты.
 */
function preserveScroll() {
  const y = window.scrollY;
  if (y === 0) return;
  let frames = 0;
  const restore = () => {
    window.scrollTo(0, y);
    if (++frames < 6) requestAnimationFrame(restore);
  };
  requestAnimationFrame(restore);
}

/** Вход: сохраняет токен и сбрасывает кэш сессии. */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) =>
      apiRequest<AuthResponse>("/api/v1/auth/login", { method: "POST", body }),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries();
      preserveScroll();
    },
  });
}

/** Регистрация: сразу авторизует по возвращённому токену. */
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) =>
      apiRequest<AuthResponse>("/api/v1/auth/register", { method: "POST", body }),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries();
      preserveScroll();
    },
  });
}
