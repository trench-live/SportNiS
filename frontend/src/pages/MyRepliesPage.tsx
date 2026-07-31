import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, MapPin, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Button, EmptyState, ErrorState, Skeleton, Tabs } from "@/components/ui";
import { formatListingFormat, formatPriceRange } from "@/lib/format";
import { useMyReplies } from "@/features/listings/queries";
import type { ListingReplyStatus, ListingResponse } from "@/lib/api/types";

type TabKey = "ALL" | ListingReplyStatus;

const REPLY_STATUS: Record<ListingReplyStatus, { label: string; tone: "warning" | "success" | "danger" }> = {
  NEW: { label: "Ожидает ответа", tone: "warning" },
  ACCEPTED: { label: "Принят", tone: "success" },
  REJECTED: { label: "Отклонён", tone: "danger" },
};

export function MyRepliesPage() {
  const { data, isLoading, isError, refetch } = useMyReplies();
  const [tab, setTab] = useState<TabKey>("ALL");

  const counts = useMemo(() => {
    const c = { ALL: 0, NEW: 0, ACCEPTED: 0, REJECTED: 0 };
    for (const l of data ?? []) {
      c.ALL++;
      if (l.myReplyStatus) c[l.myReplyStatus]++;
    }
    return c;
  }, [data]);

  const filtered = (data ?? []).filter((l) => tab === "ALL" || l.myReplyStatus === tab);

  return (
    <Container size="default" className="py-8">
      <PageHeader title="Мои отклики" description="Объявления, на которые вы откликнулись, и статус каждого отклика." />

      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={[
            { key: "ALL", label: "Все", count: counts.ALL },
            { key: "NEW", label: "Ожидают", count: counts.NEW },
            { key: "ACCEPTED", label: "Принятые", count: counts.ACCEPTED },
            { key: "REJECTED", label: "Отклонённые", count: counts.REJECTED },
          ]}
        />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28 w-full rounded-card" />
            <Skeleton className="h-28 w-full rounded-card" />
          </div>
        ) : isError ? (
          <ErrorState description="Не удалось загрузить отклики." onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title={counts.ALL === 0 ? "Вы пока никому не откликнулись" : "В этой вкладке пусто"}
            description={counts.ALL === 0 ? "Найдите подходящее объявление в ленте и откликнитесь." : undefined}
            action={
              counts.ALL === 0 && (
                <Link to="/feed">
                  <Button size="sm">Перейти в ленту</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((l) => (
              <ReplyCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

function ReplyCard({ listing }: { listing: ListingResponse }) {
  const status = listing.myReplyStatus ? REPLY_STATUS[listing.myReplyStatus] : null;
  const price = formatPriceRange(listing.priceFrom, listing.priceTo, listing.currency);
  const format = formatListingFormat(listing.format);
  const closed = listing.status !== "PUBLISHED";

  return (
    <Link
      to={`/listings/${listing.id}`}
      state={{ from: "/replies/my" }}
      className="block rounded-card border border-line bg-surface p-4 shadow-soft transition-[transform,box-shadow] duration-120 ease-metronome hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-ink">{listing.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            {format && <span>{format}</span>}
            {format && listing.city && <span className="text-line-strong">·</span>}
            {listing.city && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="size-3" aria-hidden />
                {listing.city}
              </span>
            )}
            {price && (
              <>
                <span className="text-line-strong">·</span>
                <span className="font-medium text-ink">{price}</span>
              </>
            )}
          </div>
        </div>
        {status && <Badge tone={status.tone}>{status.label}</Badge>}
      </div>

      {listing.contactVisibleForMe && listing.contactInfo && (
        <div className="mt-3 flex items-center gap-1.5 rounded-control bg-surface-alt px-3 py-2 text-sm text-ink">
          <CheckCircle2 className="size-4 text-success" aria-hidden />
          {listing.contactInfo}
        </div>
      )}
      {closed && (
        <p className="mt-2 text-xs text-ink-faint">
          Объявление {listing.status === "ARCHIVED" ? "в архиве" : "закрыто"}.
        </p>
      )}
    </Link>
  );
}
