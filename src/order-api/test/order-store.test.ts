import assert from "node:assert/strict";
import { test } from "node:test";
import { OrderStore } from "../src/order-store.js";

const item = {
  productId: "product-1",
  quantity: 1,
  name: "Product 1",
  unitPriceCents: 500,
  lineTotalCents: 500,
};

test("expires orders and their idempotency records", () => {
  let now = 1_000;
  const store = new OrderStore(1_000, 10, () => now);
  const order = store.create([item], "idem-key", "hash");
  assert.equal(store.find(order.id)?.id, order.id);
  assert.equal(store.lookupIdempotency("idem-key", "hash").kind, "hit");

  now = 2_001;
  assert.equal(store.find(order.id), undefined);
  assert.equal(store.lookupIdempotency("idem-key", "hash").kind, "miss");
});

test("evicts the oldest order when capacity is reached", () => {
  let now = 1_000;
  const store = new OrderStore(60_000, 1, () => now);
  const first = store.create([item], "first-key", "first-hash");
  now += 1;
  const second = store.create([item], "second-key", "second-hash");
  assert.equal(store.find(first.id), undefined);
  assert.equal(store.find(second.id)?.id, second.id);
});
