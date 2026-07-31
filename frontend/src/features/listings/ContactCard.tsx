import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Avatar, Button, Card, Divider, useToast } from "@/components/ui";
import { useSession } from "@/features/auth/queries";
import { useAuthDialog } from "@/features/auth/AuthDialog";
import { usePublicProfile } from "@/features/profile/queries";
import { ContactModal } from "./ContactModal";
import { useWithdrawReply } from "./queries";
import type { ListingResponse } from "@/lib/api/types";

export function ContactCard({ listing }: { listing: ListingResponse }) {
  const session = useSession();
  const auth = useAuthDialog();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: owner } = usePublicProfile(listing.ownerProfileId);
  const withdraw = useWithdrawReply(listing.id);
  const [contactOpen, setContactOpen] = useState(false);

  const isOwner = session.profile?.id === listing.ownerProfileId;
  const canRespond = listing.status === "PUBLISHED";
  const ownerName = owner?.displayName ?? "Автор";
  const replyStatus = listing.myReplyStatus;

  function openReply() {
    if (!session.isAuthenticated) {
      auth.openLogin();
      return;
    }
    setContactOpen(true);
  }

  function withdrawReply(thenReply: boolean) {
    withdraw.mutate(undefined, {
      onSuccess: () => {
        toast({ message: "Отклик отозван" });
        if (thenReply) setContactOpen(true);
      },
      onError: () => {
        // Гонка: автор мог уже принять отклик. Мутация сама обновит состояние листинга.
        toast({ message: "Не удалось отозвать — статус отклика изменился.", tone: "error" });
      },
    });
  }

  function renderBody() {
    // Контакты открыты (отклик принят).
    if (listing.contactVisibleForMe && listing.contactInfo) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" aria-hidden />
            Контакты открыты
          </div>
          <p className="rounded-control bg-surface-alt px-3 py-2 text-sm text-ink">{listing.contactInfo}</p>
        </div>
      );
    }

    if (isOwner) {
      return (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-muted">Это ваше объявление.</p>
          <Button variant="secondary" fullWidth onClick={() => navigate("/listings/my")}>
            Управлять откликами
          </Button>
        </div>
      );
    }

    if (replyStatus === "NEW") {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Clock className="size-4" aria-hidden />
            Отклик отправлен — ждите подтверждения автора.
          </div>
          <Button variant="ghost" size="sm" onClick={() => withdrawReply(false)} loading={withdraw.isPending}>
            Отозвать отклик
          </Button>
        </div>
      );
    }

    if (replyStatus === "REJECTED") {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <XCircle className="size-4 text-danger" aria-hidden />
            Автор отклонил ваш отклик.
          </div>
          <Button
            variant="secondary"
            fullWidth
            disabled={!canRespond}
            onClick={() => withdrawReply(true)}
            loading={withdraw.isPending}
          >
            Отозвать и откликнуться снова
          </Button>
        </div>
      );
    }

    // Ещё не откликался.
    return (
      <>
        <Button fullWidth disabled={!canRespond} onClick={openReply}>
          {canRespond ? "Связаться" : "Объявление закрыто"}
        </Button>
        <p className="mt-2 text-center text-xs text-ink-faint">
          Контакты откроются после принятия отклика.
        </p>
      </>
    );
  }

  return (
    <Card className="sticky top-20">
      <div className="flex items-center gap-3">
        <Avatar src={owner?.avatarUrl} name={ownerName} size="lg" />
        <div className="min-w-0">
          <Link
            to={`/users/${listing.ownerProfileId}`}
            className="block truncate font-display font-semibold text-ink hover:text-accent"
          >
            {ownerName}
          </Link>
          {owner?.city && <p className="text-sm text-ink-muted">{owner.city}</p>}
        </div>
      </div>

      <Divider className="my-4" />

      {renderBody()}

      <ContactModal
        listingId={listing.id}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        onResponded={() => setContactOpen(false)}
      />
    </Card>
  );
}
