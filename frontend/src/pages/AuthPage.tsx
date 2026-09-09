import { Navigate, useNavigate, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui";
import { useToken } from "@/lib/api/useToken";
import { LoginForm } from "@/features/auth/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const token = useToken();
  const navigate = useNavigate();

  if (token) return <Navigate to="/" replace />;

  return (
    <Container size="narrow" className="flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center font-display text-2xl font-bold text-ink">
          {mode === "login" ? "Вход в Sportnis" : "Регистрация в Sportnis"}
        </h1>
        <Card>
          {mode === "login" ? (
            <LoginForm
              onSuccess={() => navigate("/feed")}
              onSwitchToRegister={() => navigate("/register")}
            />
          ) : (
            <RegisterForm
              onSuccess={() => navigate("/feed")}
              onSwitchToLogin={() => navigate("/login")}
            />
          )}
        </Card>
        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link to="/" className="hover:text-ink">
            ← На главную
          </Link>
        </p>
      </div>
    </Container>
  );
}
