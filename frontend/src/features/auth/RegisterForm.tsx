import { useState, type FormEvent } from "react";
import { Search, Megaphone } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { Button, FormField, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ProfileType } from "@/lib/api/types";
import { useRegisterMutation } from "./mutations";

export interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES: { value: ProfileType; title: string; note: string; icon: typeof Search }[] = [
  { value: "CONSUMER", title: "Ищу услугу", note: "Спортсмен или родитель", icon: Search },
  { value: "PROVIDER", title: "Предлагаю услугу", note: "Тренер или организация", icon: Megaphone },
];

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [profileType, setProfileType] = useState<ProfileType>("CONSUMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const register = useRegisterMutation();

  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!formValid) return;
    register.mutate(
      { profileType, email: email.trim(), password },
      { onSuccess: () => onSuccess?.() },
    );
  }

  const apiError =
    register.error instanceof ApiError
      ? register.error.message
      : register.error
        ? "Не удалось зарегистрироваться. Попробуйте ещё раз."
        : null;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-ink">Кто вы?</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => {
            const active = profileType === role.value;
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setProfileType(role.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-control border p-3 text-left transition-colors duration-120 ease-metronome",
                  active ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <Icon className={cn("size-5", active ? "text-accent" : "text-ink-muted")} aria-hidden />
                <span className="text-sm font-medium text-ink">{role.title}</span>
                <span className="text-xs text-ink-muted">{role.note}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <FormField label="Email" error={touched && !emailValid ? "Некорректный email" : undefined}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </FormField>

      <FormField
        label="Пароль"
        error={touched && !passwordValid ? "Минимум 6 символов" : undefined}
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </FormField>

      {apiError && (
        <p role="alert" className="text-sm text-danger">
          {apiError}
        </p>
      )}

      <Button type="submit" fullWidth loading={register.isPending}>
        Создать аккаунт
      </Button>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-ink-muted">
          Уже есть аккаунт?{" "}
          <button type="button" onClick={onSwitchToLogin} className="font-medium text-accent hover:underline">
            Войти
          </button>
        </p>
      )}
    </form>
  );
}
