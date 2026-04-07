import { useCallback, useEffect, useState } from "react";

export function useTimedMessage(displayDuration = 4000, fadeDuration = 400) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, displayDuration);

    const cleanupTimer = setTimeout(() => {
      setMessage("");
    }, displayDuration + fadeDuration);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(cleanupTimer);
    };
  }, [displayDuration, fadeDuration, message]);

  const showMessage = useCallback((nextMessage) => {
    setMessage("");
    requestAnimationFrame(() => {
      setMessage(nextMessage);
    });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    visible,
    showMessage,
    clearMessage
  };
}
