import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, FormField, Input, Textarea, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { useUpdateProfile } from "./mutations";
import { AvatarUploadField } from "./AvatarUploadField";
import type { ProfileResponse } from "@/lib/api/types";

function toForm(profile: ProfileResponse) {
  return {
    displayName: profile.displayName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    city: profile.city ?? "",
    about: profile.about ?? "",
    sportsTags: (profile.sportsTags ?? []).join(", "),
  };
}

export function ProfileEditForm({
  profile,
  onSaved,
}: {
  profile: ProfileResponse;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState(() => toForm(profile));
  const update = useUpdateProfile();
  const { toast } = useToast();

  // Синхронизация при переключении активного профиля.
  useEffect(() => {
    setForm(toForm(profile));
  }, [profile]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate(
      {
        displayName: form.displayName.trim(),
        avatarUrl: form.avatarUrl.trim() || null,
        city: form.city.trim() || null,
        about: form.about.trim() || null,
        sportsTags: form.sportsTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          toast({ message: "Профиль сохранён", tone: "success" });
          onSaved?.();
        },
      },
    );
  }

  const apiError =
    update.error instanceof ApiError
      ? update.error.message
      : update.error
        ? "Не удалось сохранить профиль."
        : null;

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Фото профиля</span>
          <AvatarUploadField
            value={form.avatarUrl || null}
            onChange={(v) => set("avatarUrl", v ?? "")}
            name={form.displayName}
          />
        </div>
        <FormField label="Имя / название" required error={!form.displayName.trim() ? "Обязательное поле" : undefined}>
          <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Город">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Москва" />
          </FormField>
          <FormField label="Виды спорта" hint="Через запятую">
            <Input
              value={form.sportsTags}
              onChange={(e) => set("sportsTags", e.target.value)}
              placeholder="плавание, бег"
            />
          </FormField>
        </div>
        <FormField label="О себе">
          <Textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={5} />
        </FormField>

        {apiError && (
          <p role="alert" className="text-sm text-danger">
            {apiError}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending} disabled={!form.displayName.trim()}>
            Сохранить
          </Button>
        </div>
      </form>
    </Card>
  );
}
