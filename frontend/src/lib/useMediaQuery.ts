import { useSyncExternalStore } from "react";

/** Реактивно следит за медиазапросом. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Портретная ориентация (ширина < высоты) — режим полноэкранной ленты. */
export function useIsPortrait(): boolean {
  return useMediaQuery("(orientation: portrait)");
}
