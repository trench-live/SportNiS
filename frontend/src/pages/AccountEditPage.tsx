import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui";
import { useSession } from "@/features/auth/queries";
import { ProfileEditForm } from "@/features/profile/ProfileEditForm";

export function AccountEditPage() {
  const session = useSession();
  const navigate = useNavigate();
  const profile = session.profile;

  if (session.isLoading || !profile) {
    return (
      <Container className="flex justify-center py-16">
        <Spinner size="lg" />
      </Container>
    );
  }

  return (
    <Container size="narrow" className="py-8">
      <button
        type="button"
        onClick={() => navigate("/account")}
        className="mb-4 text-sm text-ink-muted hover:text-ink"
      >
        ← К профилю
      </button>
      <PageHeader title="Редактирование профиля" />
      <div className="mt-6">
        <ProfileEditForm profile={profile} onSaved={() => navigate("/account")} />
      </div>
    </Container>
  );
}
