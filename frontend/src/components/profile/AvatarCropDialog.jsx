import { useEffect, useMemo, useRef, useState } from "react";

const OUTPUT_SIZE = 512;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 3;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDistance(firstTouch, secondTouch) {
  return Math.hypot(
    secondTouch.clientX - firstTouch.clientX,
    secondTouch.clientY - firstTouch.clientY
  );
}

function getRenderMetrics(image, zoom, offsetX, offsetY) {
  const baseScale = OUTPUT_SIZE / Math.min(image.width, image.height);
  const scale = baseScale * zoom;
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    width,
    height,
    x: OUTPUT_SIZE / 2 - width / 2 + offsetX,
    y: OUTPUT_SIZE / 2 - height / 2 + offsetY
  };
}

function drawPreview(context, image, zoom, offsetX, offsetY) {
  const { width, height, x, y } = getRenderMetrics(image, zoom, offsetX, offsetY);

  context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, x, y, width, height);
}

function getDragBounds(image, zoom) {
  if (!image) {
    return { x: 0, y: 0 };
  }

  const baseScale = OUTPUT_SIZE / Math.min(image.width, image.height);
  const scale = baseScale * zoom;
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    x: width / 2 + OUTPUT_SIZE,
    y: height / 2 + OUTPUT_SIZE
  };
}

export function AvatarCropDialog({ imageSrc, onClose, onApply }) {
  const canvasRef = useRef(null);
  const gestureRef = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    if (!imageSrc) {
      setImage(null);
      return undefined;
    }

    const nextImage = new Image();
    nextImage.onload = () => {
      setImage(nextImage);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    nextImage.src = imageSrc;

    return undefined;
  }, [imageSrc]);

  useEffect(() => {
    if (!imageSrc) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [imageSrc, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (scrollLocked) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [scrollLocked]);

  const dragBounds = useMemo(() => getDragBounds(image, zoom), [image, zoom]);

  useEffect(() => {
    setOffsetX((current) => clamp(current, -dragBounds.x, dragBounds.x));
    setOffsetY((current) => clamp(current, -dragBounds.y, dragBounds.y));
  }, [dragBounds.x, dragBounds.y]);

  useEffect(() => {
    if (!canvasRef.current || !image) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }

    drawPreview(context, image, zoom, offsetX, offsetY);
  }, [image, zoom, offsetX, offsetY]);

  useEffect(() => {
    function handleMouseMove(event) {
      if (!gestureRef.current || gestureRef.current.type !== "drag") {
        return;
      }

      const nextOffsetX =
        gestureRef.current.initialOffsetX + (event.clientX - gestureRef.current.startX);
      const nextOffsetY =
        gestureRef.current.initialOffsetY + (event.clientY - gestureRef.current.startY);

      setOffsetX(clamp(nextOffsetX, -dragBounds.x, dragBounds.x));
      setOffsetY(clamp(nextOffsetY, -dragBounds.y, dragBounds.y));
    }

    function handleMouseUp() {
      gestureRef.current = null;
      setDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragBounds.x, dragBounds.y]);

  if (!imageSrc) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-card modal-card crop-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="card-head">
          <h3>Обрезка аватара</h3>
        </div>

        <div className="crop-preview-shell">
          <div
            className={dragging ? "crop-preview-frame crop-preview-frame-dragging" : "crop-preview-frame"}
            onMouseEnter={() => setScrollLocked(true)}
            onMouseLeave={() => {
              setScrollLocked(false);
              gestureRef.current = null;
              setDragging(false);
            }}
            onMouseDown={(event) => {
              gestureRef.current = {
                type: "drag",
                startX: event.clientX,
                startY: event.clientY,
                initialOffsetX: offsetX,
                initialOffsetY: offsetY
              };
              setDragging(true);
            }}
            onWheel={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setZoom((current) => clamp(current - event.deltaY * 0.0015, MIN_ZOOM, MAX_ZOOM));
            }}
            onTouchStart={(event) => {
              if (event.touches.length === 1) {
                const touch = event.touches[0];
                gestureRef.current = {
                  type: "drag",
                  startX: touch.clientX,
                  startY: touch.clientY,
                  initialOffsetX: offsetX,
                  initialOffsetY: offsetY
                };
                setDragging(true);
                setScrollLocked(true);
              } else if (event.touches.length === 2) {
                gestureRef.current = {
                  type: "pinch",
                  initialDistance: getDistance(event.touches[0], event.touches[1]),
                  initialZoom: zoom
                };
                setDragging(false);
                setScrollLocked(true);
              }
            }}
            onTouchMove={(event) => {
              if (!gestureRef.current) {
                return;
              }

              if (gestureRef.current.type === "drag" && event.touches.length === 1) {
                const touch = event.touches[0];
                const nextOffsetX =
                  gestureRef.current.initialOffsetX + (touch.clientX - gestureRef.current.startX);
                const nextOffsetY =
                  gestureRef.current.initialOffsetY + (touch.clientY - gestureRef.current.startY);

                setOffsetX(clamp(nextOffsetX, -dragBounds.x, dragBounds.x));
                setOffsetY(clamp(nextOffsetY, -dragBounds.y, dragBounds.y));
              }

              if (gestureRef.current.type === "pinch" && event.touches.length === 2) {
                event.preventDefault();
                const distance = getDistance(event.touches[0], event.touches[1]);
                const nextZoom =
                  gestureRef.current.initialZoom * (distance / gestureRef.current.initialDistance);
                setZoom(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
              }
            }}
            onTouchEnd={(event) => {
              if (event.touches.length === 1) {
                const touch = event.touches[0];
                gestureRef.current = {
                  type: "drag",
                  startX: touch.clientX,
                  startY: touch.clientY,
                  initialOffsetX: offsetX,
                  initialOffsetY: offsetY
                };
                setDragging(true);
                return;
              }

              gestureRef.current = null;
              setDragging(false);
              setScrollLocked(false);
            }}
            onTouchCancel={() => {
              gestureRef.current = null;
              setDragging(false);
              setScrollLocked(false);
            }}
          >
            <div className="crop-preview-viewport">
              <canvas
                ref={canvasRef}
                className="crop-preview-canvas"
                width={OUTPUT_SIZE}
                height={OUTPUT_SIZE}
              />
            </div>
          </div>
          <div className="crop-preview-caption">
            <span>Круг показывает итоговую аватарку в реальном виде.</span>
            <span>Тяни изображение внутри круга. Пустые области сохранятся белыми.</span>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Отмена
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              if (!canvasRef.current) {
                return;
              }

              onApply(canvasRef.current.toDataURL("image/png"));
            }}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
