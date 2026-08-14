import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findCachedOrder,
  readOrderHistory,
  saveOrderToHistory,
} from "@/lib/order-history";
import { UI_STORAGE_KEYS } from "@/lib/site-config";
import { orderFixture } from "./fixtures";

describe("order history", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("stores recent orders once and returns the newest first", () => {
    const older = {
      ...orderFixture,
      id: `${orderFixture.id}-old`,
      createdAt: "2026-01-01T10:00:00.000Z",
      expiresAt: "2099-01-01T10:00:00.000Z",
    };
    const newer = {
      ...orderFixture,
      id: `${orderFixture.id}-new`,
      createdAt: "2026-01-02T10:00:00.000Z",
      expiresAt: "2099-01-02T10:00:00.000Z",
    };

    saveOrderToHistory(older);
    saveOrderToHistory(newer);
    saveOrderToHistory(newer);

    expect(readOrderHistory().map((order) => order.id)).toEqual([
      newer.id,
      older.id,
    ]);
  });

  it("removes expired and malformed entries", () => {
    window.sessionStorage.setItem(
      UI_STORAGE_KEYS.orderHistory,
      JSON.stringify([
        { ...orderFixture, expiresAt: "2000-01-01T00:00:00.000Z" },
        { id: "not-an-order" },
      ]),
    );

    expect(readOrderHistory()).toEqual([]);
  });

  it("finds a valid legacy last order for backward compatibility", () => {
    const cached = { ...orderFixture, expiresAt: "2099-01-01T00:00:00.000Z" };
    window.sessionStorage.setItem(
      UI_STORAGE_KEYS.lastOrder,
      JSON.stringify(cached),
    );

    expect(findCachedOrder(cached.id)?.id).toBe(cached.id);
  });
});
