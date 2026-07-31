import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Megaphone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, EmptyState, ErrorState, Tabs, Card, Skeleton } from "@/components/ui";
import { useSession } from "@/features/auth/queries";
import { useMyListings } from "@/features/listings/myQueries";
import { MyListingCard } from "@/features/listings/MyListingCard";
import type { ListingStatus } from "@/lib/api/types";

type TabKey = "ALL" | ListingStatus;

export function MyListingsPage() {
  const session = useSession();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useMyListings();
  const [tab, setTab] = useState<TabKey>("ALL");

  const counts = useMemo(() => {
    const c = { ALL: 0, PUBLISHED: 0, ARCHIVED: 0, CLOSED: 0 };
    for (const l of data ?? []) {
      c.ALL++;
      c[l.status]++;
    }
    return c;
  }, [data]);

  const filtered = (data ?? []).filter((l) => tab === "ALL" || l.status === tab);
  const isConsumer = session.profile?.profileType === "CONSUMER";

  return (
    <Container size="default" className="py-8">
      <PageHeader
        title="Мои объявления"
        action={
          !isConsumer && (
            <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate("/listings/new")}>
              Создать
            </Button>
          )
        }
      />

      {isConsumer ? (
        <Card className="mt-6">
          <div className="flex flex-col items-start gap-3">
            <Megaphone className="size-6 text-ink-muted" aria-hidden />
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Объявления размещают провайдеры
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Ваш активный профиль ищет услугу. Чтобы публиковать объявления, переключитесь на профиль
                провайдера или создайте его в настройках.
              </p>
            </div>
            <Link
              to="/account"
              className="text-sm font-medium text-accent hover:underline"
            >
              Перейти в настройки профилей →
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-6">
            <Tabs
              value={tab}
              onChange={(k) => setTab(k as TabKey)}
              items={[
                { key: "ALL", label: "Все", count: counts.ALL },
                { key: "PUBLISHED", label: "Активные", count: counts.PUBLISHED },
                { key: "ARCHIVED", label: "В архиве", count: counts.ARCHIVED },
                { key: "CLOSED", label: "Закрытые", count: counts.CLOSED },
              ]}
            />
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-32 w-full rounded-card" />
                <Skeleton className="h-32 w-full rounded-card" />
              </div>
            ) : isError ? (
              <ErrorState description="Не удалось загрузить объявления." onRetry={() => refetch()} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Megaphone />}
                title={counts.ALL === 0 ? "У вас пока нет объявлений" : "В этой вкладке пусто"}
                description={counts.ALL === 0 ? "Создайте первое объявление — оно появится в ленте." : undefined}
                action={
                  counts.ALL === 0 && (
                    <Button size="sm" onClick={() => navigate("/listings/new")}>
                      Создать объявление
                    </Button>
                  )
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((l) => (
                  <MyListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Container>
  );
}
