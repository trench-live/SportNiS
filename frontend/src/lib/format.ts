import type { ListingFormat, ProfileType } from "@/lib/api/types";

const CURRENCY_SYMBOLS: Record<string, string> = { RUB: "₽", USD: "$", EUR: "€" };

export function currencySymbol(currency: string | null | undefined): string {
  if (!currency) return "";
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

function formatAmount(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("ru-RU");
}

/** «от 1 000 ₽», «1 000–4 000 ₽», «до 4 000 ₽» либо пусто. */
export function formatPriceRange(
  from: string | number | null,
  to: string | number | null,
  currency: string | null,
): string | null {
  const symbol = currencySymbol(currency);
  const hasFrom = from !== null && from !== undefined && from !== "";
  const hasTo = to !== null && to !== undefined && to !== "";
  if (!hasFrom && !hasTo) return null;
  if (hasFrom && hasTo) {
    // Точная цена (от === до) схлопывается в одно значение.
    if (Number(from) === Number(to)) return `${formatAmount(from!)} ${symbol}`.trim();
    return `${formatAmount(from!)}–${formatAmount(to!)} ${symbol}`.trim();
  }
  if (hasFrom) return `от ${formatAmount(from!)} ${symbol}`.trim();
  return `до ${formatAmount(to!)} ${symbol}`.trim();
}

export const FORMAT_LABELS: Record<ListingFormat, string> = {
  ONLINE: "Онлайн",
  OFFLINE: "Офлайн",
  HYBRID: "Гибрид",
};

export function formatListingFormat(format: ListingFormat | null): string | null {
  return format ? FORMAT_LABELS[format] : null;
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  CONSUMER: "Ищет услугу",
  PROVIDER: "Предлагает услугу",
};

/** Относительная дата: «сегодня», «вчера», «3 дня назад», иначе дата. */
export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}
