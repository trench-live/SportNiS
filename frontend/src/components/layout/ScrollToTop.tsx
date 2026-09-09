import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Пути, где позицией скролла управляет восстановление (useScrollRestoration) — их не трогаем.
const PRESERVE_SCROLL = new Set(["/feed"]);

/**
 * React Router сам не прокручивает наверх при переходе на новый экран.
 * Прокручиваем в начало при смене маршрута, кроме страниц с восстановлением позиции.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    if (PRESERVE_SCROLL.has(pathname)) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
