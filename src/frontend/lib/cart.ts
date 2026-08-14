import type { CartItem, Product, StoreConfig } from "./types";

export const CART_STORAGE_KEY = "techx-cart-v3";
const CART_SCHEMA_VERSION = 2;
const MAX_CART_LINES = 20;

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Partial<Product>;
  return (
    typeof product.id === "string" &&
    typeof product.sku === "string" &&
    typeof product.name === "string" &&
    typeof product.shortDescription === "string" &&
    Number.isInteger(product.priceCents) &&
    (product.priceCents ?? 0) > 0 &&
    product.currency === "USD" &&
    Number.isInteger(product.inventoryQuantity) &&
    Array.isArray(product.images) &&
    Boolean(product.images[0]?.src)
  );
}

function productLimit(product: Product, configuredMaximum: number): number {
  return Math.max(0, Math.min(configuredMaximum, product.inventoryQuantity));
}

export function normalizeCart(value: unknown): CartItem[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const stored = value as { version?: unknown; items?: unknown };
  if (stored.version !== CART_SCHEMA_VERSION || !Array.isArray(stored.items)) {
    return [];
  }

  const items: CartItem[] = [];
  const seen = new Set<string>();
  for (const raw of stored.items) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const candidate = raw as { product?: unknown; quantity?: unknown };
    if (
      !isProduct(candidate.product) ||
      !Number.isInteger(candidate.quantity) ||
      (candidate.quantity as number) < 1 ||
      seen.has(candidate.product.id)
    ) {
      return [];
    }
    seen.add(candidate.product.id);
    items.push({
      product: candidate.product,
      quantity: candidate.quantity as number,
    });
  }
  return items.slice(0, MAX_CART_LINES);
}

export function loadCart(storage: Pick<Storage, "getItem">): CartItem[] {
  const raw = storage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    return normalizeCart(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function saveCart(
  storage: Pick<Storage, "setItem">,
  items: CartItem[],
): void {
  storage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({ version: CART_SCHEMA_VERSION, items }),
  );
}

export function addToCart(
  items: CartItem[],
  product: Product,
  quantity: number,
  configuredMaximum: number,
): CartItem[] {
  const limit = productLimit(product, configuredMaximum);
  if (product.availability === "out_of_stock" || limit < 1) return items;
  const safeQuantity = Math.max(1, Math.min(limit, Math.trunc(quantity)));
  const existing = items.find((item) => item.product.id === product.id);
  if (!existing) {
    return [...items, { product, quantity: safeQuantity }].slice(
      0,
      MAX_CART_LINES,
    );
  }
  return items.map((item) =>
    item.product.id === product.id
      ? {
          product,
          quantity: Math.min(limit, item.quantity + safeQuantity),
        }
      : item,
  );
}

export function updateCartQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
  configuredMaximum: number,
): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.product.id !== productId);
  }
  return items.map((item) =>
    item.product.id === productId
      ? {
          ...item,
          quantity: Math.min(
            productLimit(item.product, configuredMaximum),
            Math.trunc(quantity),
          ),
        }
      : item,
  );
}

export function reconcileCart(
  items: CartItem[],
  products: Product[],
  configuredMaximum: number,
): { items: CartItem[]; changed: boolean } {
  const productById = new Map(products.map((product) => [product.id, product]));
  const reconciled: CartItem[] = [];
  let changed = false;
  for (const item of items) {
    const current = productById.get(item.product.id);
    if (!current) {
      changed = true;
      continue;
    }
    const limit = productLimit(current, configuredMaximum);
    const quantity = Math.max(1, Math.min(item.quantity, Math.max(1, limit)));
    if (
      JSON.stringify(current) !== JSON.stringify(item.product) ||
      quantity !== item.quantity
    ) {
      changed = true;
    }
    reconciled.push({ product: current, quantity });
  }
  return { items: reconciled, changed };
}

export function orderPreview(
  items: CartItem[],
  config: StoreConfig,
): { subtotalCents: number; shippingCents: number; totalCents: number } {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const shippingCents =
    subtotalCents >= config.freeShippingThresholdCents
      ? 0
      : config.standardShippingCents;
  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export function hasUnavailableItems(items: CartItem[]): boolean {
  return items.some(
    (item) =>
      item.product.availability === "out_of_stock" ||
      item.quantity > item.product.inventoryQuantity,
  );
}
