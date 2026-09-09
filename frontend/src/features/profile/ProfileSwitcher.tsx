import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  FormField,
  IconButton,
  Input,
  Select,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api/client";
import { PROFILE_TYPE_LABELS } from "@/lib/format";
import { useCreateProfile, useDeleteProfile, useSwitchProfile } from "./mutations";
import type { MyProfileItemResponse, ProfileType } from "@/lib/api/types";

interface Props {
  myProfiles: MyProfileItemResponse[];
  activeProfileId: string | undefined;
}

export function ProfileSwitcher({ myProfiles, activeProfileId }: Props) {
  const { toast } = useToast();
  const switchProfile = useSwitchProfile();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();

  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<ProfileType>("PROVIDER");
  const [newName, setNewName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const activeProfile = myProfiles.find((p) => p.id === activeProfileId);
  const canDelete = myProfiles.length > 1;

  function handleSwitch(id: string) {
    if (id === activeProfileId) return;
    switchProfile.mutate(id, {
      onSuccess: () => toast({ message: "Активный профиль переключён", tone: "success" }),
    });
  }

  function handleCreate() {
    if (!newName.trim()) return;
    createProfile.mutate(
      { profileType: newType, displayName: newName.trim() },
      {
        onSuccess: () => {
          toast({ message: "Профиль добавлен", tone: "success" });
          setAdding(false);
          setNewName("");
        },
      },
    );
  }

  function handleDelete() {
    deleteProfile.mutate(undefined, {
      onSuccess: () => {
        toast({ message: "Профиль удалён" });
        setDeleteOpen(false);
      },
    });
  }

  const deleteError =
    deleteProfile.error instanceof ApiError
      ? deleteProfile.error.message
      : deleteProfile.error
        ? "Не удалось удалить профиль."
        : null;

  return (
    <Card>
      <h2 className="mb-3 font-display text-sm font-semibold text-ink">Профили</h2>
      <div className="flex flex-col gap-2">
        {myProfiles.map((p) => {
          const active = p.id === activeProfileId;
          if (active) {
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-control border border-accent bg-accent-soft px-3 py-2.5"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">{p.displayName}</span>
                  <span className="text-xs text-ink-muted">{PROFILE_TYPE_LABELS[p.profileType]}</span>
                </span>
                <div className="flex items-center gap-1">
                  <Badge tone="accent" leftIcon={<Check />}>
                    Активный
                  </Badge>
                  {canDelete && (
                    <IconButton
                      label="Удалить этот профиль"
                      icon={<Trash2 />}
                      size="sm"
                      onClick={() => setDeleteOpen(true)}
                      className="text-danger hover:bg-danger/10"
                    />
                  )}
                </div>
              </div>
            );
          }
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSwitch(p.id)}
              disabled={switchProfile.isPending}
              className={cn(
                "flex items-center justify-between rounded-control border border-line px-3 py-2.5 text-left transition-colors duration-120 ease-metronome hover:border-line-strong",
              )}
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-ink">{p.displayName}</span>
                <span className="text-xs text-ink-muted">{PROFILE_TYPE_LABELS[p.profileType]}</span>
              </span>
              <span className="text-xs text-accent">Переключиться</span>
            </button>
          );
        })}
      </div>

      {!canDelete && (
        <p className="mt-2 text-xs text-ink-faint">
          Единственный профиль удалить нельзя. Чтобы удалить этот — сначала добавьте второй.
        </p>
      )}

      {adding ? (
        <div className="mt-3 flex flex-col gap-3 rounded-control border border-line p-3">
          <FormField label="Тип профиля">
            <Select value={newType} onChange={(e) => setNewType(e.target.value as ProfileType)}>
              <option value="CONSUMER">Ищу услугу (consumer)</option>
              <option value="PROVIDER">Предлагаю услугу (provider)</option>
            </Select>
          </FormField>
          <FormField label="Название профиля">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Coach Alex" />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Отмена
            </Button>
            <Button size="sm" onClick={handleCreate} loading={createProfile.isPending} disabled={!newName.trim()}>
              Добавить
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <Button variant="secondary" size="sm" leftIcon={<Plus className="size-4" />} onClick={() => setAdding(true)}>
            Добавить профиль
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteProfile.isPending}
        destructive
        title="Удалить профиль?"
        description={
          activeProfile
            ? `Профиль «${activeProfile.displayName}» и все его объявления будут удалены. Активным станет другой профиль.`
            : undefined
        }
        confirmLabel="Удалить профиль"
      >
        {deleteError && (
          <p role="alert" className="text-sm text-danger">
            {deleteError}
          </p>
        )}
      </ConfirmDialog>
    </Card>
  );
}
