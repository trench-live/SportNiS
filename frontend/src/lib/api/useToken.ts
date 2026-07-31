import { useSyncExternalStore } from "react";
import { getToken, subscribeToken } from "./token";

/** Реактивно читает текущий JWT из хранилища токена. */
export function useToken(): string | null {
  return useSyncExternalStore(subscribeToken, getToken, getToken);
}
