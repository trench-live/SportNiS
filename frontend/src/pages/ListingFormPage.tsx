import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton, ErrorState, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { ListingForm } from "@/features/listings/ListingForm";
import {
  EMPTY_LISTING_FORM,
  listingToForm,
  type ListingFormValues,
} from "@/features/listings/listingFormModel";
import { useCreateListing, useMyListing, useUpdateListing } from "@/features/listings/myQueries";
import type { ListingCreateRequest, ListingUpdateRequest } from "@/lib/api/types";

const DRAFT_KEY = "sportnis.listing-draft";

function toRequest(v: ListingFormValues): ListingUpdateRequest {
  const from = v.priceFrom.trim();
  const to = v.priceTo.trim();
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    contactInfo: v.contactInfo.trim() || null,
    tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
    city: v.city.trim() || null,
    format: v.format,
    priceFrom: from ? Number(from) : null,
    priceTo: to ? Number(to) : null,
    expiresAt: !v.manualCloseOnly && v.expiresAt ? new Date(`${v.expiresAt}T23:59:59Z`).toISOString() : null,
    manualCloseOnly: v.manualCloseOnly,
  };
}

function extractError(err: unknown): string | null {
  if (err instanceof ApiError) return err.message;
  return err ? "Не удалось сохранить объявление." : null;
}

export function ListingFormPage({ mode }: { mode: "create" | "edit" }) {
  return mode === "edit" ? <EditListing /> : <CreateListing />;
}

function CreateListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const create = useCreateListing();
  const [value, setValue] = useState<ListingFormValues>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        return { ...EMPTY_LISTING_FORM, ...JSON.parse(saved) };
      } catch {
        // ignore
      }
    }
    return EMPTY_LISTING_FORM;
  });

  // Автосохранение черновика.
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
  }, [value]);

  // Предупреждение при уходе со страницы.
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function submit(v: ListingFormValues) {
    const body: ListingCreateRequest = { type: "OFFER", ...toRequest(v) };
    create.mutate(body, {
      onSuccess: () => {
        localStorage.removeItem(DRAFT_KEY);
        toast({ message: "Объявление опубликовано", tone: "success" });
        navigate("/listings/my");
      },
    });
  }

  return (
    <Container size="narrow" className="py-8">
      <PageHeader title="Новое объявление" description="Черновик сохраняется автоматически." />
      <div className="mt-6">
        <ListingForm
          value={value}
          onChange={setValue}
          onSubmit={submit}
          onCancel={() => navigate("/listings/my")}
          submitting={create.isPending}
          submitLabel="Опубликовать"
          apiError={extractError(create.error)}
        />
      </div>
    </Container>
  );
}

function EditListing() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useMyListing(id);
  const update = useUpdateListing(id);
  const [value, setValue] = useState<ListingFormValues | null>(null);

  useEffect(() => {
    if (data) setValue(listingToForm(data));
  }, [data]);

  if (isLoading || (data && !value)) {
    return (
      <Container size="narrow" className="py-8">
        <Skeleton className="h-96 w-full rounded-card" />
      </Container>
    );
  }

  if (isError || !data || !value) {
    return (
      <Container size="narrow" className="py-8">
        <ErrorState description="Объявление не найдено." onRetry={() => refetch()} />
        <p className="mt-4 text-center text-sm">
          <Link to="/listings/my" className="text-accent hover:underline">
            ← К моим объявлениям
          </Link>
        </p>
      </Container>
    );
  }

  function submit(v: ListingFormValues) {
    update.mutate(toRequest(v), {
      onSuccess: () => {
        toast({ message: "Изменения сохранены", tone: "success" });
        navigate("/listings/my");
      },
    });
  }

  return (
    <Container size="narrow" className="py-8">
      <PageHeader title="Редактирование" />
      <div className="mt-6">
        <ListingForm
          value={value}
          onChange={setValue}
          onSubmit={submit}
          onCancel={() => navigate("/listings/my")}
          submitting={update.isPending}
          submitLabel="Сохранить"
          apiError={extractError(update.error)}
        />
      </div>
    </Container>
  );
}
