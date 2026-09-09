import { useEffect } from "react";

/** Закрытие оверлея по Escape + опциональная блокировка скролла body. */
export function useDismiss(open: boolean, onClose: () => void, lockScroll = true) {
  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    let previousOverflow = "";
    if (lockScroll) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      if (lockScroll) document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, lockScroll]);
}
