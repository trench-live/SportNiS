import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export type AuthMode = "login" | "register";

interface AuthDialogContextValue {
  open: boolean;
  mode: AuthMode;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

/**
 * Управляет модалкой входа/регистрации. Форма живёт и как модалка (отсюда),
 * и как страница (/login, /register) — чтобы не выкидывать человека из выдачи,
 * когда он жмёт «Связаться» или сердце.
 */
export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const value = useMemo<AuthDialogContextValue>(
    () => ({
      open,
      mode,
      openLogin: () => {
        setMode("login");
        setOpen(true);
      },
      openRegister: () => {
        setMode("register");
        setOpen(true);
      },
      close: () => setOpen(false),
    }),
    [open, mode],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={value.close} title={mode === "login" ? "Вход" : "Регистрация"}>
        {mode === "login" ? (
          <LoginForm onSuccess={value.close} onSwitchToRegister={() => setMode("register")} />
        ) : (
          <RegisterForm onSuccess={value.close} onSwitchToLogin={() => setMode("login")} />
        )}
      </Modal>
    </AuthDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthDialog(): AuthDialogContextValue {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog должен использоваться внутри <AuthDialogProvider>");
  return ctx;
}
