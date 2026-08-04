import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import { createCatalogServer } from "../src/server.js";

const server = createCatalogServer({ logger: () => undefined });
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("health and readiness endpoints are available", async () => {
  const [health, readiness] = await Promise.all([
    fetch(`${baseUrl}/healthz`),
    fetch(`${baseUrl}/readyz`),
  ]);
  assert.equal(health.status, 200);
  assert.equal(readiness.status, 200);
});

test("lists products and propagates a request id", async () => {
  const response = await fetch(`${baseUrl}/api/products`, {
    headers: { "x-request-id": "catalog-test-request" },
  });
  const body = (await response.json()) as { products: Array<{ id: string }> };
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id"), "catalog-test-request");
  assert.ok(body.products.length >= 6);
});

test("returns one product and a structured 404", async () => {
  const found = await fetch(`${baseUrl}/api/products/nova-refractor`);
  const foundBody = (await found.json()) as { product: { id: string } };
  assert.equal(found.status, 200);
  assert.equal(foundBody.product.id, "nova-refractor");

  const missing = await fetch(`${baseUrl}/api/products/missing`);
  const missingBody = (await missing.json()) as {
    error: { code: string; requestId: string };
  };
  assert.equal(missing.status, 404);
  assert.equal(missingBody.error.code, "PRODUCT_NOT_FOUND");
  assert.ok(missingBody.error.requestId);
});

test("rejects unsupported methods", async () => {
  const response = await fetch(`${baseUrl}/api/products`, { method: "POST" });
  assert.equal(response.status, 405);
});
