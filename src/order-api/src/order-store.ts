import { randomUUID } from "node:crypto";
import type { Order, OrderItem } from "./types.js";

const FREE_SHIPPING_THRESHOLD_CENTS = 5_000;
const STANDARD_SHIPPING_CENTS = 999;

interface StoredOrder {
  order: Order;
  expiresAtMs: number;
}

interface IdempotencyRecord {
  payloadHash: string;
  orderId: string;
  expiresAtMs: number;
}

export type IdempotencyLookup =
  { kind: "miss" } | { kind: "conflict" } | { kind: "hit"; order: Order };

export class OrderStore {
  readonly #orders = new Map<string, StoredOrder>();
  readonly #idempotency = new Map<string, IdempotencyRecord>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxRecords: number,
    private readonly now: () => number = Date.now,
  ) {
    if (!Number.isInteger(ttlMs) || ttlMs < 1_000)
      throw new Error("Order TTL must be at least one second.");
    if (!Number.isInteger(maxRecords) || maxRecords < 1)
      throw new Error("Order max records must be positive.");
  }

  get size(): number {
    this.#prune();
    return this.#orders.size;
  }

  find(id: string): Order | undefined {
    this.#prune();
    return this.#orders.get(id)?.order;
  }

  lookupIdempotency(key: string, payloadHash: string): IdempotencyLookup {
    this.#prune();
    const record = this.#idempotency.get(key);
    if (!record) return { kind: "miss" };
    if (record.payloadHash !== payloadHash) return { kind: "conflict" };
    const order = this.#orders.get(record.orderId)?.order;
    if (!order) {
      this.#idempotency.delete(key);
      return { kind: "miss" };
    }
    return { kind: "hit", order };
  }

  create(
    items: OrderItem[],
    idempotencyKey: string,
    payloadHash: string,
  ): Order {
    this.#prune();
    while (this.#orders.size >= this.maxRecords) this.#evictOldest();

    const createdAtMs = this.now();
    const expiresAtMs = createdAtMs + this.ttlMs;
    const subtotalCents = items.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    );
    const shippingCents =
      subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : STANDARD_SHIPPING_CENTS;
    const order: Order = {
      id: `ord_${randomUUID()}`,
      items,
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      createdAt: new Date(createdAtMs).toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString(),
    };

    this.#orders.set(order.id, { order, expiresAtMs });
    this.#idempotency.set(idempotencyKey, {
      payloadHash,
      orderId: order.id,
      expiresAtMs,
    });
    return order;
  }

  #prune(): void {
    const now = this.now();
    for (const [id, record] of this.#orders) {
      if (record.expiresAtMs <= now) this.#orders.delete(id);
    }
    for (const [key, record] of this.#idempotency) {
      if (record.expiresAtMs <= now || !this.#orders.has(record.orderId))
        this.#idempotency.delete(key);
    }
  }

  #evictOldest(): void {
    const oldestId = this.#orders.keys().next().value as string | undefined;
    if (!oldestId) return;
    this.#orders.delete(oldestId);
    for (const [key, record] of this.#idempotency) {
      if (record.orderId === oldestId) this.#idempotency.delete(key);
    }
  }
}
