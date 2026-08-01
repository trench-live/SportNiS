// Позиции рекламных слотов в ленте: промежуток «случайный» в 3–4 карточки, но детерминированный
// (seeded PRNG) — стабильны между заходами и меняются только при смене контекста (фильтры/роль).
const PROMO_MIN_GAP = 3;
const PROMO_MAX_GAP = 4;

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Сид зависит только от фильтров — позиции стабильны между заходами. */
export function promoSeed(tag: string, city: string): number {
  return hashString(`${tag}|${city}`);
}

/** Индексы карточек, после которых идёт промо-слот (не после последней). */
export function computePromoPositions(count: number, seed: number): Set<number> {
  const rand = mulberry32(seed);
  const gap = () => PROMO_MIN_GAP + Math.floor(rand() * (PROMO_MAX_GAP - PROMO_MIN_GAP + 1));
  const positions = new Set<number>();
  let next = gap();
  while (next < count) {
    positions.add(next - 1);
    next += gap();
  }
  return positions;
}
