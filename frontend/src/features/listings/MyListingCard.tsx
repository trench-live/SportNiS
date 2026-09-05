import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, MoreVertical, Pencil, Archive, XCircle, RotateCcw, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  IconButton,
  useToast,
} from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { formatListingFormat, formatPriceRange } from "@/lib/format";
import {
  useArchiveListing,
  useCloseListing,
  useDeleteListing,
  useListingResponses,
  useRestoreListing,
} from "./myQueries";
import { ResponsesDrawer } from "./ResponsesDrawer";
import type { ListingResponse, ListingStatus } from "@/lib/api/types";

type ConfirmKind = "archive" | "close" | "delete";

const STATUS: Record<ListingStatus, { label: string; tone: "success" | "neutral" | "warning" }> = {
  PUBLISHED: { label: "Опубликовано", tone: "success" },
  ARCHIVED: { label: "В архиве", tone: "neutral" },
  CLOSED: { label: "Закрыто", tone: "warning" },
};

export function MyListingCard({ listing }: { listing: ListingResponse }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const archive = useArchiveListing();
  const close = useCloseListing();
  const restore = useRestoreListing();
  const remove = useDeleteListing();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | ConfirmKind>(null);

  // Отклики — единственная доступная метрика.
  const { data: responses } = useListingResponses(listing.id, true);
  const responseCount = responses?.length ?? 0;
  const newCount = responses?.filter((r) => r.status === "NEW").length ?? 0;

  const status = STATUS[listing.status];
  const price = formatPriceRange(listing.priceFrom, listing.priceTo, listing.currency);
  const format = formatListingFormat(listing.format);
  const isActive = listing.status === "PUBLISHED";

  function onRestore() {
    restore.mutate(listing.id, {
      onSuccess: () => toast({ message: "Объявление снова в ленте", tone: "success" }),
      onError: (err) =>
        toast({
          message:
            err instanceof ApiError && err.status === 409
              ? "Срок объявления истёк — задайте новый срок или ручное закрытие, затем верните."
              : "Не удалось вернуть объявление",
          tone: "error",
        }),
    });
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            {format && <Badge tone="outline">{format}</Badge>}
          </div>
          <h3 className="font-display text-base font-semibold text-ink">{listing.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
            {listing.city && <span>{listing.city}</span>}
            {listing.city && price && <span className="text-line-strong">·</span>}
            {price && <span className="font-medium text-ink">{price}</span>}
          </div>
        </div>

        <Dropdown
          trigger={({ toggle, ref }) => (
            <span ref={ref as React.Ref<HTMLSpanElement>}>
              <IconButton label="Действия" icon={<MoreVertical />} size="sm" onClick={toggle} />
            </span>
          )}
          items={[
            {
              key: "edit",
              label: "Изменить",
              icon: <Pencil />,
              onSelect: () => navigate(`/listings/${listing.id}/edit`),
            },
            ...(isActive
              ? [
                  { key: "archive", label: "В архив", icon: <Archive />, onSelect: () => setConfirm("archive") },
                  {
                    key: "close",
                    label: "Закрыть",
                    icon: <XCircle />,
                    destructive: true,
                    onSelect: () => setConfirm("close"),
                  },
                ]
              : [
                  { key: "restore", label: "Вернуть в ленту", icon: <RotateCcw />, onSelect: onRestore },
                  {
                    key: "delete",
                    label: "Удалить",
                    icon: <Trash2 />,
                    destructive: true,
                    onSelect: () => setConfirm("delete"),
                  },
                ]),
          ]}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-120 ease-metronome hover:text-ink"
        >
          <MessageSquare className="size-4" aria-hidden />
          Отклики: {responseCount}
          {newCount > 0 && <Badge tone="accent">{newCount} новых</Badge>}
        </button>
        {isActive && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/listings/${listing.id}`, { state: { from: "/listings/my" } })}
          >
            Открыть
          </Button>
        )}
      </div>

      <ResponsesDrawer
        listingId={listing.id}
        listingTitle={listing.title}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          const mutation = confirm === "archive" ? archive : confirm === "close" ? close : remove;
          const doneMessage =
            confirm === "archive"
              ? "Объявление перенесено в архив"
              : confirm === "close"
                ? "Объявление закрыто"
                : "Объявление удалено";
          mutation.mutate(listing.id, {
            onSuccess: () => {
              toast({ message: doneMessage });
              setConfirm(null);
            },
          });
        }}
        loading={archive.isPending || close.isPending || remove.isPending}
        destructive={confirm === "close" || confirm === "delete"}
        title={
          confirm === "archive"
            ? "В архив?"
            : confirm === "close"
              ? "Закрыть объявление?"
              : "Удалить объявление?"
        }
        description={
          confirm === "archive"
            ? "Объявление скроется из ленты. Его можно будет вернуть позже."
            : confirm === "close"
              ? "Объявление закроется. История откликов сохранится, но новых не будет."
              : "Объявление и все его отклики будут удалены безвозвратно."
        }
        confirmLabel={
          confirm === "archive" ? "В архив" : confirm === "close" ? "Закрыть" : "Удалить"
        }
      />
    </Card>
  );
}
