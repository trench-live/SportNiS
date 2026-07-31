import type { ListingFormat, ListingResponse } from "@/lib/api/types";

export interface ListingFormValues {
  title: string;
  description: string;
  tags: string;
  city: string;
  format: ListingFormat;
  priceFrom: string;
  priceTo: string;
  contactInfo: string;
  manualCloseOnly: boolean;
  expiresAt: string; // yyyy-mm-dd
}

export const EMPTY_LISTING_FORM: ListingFormValues = {
  title: "",
  description: "",
  tags: "",
  city: "",
  format: "OFFLINE",
  priceFrom: "",
  priceTo: "",
  contactInfo: "",
  manualCloseOnly: false,
  expiresAt: "",
};

export function listingToForm(l: ListingResponse): ListingFormValues {
  return {
    title: l.title,
    description: l.description,
    tags: l.tags.join(", "),
    city: l.city ?? "",
    format: l.format,
    priceFrom: l.priceFrom != null ? String(l.priceFrom) : "",
    priceTo: l.priceTo != null ? String(l.priceTo) : "",
    contactInfo: l.contactInfo ?? "",
    manualCloseOnly: l.manualCloseOnly,
    expiresAt: l.expiresAt ? l.expiresAt.slice(0, 10) : "",
  };
}

export interface FormError {
  field?: keyof ListingFormValues;
  message: string;
}

export function validateListingForm(v: ListingFormValues): FormError | null {
  if (!v.title.trim()) return { field: "title", message: "Введите заголовок" };
  if (!v.description.trim()) return { field: "description", message: "Введите описание" };
  const from = v.priceFrom ? Number(v.priceFrom) : null;
  const to = v.priceTo ? Number(v.priceTo) : null;
  if (from !== null && (Number.isNaN(from) || from < 0)) return { field: "priceFrom", message: "Некорректная цена" };
  if (to !== null && (Number.isNaN(to) || to < 0)) return { field: "priceTo", message: "Некорректная цена" };
  if (from !== null && to !== null && to < from) return { field: "priceTo", message: "«До» не может быть меньше «от»" };
  if (!v.manualCloseOnly && v.expiresAt) {
    const date = new Date(v.expiresAt);
    if (date.getTime() <= Date.now()) return { field: "expiresAt", message: "Дата должна быть в будущем" };
  }
  return null;
}
