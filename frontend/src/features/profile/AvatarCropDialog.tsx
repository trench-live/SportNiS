import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { ZoomOut, ZoomIn } from "lucide-react";
import { Button, Modal, useToast } from "@/components/ui";
import { getCroppedDataUrl } from "@/lib/cropImage";

export interface AvatarCropDialogProps {
  /** data URL исходного выбранного изображения. */
  imageSrc: string | null;
  onClose: () => void;
  onCropped: (dataUrl: string) => void;
}

export function AvatarCropDialog({ imageSrc, onClose, onCropped }: AvatarCropDialogProps) {
  const { toast } = useToast();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  function reset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAreaPixels(null);
  }

  async function apply() {
    if (!imageSrc || !areaPixels) return;
    setBusy(true);
    try {
      const dataUrl = await getCroppedDataUrl(imageSrc, areaPixels);
      onCropped(dataUrl);
      reset();
      onClose();
    } catch {
      toast({ message: "Не удалось обрезать изображение", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={Boolean(imageSrc)}
      onClose={close}
      title="Фото профиля"
      description="Перетащите, чтобы выбрать область, и приблизьте ползунком."
      dismissOnBackdrop={!busy}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={busy}>
            Отмена
          </Button>
          <Button onClick={apply} loading={busy} disabled={!areaPixels}>
            Сохранить
          </Button>
        </>
      }
    >
      {imageSrc && (
        <div className="flex flex-col gap-4">
          <div className="relative h-64 w-full overflow-hidden rounded-control bg-ink">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Масштаб"
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-surface-alt accent-accent"
            />
            <ZoomIn className="size-4 shrink-0 text-ink-muted" aria-hidden />
          </div>
        </div>
      )}
    </Modal>
  );
}
