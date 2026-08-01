import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Home, User, Inbox, Megaphone, LogOut, LogIn, UserPlus } from "lucide-react";
import { Avatar, BottomSheet, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useSession, useLogout } from "@/features/auth/queries";
import { useAuthDialog } from "@/features/auth/AuthDialog";

function SheetItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-control px-3 py-3 text-left text-base transition-colors duration-120 ease-metronome [&_svg]:size-5",
        destructive ? "text-danger hover:bg-danger/10" : "text-ink hover:bg-surface-alt",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Мобильная навигация: кнопка-меню → выезжающая снизу панель (гость и авторизованный). */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const session = useSession();
  const logout = useLogout();
  const auth = useAuthDialog();
  const isConsumer = session.profile?.profileType === "CONSUMER";
  const name = session.profile?.displayName ?? session.authMe?.username ?? "Профиль";

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div className={className}>
      <IconButton label="Меню" icon={<Menu />} variant="soft" onClick={() => setOpen(true)} />

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Меню">
        {session.isAuthenticated && (
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <Avatar src={session.profile?.avatarUrl} name={name} size="md" />
            <div className="min-w-0">
              <div className="truncate font-medium text-ink">{name}</div>
              <div className="truncate text-sm text-ink-muted">
                {session.authMe?.email ?? session.authMe?.phone ?? ""}
              </div>
            </div>
          </div>
        )}

        <nav className="flex flex-col">
          <SheetItem icon={<Home />} label="Лента" onClick={() => go("/feed")} />

          {session.isAuthenticated ? (
            <>
              <SheetItem
                icon={isConsumer ? <Inbox /> : <Megaphone />}
                label={isConsumer ? "Мои отклики" : "Мои объявления"}
                onClick={() => go(isConsumer ? "/replies/my" : "/listings/my")}
              />
              <SheetItem icon={<User />} label="Профиль" onClick={() => go("/account")} />
              <SheetItem
                icon={<LogOut />}
                label="Выйти"
                destructive
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate("/");
                }}
              />
            </>
          ) : (
            <>
              <SheetItem
                icon={<LogIn />}
                label="Войти"
                onClick={() => {
                  setOpen(false);
                  auth.openLogin();
                }}
              />
              <SheetItem
                icon={<UserPlus />}
                label="Зарегистрироваться"
                onClick={() => {
                  setOpen(false);
                  auth.openRegister();
                }}
              />
            </>
          )}
        </nav>
      </BottomSheet>
    </div>
  );
}
