import { Link } from "react-router-dom";
import { CheckCircle2, Search } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Button, Card, Spinner, useToast } from "@/components/ui";
import { useSession } from "@/features/auth/queries";
import { useSearchingToggle } from "@/features/profile/mutations";
import { ProfileEditForm } from "@/features/profile/ProfileEditForm";
import { ProfileSwitcher } from "@/features/profile/ProfileSwitcher";
import { DangerZone } from "@/features/profile/DangerZone";

const FIELD_LABELS: Record<string, string> = {
  displayName: "Имя",
  about: "О себе",
  sportsTags: "Виды спорта",
  avatarUrl: "Аватар",
  city: "Город",
};

export function AccountPage() {
  const session = useSession();
  const searching = useSearchingToggle();
  const { toast } = useToast();
  const profile = session.profile;

  if (session.isLoading || !profile) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  const isConsumer = profile.profileType === "CONSUMER";
  const isComplete = profile.completionStatus === "COMPLETED";

  return (
    <Container size="default" className="py-8">
      <PageHeader
        title="Настройки аккаунта"
        description={session.authMe?.email ?? session.authMe?.phone ?? undefined}
        action={
          <Link
            to={`/users/${profile.id}`}
            className="inline-flex h-9 items-center rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink transition-colors duration-120 ease-metronome hover:bg-surface-alt"
          >
            Открыть публичный профиль
          </Link>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {!isComplete && (
            <Card className="border-warning/40 bg-warning/5">
              <h2 className="font-display text-sm font-semibold text-ink">Профиль заполнен не полностью</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Заполните, чтобы профиль стал завершённым:{" "}
                {profile.missingFields.map((f) => FIELD_LABELS[f] ?? f).join(", ")}.
              </p>
            </Card>
          )}
          {isComplete && (
            <div className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              Профиль заполнен полностью
            </div>
          )}

          <ProfileEditForm profile={profile} />
        </div>

        <div className="flex flex-col gap-6">
          {isConsumer && (
            <Card>
              <h2 className="font-display text-sm font-semibold text-ink">Режим поиска</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Включите, чтобы ваша анкета показывалась в ленте тем, кто предлагает услуги.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={profile.isLookingFor ? "success" : "neutral"} leftIcon={<Search />}>
                  {profile.isLookingFor ? "В поиске" : "Скрыт из поиска"}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={searching.isPending}
                  onClick={() =>
                    searching.mutate(!profile.isLookingFor, {
                      onSuccess: (updated) =>
                        toast({
                          message: updated.isLookingFor ? "Вы в поиске" : "Скрыты из поиска",
                          tone: "success",
                        }),
                    })
                  }
                >
                  {profile.isLookingFor ? "Выключить" : "Включить"}
                </Button>
              </div>
            </Card>
          )}

          <ProfileSwitcher myProfiles={session.myProfiles} activeProfileId={profile.id} />
          <DangerZone />
        </div>
      </div>
    </Container>
  );
}
