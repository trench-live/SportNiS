import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api/client";
import { Button, FormField, Input } from "@/components/ui";
import { useLoginMutation } from "./mutations";

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLoginMutation();

  function submit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { email: email.trim(), password },
      { onSuccess: () => onSuccess?.() },
    );
  }

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.status === 401 || login.error.status === 400
        ? "Неверный email или пароль."
        : login.error.message
      : login.error
        ? "Не удалось войти. Попробуйте ещё раз."
        : null;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <FormField label="Email">
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </FormField>
      <FormField label="Пароль">
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </FormField>

      {errorMessage && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" fullWidth loading={login.isPending} disabled={!email || !password}>
        Войти
      </Button>

      {onSwitchToRegister && (
        <p className="text-center text-sm text-ink-muted">
          Нет аккаунта?{" "}
          <button type="button" onClick={onSwitchToRegister} className="font-medium text-accent hover:underline">
            Зарегистрироваться
          </button>
        </p>
      )}
    </form>
  );
}
