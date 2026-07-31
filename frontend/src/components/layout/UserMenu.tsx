import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Megaphone, Inbox } from "lucide-react";
import { Avatar, Dropdown } from "@/components/ui";
import { useLogout, type Session } from "@/features/auth/queries";

export function UserMenu({ session }: { session: Session }) {
  const navigate = useNavigate();
  const logout = useLogout();
  const name = session.profile?.displayName ?? session.authMe?.username ?? "Профиль";
  const isConsumer = session.profile?.profileType === "CONSUMER";

  return (
    <Dropdown
      trigger={({ toggle, ref, open }) => (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={toggle}
          aria-label="Меню профиля"
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition-colors duration-120 ease-metronome hover:border-line-strong"
        >
          <Avatar src={session.profile?.avatarUrl} name={name} size="sm" />
          <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:block">{name}</span>
          <ChevronDown className="size-4 text-ink-muted" aria-hidden />
        </button>
      )}
      items={[
        { key: "profile", label: "Профиль", icon: <User />, onSelect: () => navigate("/account") },
        isConsumer
          ? {
              key: "replies",
              label: "Мои отклики",
              icon: <Inbox />,
              onSelect: () => navigate("/replies/my"),
            }
          : {
              key: "listings",
              label: "Мои объявления",
              icon: <Megaphone />,
              onSelect: () => navigate("/listings/my"),
            },
        { key: "logout", label: "Выйти", icon: <LogOut />, destructive: true, onSelect: logout },
      ]}
    />
  );
}
