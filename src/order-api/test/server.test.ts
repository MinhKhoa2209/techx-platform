import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { CatalogClient } from '../src/catalog-client.js';
import { OrderStore } from '../src/order-store.js';
import { createOrderServer } from '../src/server.js';

const API_KEY = 'test-demo-key';
let catalogServer: Server;
let orderServer: Server;
let orderBaseUrl = '';
let catalogMode: 'normal' | 'unavailable' = 'normal';

const products = new Map([
  ['product-1', { id: 'product-1', name: 'Product 1', description: 'One', priceCents: 500, image: '/one.svg' }],
  ['product-2', { id: 'product-2', name: 'Product 2', description: 'Two', priceCents: 700, image: '/two.svg' }],
]);

before(async () => {
  catalogServer = createServer((request, response) => {
    if (catalogMode === 'unavailable') {
      response.statusCode = 503;
      response.end('{}');
      return;
    }
    const path = new URL(request.url ?? '/', 'http://catalog.test').pathname;
    const match = path.match(/^\/api\/products\/([^/]+)$/);
    const product = match ? products.get(decodeURIComponent(match[1] ?? '')) : undefined;
    response.setHeader('content-type', 'application/json');
    response.statusCode = product ? 200 : 404;
    response.end(JSON.stringify(product ? { product } : { error: { code: 'PRODUCT_NOT_FOUND' } }));
  });
  await new Promise<void>((resolve) => catalogServer.listen(0, '127.0.0.1', resolve));
  const catalogAddress = catalogServer.address() as AddressInfo;

  orderServer = createOrderServer({
    apiKey: API_KEY,
    catalogClient: new CatalogClient({
      baseUrl: `http://127.0.0.1:${catalogAddress.port}`,
      timeoutMs: 250,
      retries: 0,
    }),
    store: new OrderStore(60_000, 100),
    logger: () => undefined,
  });
  await new Promise<void>((resolve) => orderServer.listen(0, '127.0.0.1', resolve));
  const orderAddress = orderServer.address() as AddressInfo;
  orderBaseUrl = `http://127.0.0.1:${orderAddress.port}`;
});

after(async () => {
  await Promise.all([
    new Promise<void>((resolve, reject) => orderServer.close((error) => error ? reject(error) : resolve())),
    new Promise<void>((resolve, reject) => catalogServer.close((error) => error ? reject(error) : resolve())),
  ]);
});

function orderRequest(body: unknown, key: string): Promise<Response> {
  return fetch(`${orderBaseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-demo-key': API_KEY,
      'idempotency-key': key,
    },
    body: JSON.stringify(body),
  });
}

test('health endpoints do not require authentication', async () => {
  const [health, readiness] = await Promise.all([
    fetch(`${orderBaseUrl}/healthz`),
    fetch(`${orderBaseUrl}/readyz`),
  ]);
  assert.equal(health.status, 200);
  assert.equal(readiness.status, 200);
});

test('requires the demo key for order endpoints', async () => {
  const response = await fetch(`${orderBaseUrl}/api/orders/ord_00000000-0000-0000-0000-000000000000`);
  const body = await response.json() as { error: { code: string } };
  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'UNAUTHORIZED');
});

test('creates an atomic multi-item order and merges duplicate items', async () => {
  const response = await orderRequest({
    items: [
      { productId: 'product-2', quantity: 1 },
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-1', quantity: 1 },
    ],
  }, 'create-order-key');
  const body = await response.json() as { order: { id: string; items: Array<{ productId: string; quantity: number }>; totalCents: number } };
  assert.equal(response.status, 201);
  assert.equal(body.order.items.length, 2);
  assert.deepEqual(body.order.items.map(({ productId, quantity }) => ({ productId, quantity })), [
    { productId: 'product-1', quantity: 3 },
    { productId: 'product-2', quantity: 1 },
  ]);
  assert.equal(body.order.totalCents, 2_200);

  const lookup = await fetch(`${orderBaseUrl}/api/orders/${body.order.id}`, {
    headers: { 'x-demo-key': API_KEY },
  });
  assert.equal(lookup.status, 200);
});

test('replays the same idempotent request and rejects a conflicting payload', async () => {
  const payload = { items: [{ productId: 'product-1', quantity: 1 }] };
  const first = await orderRequest(payload, 'same-order-key');
  const firstBody = await first.json() as { order: { id: string } };
  const replay = await orderRequest(payload, 'same-order-key');
  const replayBody = await replay.json() as { order: { id: string }; idempotentReplay: boolean };
  assert.equal(replay.status, 200);
  assert.equal(replayBody.order.id, firstBody.order.id);
  assert.equal(replayBody.idempotentReplay, true);

  const conflict = await orderRequest({ items: [{ productId: 'product-2', quantity: 1 }] }, 'same-order-key');
  const conflictBody = await conflict.json() as { error: { code: string } };
  assert.equal(conflict.status, 409);
  assert.equal(conflictBody.error.code, 'IDEMPOTENCY_CONFLICT');
});

test('rejects malformed input and unknown products without creating a partial order', async () => {
  const malformed = await orderRequest({ items: [{ productId: 'product-1', quantity: 0 }] }, 'invalid-quantity-key');
  assert.equal(malformed.status, 400);

  const unknown = await orderRequest({
    items: [
      { productId: 'product-1', quantity: 1 },
      { productId: 'missing', quantity: 1 },
    ],
  }, 'unknown-product-key');
  const unknownBody = await unknown.json() as { error: { code: string } };
  assert.equal(unknown.status, 400);
  assert.equal(unknownBody.error.code, 'INVALID_PRODUCT');

  const retryWithValidPayload = await orderRequest({ items: [{ productId: 'product-1', quantity: 1 }] }, 'unknown-product-key');
  assert.equal(retryWithValidPayload.status, 201);
});

test('returns 503 when Catalog is unavailable', async () => {
  catalogMode = 'unavailable';
  try {
    const response = await orderRequest({ items: [{ productId: 'product-1', quantity: 1 }] }, 'catalog-down-key');
    const body = await response.json() as { error: { code: string } };
    assert.equal(response.status, 503);
    assert.equal(body.error.code, 'CATALOG_UNAVAILABLE');
  } finally {
    catalogMode = 'normal';
  }
});

test('propagates request ids without logging secrets', async () => {
  const response = await fetch(`${orderBaseUrl}/api/orders/ord_00000000-0000-0000-0000-000000000000`, {
    headers: {
      'x-demo-key': API_KEY,
      'x-request-id': 'order-request-id',
    },
  });
  const body = await response.json() as { error: { requestId: string } };
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('x-request-id'), 'order-request-id');
  assert.equal(body.error.requestId, 'order-request-id');
});

