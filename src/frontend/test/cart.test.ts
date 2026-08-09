import { describe, expect, it } from "vitest";
import {
  addToCart,
  CART_STORAGE_KEY,
  loadCart,
  normalizeCart,
  orderPreview,
  reconcileCart,
  saveCart,
  updateCartQuantity,
} from "@/lib/cart";
import { configFixture, productFixture } from "./fixtures";

describe("cart state", () => {
  it("adds, merges, caps, updates, and removes items using inventory", () => {
    const added = addToCart(
      [],
      productFixture,
      2,
      configFixture.maxQuantityPerItem,
    );
    const merged = addToCart(
      added,
      productFixture,
      9,
      configFixture.maxQuantityPerItem,
    );
    expect(merged).toEqual([{ product: productFixture, quantity: 8 }]);
    expect(
      updateCartQuantity(
        merged,
        productFixture.id,
        4,
        configFixture.maxQuantityPerItem,
      ),
    ).toEqual([{ product: productFixture, quantity: 4 }]);
    expect(
      updateCartQuantity(
        merged,
        productFixture.id,
        0,
        configFixture.maxQuantityPerItem,
      ),
    ).toEqual([]);
  });

  it("round-trips only the v2 session schema", () => {
    saveCart(window.sessionStorage, [{ product: productFixture, quantity: 2 }]);
    expect(loadCart(window.sessionStorage)).toEqual([
      { product: productFixture, quantity: 2 },
    ]);
    expect(window.sessionStorage.getItem(CART_STORAGE_KEY)).toContain(
      '"version":2',
    );
    expect(
      normalizeCart({
        version: 1,
        items: [{ product: productFixture, quantity: 2 }],
      }),
    ).toEqual([]);
  });

  it("drops corrupt or duplicate data", () => {
    expect(
      normalizeCart({
        version: 2,
        items: [{ product: productFixture, quantity: 0 }],
      }),
    ).toEqual([]);
    expect(
      normalizeCart({
        version: 2,
        items: [
          { product: productFixture, quantity: 1 },
          { product: productFixture, quantity: 1 },
        ],
      }),
    ).toEqual([]);
    window.sessionStorage.setItem(CART_STORAGE_KEY, "not-json");
    expect(loadCart(window.sessionStorage)).toEqual([]);
  });

  it("reconciles snapshots and matches the configured shipping boundary", () => {
    const stale = { ...productFixture, name: "Old name", priceCents: 4_999 };
    const result = reconcileCart(
      [{ product: stale, quantity: 1 }],
      [productFixture],
      configFixture.maxQuantityPerItem,
    );
    expect(result.changed).toBe(true);
    expect(result.items[0]?.product.name).toBe(productFixture.name);
    expect(
      orderPreview(
        [{ product: { ...productFixture, priceCents: 4_999 }, quantity: 1 }],
        configFixture,
      ),
    ).toEqual({ subtotalCents: 4_999, shippingCents: 999, totalCents: 5_998 });
    expect(
      orderPreview(
        [{ product: { ...productFixture, priceCents: 5_000 }, quantity: 1 }],
        configFixture,
      ),
    ).toEqual({ subtotalCents: 5_000, shippingCents: 0, totalCents: 5_000 });
  });
});
