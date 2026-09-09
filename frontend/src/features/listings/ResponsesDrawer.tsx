import { Link } from "react-router-dom";
import { Avatar, Badge, Button, Drawer, EmptyState, ErrorState, Skeleton, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { formatRelativeDate } from "@/lib/format";
import { usePublicProfile } from "@/features/profile/queries";
import { useListingResponses, useRespondDecision } from "./myQueries";
import type { ListingReplyResponse, ListingReplyStatus } from "@/lib/api/types";

const STATUS: Record<ListingReplyStatus, { label: string; tone: "neutral" | "success" | "danger" }> = {
  NEW: { label: "Новый", tone: "neutral" },
  ACCEPTED: { label: "Принят", tone: "success" },
  REJECTED: { label: "Отклонён", tone: "danger" },
};

interface Props {
  listingId: string;
  listingTitle: string;
  open: boolean;
  onClose: () => void;
}

export function ResponsesDrawer({ listingId, listingTitle, open, onClose }: Props) {
  const { data, isLoading, isError, refetch } = useListingResponses(listingId, open);

  return (
    <Drawer open={open} onClose={onClose} title="Отклики">
      <p className="mb-4 line-clamp-2 text-sm text-ink-muted">{listingTitle}</p>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      ) : isError ? (
        <ErrorState description="Не удалось загрузить отклики." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Пока нет откликов" description="Когда кто-то откликнется, отклик появится здесь." />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((reply) => (
            <ResponseRow key={reply.id} reply={reply} listingId={listingId} />
          ))}
        </div>
      )}
    </Drawer>
  );
}

function ResponseRow({ reply, listingId }: { reply: ListingReplyResponse; listingId: string }) {
  const { data: responder } = usePublicProfile(reply.responderProfileId);
  const decision = useRespondDecision(listingId);
  const { toast } = useToast();
  const status = STATUS[reply.status];
  const name = responder?.displayName ?? "Пользователь";

  function decide(d: "accept" | "reject") {
    decision.mutate(
      { responseId: reply.id, decision: d },
      {
        onSuccess: () =>
          toast({
            message: d === "accept" ? "Отклик принят — контакты открыты" : "Отклик отклонён",
            tone: d === "accept" ? "success" : "neutral",
          }),
        onError: (error) => {
          const gone = error instanceof ApiError && (error.status === 404 || error.status === 409);
          toast({
            message: gone
              ? "Отклик уже отозван или изменён — список обновлён."
              : "Не удалось обработать отклик.",
            tone: "error",
          });
        },
      },
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <Link to={`/users/${reply.responderProfileId}`} className="flex min-w-0 items-center gap-2">
          <Avatar src={responder?.avatarUrl} name={name} size="sm" />
          <span className="truncate text-sm font-medium text-ink hover:text-accent">{name}</span>
        </Link>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      {reply.message && <p className="mt-2 text-sm text-ink-muted">{reply.message}</p>}
      <p className="mt-1 text-xs text-ink-faint">{formatRelativeDate(reply.createdAt)}</p>
      {reply.status === "NEW" && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => decide("accept")} loading={decision.isPending}>
            Принять
          </Button>
          <Button size="sm" variant="ghost" onClick={() => decide("reject")} disabled={decision.isPending}>
            Отклонить
          </Button>
        </div>
      )}
      {reply.status === "REJECTED" && (
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={() => decide("accept")} loading={decision.isPending}>
            Передумал — принять
          </Button>
        </div>
      )}
      {reply.status === "ACCEPTED" && (
        <div className="mt-3">
          <Button size="sm" variant="ghost" onClick={() => decide("reject")} disabled={decision.isPending}>
            Передумал — отклонить
          </Button>
        </div>
      )}
    </div>
  );
}
