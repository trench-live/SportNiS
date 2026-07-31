import { useEffect, useRef } from "react";

/**
 * Вызывает onIntersect, когда наблюдаемый элемент попадает в область видимости.
 * Используется как «сентинел» для догрузки следующей порции ленты.
 */
export function useIntersection<T extends HTMLElement>(
  onIntersect: () => void,
  enabled: boolean,
  rootMargin = "400px",
) {
  const ref = useRef<T>(null);
  const callback = useRef(onIntersect);
  callback.current = onIntersect;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callback.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return ref;
}
