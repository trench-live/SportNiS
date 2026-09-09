import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { Button, FormField, Modal, Textarea, useToast } from "@/components/ui";
import { useRespondToListing } from "./queries";

export interface ContactModalProps {
  listingId: string;
  open: boolean;
  onClose: () => void;
  onResponded: () => void;
}

export function ContactModal({ listingId, open, onClose, onResponded }: ContactModalProps) {
  const [message, setMessage] = useState("");
  const respond = useRespondToListing(listingId);
  const { toast } = useToast();

  function submit() {
    respond.mutate(
      { message: message.trim() || null },
      {
        onSuccess: () => {
          toast({ message: "Отклик отправлен", tone: "success" });
          setMessage("");
          onResponded();
          onClose();
        },
      },
    );
  }

  const alreadyResponded = respond.error instanceof ApiError && respond.error.status === 409;
  const errorMessage = respond.error
    ? alreadyResponded
      ? "Вы уже откликнулись на это объявление."
      : respond.error instanceof ApiError
        ? respond.error.message
        : "Не удалось отправить отклик."
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Откликнуться"
      description="Контакты автора откроются после того, как он примет ваш отклик."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={respond.isPending}>
            Отмена
          </Button>
          <Button onClick={submit} loading={respond.isPending} disabled={alreadyResponded}>
            Отправить отклик
          </Button>
        </>
      }
    >
      <FormField label="Сообщение" hint="Необязательно">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Здравствуйте! Хочу узнать про расписание и запись…"
          maxLength={2000}
        />
      </FormField>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
