import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./queryClient";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthDialogProvider } from "@/features/auth/AuthDialog";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthDialogProvider>{children}</AuthDialogProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
