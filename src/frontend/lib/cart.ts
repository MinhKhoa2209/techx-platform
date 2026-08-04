import type { CartItem, Product } from "./types";

export const CART_STORAGE_KEY = "techx-demo-cart-v1";

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Partial<Product>;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.description === "string" &&
    Number.isInteger(product.priceCents) &&
    (product.priceCents ?? -1) >= 0 &&
    typeof product.image === "string"
  );
}

export function normalizeCart(value: unknown): CartItem[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const stored = value as { version?: unknown; items?: unknown };
  if (stored.version !== 1 || !Array.isArray(stored.items)) return [];

  const items: CartItem[] = [];
  const seen = new Set<string>();
  for (const raw of stored.items) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const candidate = raw as { product?: unknown; quantity?: unknown };
    if (
      !isProduct(candidate.product) ||
      !Number.isInteger(candidate.quantity) ||
      (candidate.quantity as number) < 1 ||
      (candidate.quantity as number) > 99 ||
      seen.has(candidate.product.id)
    )
      return [];
    seen.add(candidate.product.id);
    items.push({
      product: candidate.product,
      quantity: candidate.quantity as number,
    });
  }
  return items.slice(0, 20);
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
  storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items }));
}

export function addToCart(
  items: CartItem[],
  product: Product,
  quantity: number,
): CartItem[] {
  const safeQuantity = Math.max(1, Math.min(99, Math.trunc(quantity)));
  const existing = items.find((item) => item.product.id === product.id);
  if (!existing)
    return [...items, { product, quantity: safeQuantity }].slice(0, 20);
  return items.map((item) =>
    item.product.id === product.id
      ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) }
      : item,
  );
}

export function updateCartQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0)
    return items.filter((item) => item.product.id !== productId);
  return items.map((item) =>
    item.product.id === productId
      ? { ...item, quantity: Math.min(99, Math.trunc(quantity)) }
      : item,
  );
}
