import { useLayoutEffect } from "react";

const store = new Map<string, number>();

/**
 * Сохраняет позицию скролла окна под ключом и восстанавливает её при возврате.
 * enabled — восстанавливать только когда контент уже отрисован (из кэша).
 *
 * Тонкость: используем useLayoutEffect, а не useEffect. Пассивный cleanup
 * выполнялся бы уже после смены роута, когда короткая страница схлопнула высоту
 * документа и браузер прижал скролл к нулю — и в стор попадал бы ноль.
 * Layout-cleanup снимает слушатель синхронно, до этого асинхронного события,
 * поэтому в сторе остаётся последняя реальная позиция пользователя.
 */
export function useScrollRestoration(key: string, enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    const saved = store.get(key);
    if (saved && saved > 0) {
      let frames = 0;
      const restore = () => {
        window.scrollTo(0, saved);
        // Повторяем, пока не достигли позиции (список дорос по высоте из кэша) или до лимита кадров.
        if (frames++ < 10 && Math.abs(window.scrollY - saved) > 1) {
          rafId = requestAnimationFrame(restore);
        }
      };
      restore();
    }

    const save = () => store.set(key, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", save);
    };
  }, [key, enabled]);
}
