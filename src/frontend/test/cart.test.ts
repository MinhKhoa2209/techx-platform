import { describe, expect, it } from "vitest";
import {
  addToCart,
  CART_STORAGE_KEY,
  loadCart,
  normalizeCart,
  saveCart,
  updateCartQuantity,
} from "@/lib/cart";
import type { Product } from "@/lib/types";

const product: Product = {
  id: "scope",
  name: "Scope",
  description: "A telescope",
  priceCents: 1000,
  image: "/scope.svg",
};

describe("cart state", () => {
  it("adds, merges, updates, and removes items safely", () => {
    const added = addToCart([], product, 2);
    const merged = addToCart(added, product, 3);
    expect(merged).toEqual([{ product, quantity: 5 }]);
    expect(updateCartQuantity(merged, product.id, 4)).toEqual([
      { product, quantity: 4 },
    ]);
    expect(updateCartQuantity(merged, product.id, 0)).toEqual([]);
  });

  it("round-trips versioned session storage", () => {
    saveCart(window.sessionStorage, [{ product, quantity: 2 }]);
    expect(loadCart(window.sessionStorage)).toEqual([{ product, quantity: 2 }]);
    expect(window.sessionStorage.getItem(CART_STORAGE_KEY)).toContain(
      '"version":1',
    );
  });

  it("drops corrupt, old, duplicate, or out-of-range data", () => {
    expect(normalizeCart({ version: 2, items: [] })).toEqual([]);
    expect(
      normalizeCart({ version: 1, items: [{ product, quantity: 100 }] }),
    ).toEqual([]);
    expect(
      normalizeCart({
        version: 1,
        items: [
          { product, quantity: 1 },
          { product, quantity: 1 },
        ],
      }),
    ).toEqual([]);
    window.sessionStorage.setItem(CART_STORAGE_KEY, "not-json");
    expect(loadCart(window.sessionStorage)).toEqual([]);
  });
});
