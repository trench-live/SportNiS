import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Modal, FormField, Input, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { useDeleteAccount } from "./mutations";

const CONFIRM_WORD = "УДАЛИТЬ";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const del = useDeleteAccount();
  const navigate = useNavigate();
  const { toast } = useToast();

  function confirm() {
    del.mutate(undefined, {
      onSuccess: () => {
        toast({ message: "Аккаунт удалён" });
        navigate("/");
      },
    });
  }

  const apiError =
    del.error instanceof ApiError ? del.error.message : del.error ? "Не удалось удалить аккаунт." : null;

  return (
    <Card className="border-danger/30">
      <h2 className="font-display text-sm font-semibold text-danger">Опасная зона</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Удаление аккаунта — это не то же самое, что удаление профиля: здесь удаляется весь аккаунт со
        всеми профилями и объявлениями, безвозвратно. Отдельный профиль удаляется в блоке «Профили».
        А чтобы просто скрыться из ленты — выключите «Режим поиска» (для тех, кто ищет услугу) или
        снимите объявления с публикации (для тех, кто предлагает).
      </p>
      <div className="mt-4">
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          Удалить аккаунт
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Удалить аккаунт?"
        description="Аккаунт, все профили и объявления будут удалены безвозвратно."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={del.isPending}>
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={confirm}
              loading={del.isPending}
              disabled={word.trim().toUpperCase() !== CONFIRM_WORD}
            >
              Удалить навсегда
            </Button>
          </>
        }
      >
        <FormField label={`Введите слово «${CONFIRM_WORD}» для подтверждения`}>
          <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder={CONFIRM_WORD} />
        </FormField>
        {apiError && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {apiError}
          </p>
        )}
      </Modal>
    </Card>
  );
}
