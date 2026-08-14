import type { StoreConfig } from "./types.js";

export const FREE_SHIPPING_THRESHOLD_CENTS = 5_000;
export const STANDARD_SHIPPING_CENTS = 999;
export const MAX_QUANTITY_PER_ITEM = 99;
export const MAX_ORDER_LINES = 20;

export function shippingCentsFor(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}

export function storeConfig(orderTtlMs: number): StoreConfig {
  return {
    currency: "USD",
    freeShippingThresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
    standardShippingCents: STANDARD_SHIPPING_CENTS,
    maxQuantityPerItem: MAX_QUANTITY_PER_ITEM,
    orderTtlSeconds: Math.floor(orderTtlMs / 1_000),
    shippingMethods: [
      {
        id: "standard",
        label: "Standard delivery",
        description: "Estimated in 3–5 business days",
      },
    ],
  };
}

export function addBusinessDays(timestamp: number, days: number): Date {
  const date = new Date(timestamp);
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date;
}

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}
