export function calculateBuyerPriceCents(
  sellerTargetPriceCents: number,
  premiumMarkupPercent: number
) {
  return sellerTargetPriceCents + Math.round((sellerTargetPriceCents * premiumMarkupPercent) / 100);
}

export function calculatePlatformFeeCents(
  sellerTargetPriceCents: number,
  premiumMarkupPercent: number
) {
  return calculateBuyerPriceCents(sellerTargetPriceCents, premiumMarkupPercent) - sellerTargetPriceCents;
}

export function formatUsdCents(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

export function parseUsdToCents(value: string) {
  const normalized = value.trim().replace(/[$,\s]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}
