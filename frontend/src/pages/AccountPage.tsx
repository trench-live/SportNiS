import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Pencil, Search } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Avatar, Badge, Button, Card, Spinner, useToast } from "@/components/ui";
import { PROFILE_TYPE_LABELS } from "@/lib/format";
import { useSession } from "@/features/auth/queries";
import { useSearchingToggle } from "@/features/profile/mutations";
import { ProfileSwitcher } from "@/features/profile/ProfileSwitcher";
import { DangerZone } from "@/features/profile/DangerZone";

export function AccountPage() {
  const session = useSession();
  const navigate = useNavigate();
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
  const isProvider = profile.profileType === "PROVIDER";
  const isComplete = profile.completionStatus === "COMPLETED";
  const email = session.authMe?.email ?? session.authMe?.phone ?? undefined;

  return (
    <Container size="default" className="py-8">
      {/* Шапка профиля — как её видят другие, но с кнопкой редактирования. */}
      <Card padded={false} className="overflow-hidden">
        <div className="h-24 bg-surface-alt" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:gap-5">
          <Avatar
            src={profile.avatarUrl}
            name={profile.displayName}
            size="xl"
            className="-mt-16 border-4 border-surface"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">
                {profile.displayName || "Ваш профиль"}
              </h1>
              <Badge tone={isProvider ? "accent" : "neutral"}>
                {PROFILE_TYPE_LABELS[profile.profileType]}
              </Badge>
              {profile.isLookingFor && (
                <Badge tone="success" leftIcon={<Search />}>
                  В поиске
                </Badge>
              )}
            </div>
            {profile.city && (
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
                <MapPin className="size-4" aria-hidden />
                {profile.city}
              </p>
            )}
            {email && <p className="mt-1 text-xs text-ink-faint">{email}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button leftIcon={<Pencil className="size-4" />} onClick={() => navigate("/account/edit")}>
              Редактировать профиль
            </Button>
            <Link
              to={`/users/${profile.id}`}
              className="inline-flex h-11 items-center rounded-control border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors duration-120 ease-metronome hover:bg-surface-alt"
            >
              Как видят другие
            </Link>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          {!isComplete ? (
            <Card className="border-warning/40 bg-warning/5">
              <h2 className="font-display text-sm font-semibold text-ink">Профиль заполнен не полностью</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Расскажите о себе и добавьте виды спорта — так профиль будет живее.
              </p>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Pencil className="size-4" />}
                  onClick={() => navigate("/account/edit")}
                >
                  Заполнить
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              Профиль заполнен полностью
            </div>
          )}

          {profile.about && (
            <Card>
              <h2 className="mb-2 font-display text-sm font-semibold text-ink">О себе</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">{profile.about}</p>
            </Card>
          )}

          {profile.sportsTags.length > 0 && (
            <Card>
              <h2 className="mb-2 font-display text-sm font-semibold text-ink">Виды спорта</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.sportsTags.map((tag) => (
                  <span key={tag} className="rounded-badge bg-surface-alt px-2.5 py-1 text-sm text-ink-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

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
