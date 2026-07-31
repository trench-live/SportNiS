import { useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Avatar, Button, useToast } from "@/components/ui";
import { readFileAsDataUrl } from "@/lib/cropImage";
import { AvatarCropDialog } from "./AvatarCropDialog";

export interface AvatarUploadFieldProps {
  /** Текущее значение аватара (URL или data URL), null — нет фото. */
  value: string | null;
  onChange: (value: string | null) => void;
  name?: string;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ на исходный файл

export function AvatarUploadField({ value, onChange, name }: AvatarUploadFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Сброс value, чтобы повторный выбор того же файла тоже срабатывал.
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ message: "Выберите файл изображения", tone: "error" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ message: "Файл больше 8 МБ", tone: "error" });
      return;
    }
    try {
      setSource(await readFileAsDataUrl(file));
    } catch {
      toast({ message: "Не удалось прочитать файл", tone: "error" });
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={value} name={name} size="xl" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="size-4" />}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Изменить фото" : "Загрузить фото"}
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() => onChange(null)}
            >
              Удалить
            </Button>
          )}
        </div>
        <p className="text-xs text-ink-faint">JPG или PNG, до 8 МБ. Можно приблизить и обрезать.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
        aria-hidden
      />

      <AvatarCropDialog
        imageSrc={source}
        onClose={() => setSource(null)}
        onCropped={(dataUrl) => onChange(dataUrl)}
      />
    </div>
  );
}
