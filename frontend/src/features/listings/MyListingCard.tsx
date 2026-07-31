import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, MoreVertical, Pencil, Archive, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  IconButton,
  useToast,
} from "@/components/ui";
import { formatListingFormat, formatPriceRange } from "@/lib/format";
import { useArchiveListing, useCloseListing, useListingResponses } from "./myQueries";
import { ResponsesDrawer } from "./ResponsesDrawer";
import type { ListingResponse, ListingStatus } from "@/lib/api/types";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "archive" | "close">(null);

  // Отклики — единственная доступная метрика.
  const { data: responses } = useListingResponses(listing.id, true);
  const responseCount = responses?.length ?? 0;
  const newCount = responses?.filter((r) => r.status === "NEW").length ?? 0;

  const status = STATUS[listing.status];
  const price = formatPriceRange(listing.priceFrom, listing.priceTo, listing.currency);
  const format = formatListingFormat(listing.format);
  const isActive = listing.status === "PUBLISHED";

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
              : []),
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
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/listings/${listing.id}`, { state: { from: "/listings/my" } })}
        >
          Открыть
        </Button>
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
          const action = confirm === "archive" ? archive : close;
          const label = confirm === "archive" ? "перенесено в архив" : "закрыто";
          action.mutate(listing.id, {
            onSuccess: () => {
              toast({ message: `Объявление ${label}` });
              setConfirm(null);
            },
          });
        }}
        loading={archive.isPending || close.isPending}
        destructive={confirm === "close"}
        title={confirm === "archive" ? "В архив?" : "Закрыть объявление?"}
        description={
          confirm === "archive"
            ? "Объявление скроется из ленты. Его можно будет вернуть позже."
            : "Объявление закроется. История откликов сохранится, но новых не будет."
        }
        confirmLabel={confirm === "archive" ? "В архив" : "Закрыть"}
      />
    </Card>
  );
}
