import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useToken } from "@/lib/api/useToken";

/** Пускает только авторизованных; иначе — на /login с запоминанием исходного пути. */
export function ProtectedRoute() {
  const token = useToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
