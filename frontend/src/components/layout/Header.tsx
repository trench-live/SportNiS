import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Search, X, ArrowLeft } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { Container } from "./Container";
import { NavBar } from "./NavBar";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { useSession } from "@/features/auth/queries";
import { useAuthDialog } from "@/features/auth/AuthDialog";

export function Header() {
  const session = useSession();
  const auth = useAuthDialog();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Раскрывающийся поиск (мобильный, на ленте): иконка → строка замещает шапку.
  const onFeed = location.pathname === "/feed";
  const [searchOpen, setSearchOpen] = useState(false);
  const [input, setInput] = useState("");
  const debounced = useDebouncedValue(input, 300);

  // Печатаем → обновляем ?tag → лента перезапрашивается.
  useEffect(() => {
    if (!searchOpen) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const value = debounced.trim();
        if (value) next.set("tag", value);
        else next.delete("tag");
        return next;
      },
      { replace: true },
    );
  }, [debounced, searchOpen, setSearchParams]);

  // Уходим со страницы — закрываем поиск.
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  function openSearch() {
    setInput(searchParams.get("tag") ?? "");
    setSearchOpen(true);
  }

  const hasTag = Boolean(searchParams.get("tag"));

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
      {searchOpen ? (
        <Container className="flex h-16 items-center gap-2">
          <IconButton label="Закрыть поиск" icon={<ArrowLeft />} variant="ghost" onClick={() => setSearchOpen(false)} />
          <input
            autoFocus
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Вид спорта или тег"
            aria-label="Поиск по ленте"
            className="h-11 flex-1 rounded-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {input && (
            <IconButton label="Очистить" icon={<X />} variant="ghost" onClick={() => setInput("")} />
          )}
        </Container>
      ) : (
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-ink">
              Sportnis
            </Link>
            <NavBar items={navItems} className="hidden sm:flex" />
          </div>

          {/* Десктоп: меню профиля / кнопки входа. */}
          <div className="hidden items-center gap-2 sm:flex">
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

          {/* Мобильный: поиск (только на ленте) + меню снизу. */}
          <div className="flex items-center gap-1 sm:hidden">
            {onFeed && (
              <span className="relative">
                <IconButton label="Поиск" icon={<Search />} variant="soft" onClick={openSearch} />
                {hasTag && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-accent" aria-hidden />
                )}
              </span>
            )}
            <MobileNav />
          </div>
        </Container>
      )}
    </header>
  );
}
