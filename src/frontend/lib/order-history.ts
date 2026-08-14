import { UI_STORAGE_KEYS } from "./site-config";
import type { Order } from "./types";

const HISTORY_LIMIT = 8;

function isStoredOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<Order>;
  return (
    typeof order.id === "string" &&
    order.id.startsWith("ord_") &&
    typeof order.createdAt === "string" &&
    typeof order.expiresAt === "string" &&
    Array.isArray(order.items)
  );
}

export function readOrderHistory(
  storage: Storage = window.sessionStorage,
): Order[] {
  const raw = storage.getItem(UI_STORAGE_KEYS.orderHistory);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Invalid order history");
    const orders = parsed
      .filter(isStoredOrder)
      .filter((order) => Date.parse(order.expiresAt) > Date.now())
      .sort(
        (left, right) =>
          Date.parse(right.createdAt) - Date.parse(left.createdAt),
      )
      .slice(0, HISTORY_LIMIT);
    if (orders.length !== parsed.length) {
      storage.setItem(UI_STORAGE_KEYS.orderHistory, JSON.stringify(orders));
    }
    return orders;
  } catch {
    storage.removeItem(UI_STORAGE_KEYS.orderHistory);
    return [];
  }
}

export function saveOrderToHistory(
  order: Order,
  storage: Storage = window.sessionStorage,
): Order[] {
  const history = readOrderHistory(storage).filter(
    (item) => item.id !== order.id,
  );
  const next = [order, ...history].slice(0, HISTORY_LIMIT);
  storage.setItem(UI_STORAGE_KEYS.orderHistory, JSON.stringify(next));
  return next;
}

export function findCachedOrder(
  id: string,
  storage: Storage = window.sessionStorage,
): Order | null {
  const stored = readOrderHistory(storage).find((order) => order.id === id);
  if (stored) return stored;

  const legacy = storage.getItem(UI_STORAGE_KEYS.lastOrder);
  if (!legacy) return null;
  try {
    const order = JSON.parse(legacy) as unknown;
    return isStoredOrder(order) &&
      order.id === id &&
      Date.parse(order.expiresAt) > Date.now()
      ? order
      : null;
  } catch {
    storage.removeItem(UI_STORAGE_KEYS.lastOrder);
    return null;
  }
}
