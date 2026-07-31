import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { FeedPage } from "@/pages/FeedPage";
import { ListingDetailPage } from "@/pages/ListingDetailPage";
import { PublicProfilePage } from "@/pages/PublicProfilePage";
import { AccountPage } from "@/pages/AccountPage";
import { MyListingsPage } from "@/pages/MyListingsPage";
import { MyRepliesPage } from "@/pages/MyRepliesPage";
import { ListingFormPage } from "@/pages/ListingFormPage";
import { KitPage } from "@/pages/KitPage";
import { AuthPage } from "@/pages/AuthPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/users/:id" element={<PublicProfilePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/kit" element={<KitPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/listings/my" element={<MyListingsPage />} />
          <Route path="/replies/my" element={<MyRepliesPage />} />
          <Route path="/listings/new" element={<ListingFormPage mode="create" />} />
          <Route path="/listings/:id/edit" element={<ListingFormPage mode="edit" />} />
        </Route>
      </Route>
    </Routes>
  );
}
