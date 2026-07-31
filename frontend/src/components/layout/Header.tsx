import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { Container } from "./Container";
import { NavBar } from "./NavBar";
import { UserMenu } from "./UserMenu";
import { useSession } from "@/features/auth/queries";
import { useAuthDialog } from "@/features/auth/AuthDialog";

export function Header() {
  const session = useSession();
  const auth = useAuthDialog();

  // Consumer не создаёт объявлений — вместо «Мои объявления» показываем «Мои отклики».
  const isConsumer = session.profile?.profileType === "CONSUMER";
  const navItems = session.isAuthenticated
    ? [
        { to: "/feed", label: "Лента" },
        isConsumer
          ? { to: "/replies/my", label: "Мои отклики" }
          : { to: "/listings/my", label: "Мои объявления" },
      ]
    : [{ to: "/feed", label: "Лента" }];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-base/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-ink">
            Sportnis
          </Link>
          <NavBar items={navItems} className="hidden sm:flex" />
        </div>

        <div className="flex items-center gap-2">
          {session.isAuthenticated ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={auth.openLogin}>
                Войти
              </Button>
              <Button size="sm" onClick={auth.openRegister}>
                Зарегистрироваться
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
