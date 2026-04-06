import { useRef, useState } from "react";
import { AvatarCropDialog } from "./AvatarCropDialog";

export function AvatarUploadField({ onChange }) {
  const fileInputRef = useRef(null);
  const [cropImageSrc, setCropImageSrc] = useState("");

  return (
    <>
      <div className="field-block">
        <span>Изображение профиля</span>
        <span className="muted-text">Загрузи изображение с устройства, обрежь его и сохрани.</span>
        <input
          ref={fileInputRef}
          className="hidden-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              const result = typeof reader.result === "string" ? reader.result : "";
              setCropImageSrc(result);
              event.target.value = "";
            };
            reader.readAsDataURL(file);
          }}
        />

        <div className="avatar-upload-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Выбрать с устройства
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => onChange("")}
          >
            Убрать аватар
          </button>
        </div>
      </div>

      <AvatarCropDialog
        imageSrc={cropImageSrc}
        onClose={() => setCropImageSrc("")}
        onApply={(nextAvatar) => {
          onChange(nextAvatar);
          setCropImageSrc("");
        }}
      />
    </>
  );
}
