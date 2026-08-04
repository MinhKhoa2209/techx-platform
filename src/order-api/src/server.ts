import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { CatalogUnavailableError } from "./catalog-client.js";
import type { CatalogClient } from "./catalog-client.js";
import { OrderStore } from "./order-store.js";
import type {
  ErrorEnvelope,
  Order,
  OrderItem,
  OrderItemInput,
} from "./types.js";

const MAX_BODY_BYTES = 16 * 1024;

type Logger = (record: Record<string, unknown>) => void;

export interface OrderServerOptions {
  apiKey: string;
  catalogClient: CatalogClient;
  store?: OrderStore;
  logger?: Logger;
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function requestIdFrom(request: IncomingMessage): string {
  const candidate = request.headers["x-request-id"];
  return typeof candidate === "string" &&
    candidate.length > 0 &&
    candidate.length <= 128
    ? candidate
    : randomUUID();
}

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown,
  requestId: string,
): void {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-request-id", requestId);
  response.end(JSON.stringify(body));
}

function sendError(
  response: ServerResponse,
  error: HttpError,
  requestId: string,
): void {
  const body: ErrorEnvelope = {
    error: { code: error.code, message: error.message, requestId },
  };
  sendJson(response, error.status, body, requestId);
}

function normalizePath(url: string | undefined): string {
  try {
    return new URL(url ?? "/", "http://order.local").pathname;
  } catch {
    return "/";
  }
}

function hasValidApiKey(request: IncomingMessage, expected: string): boolean {
  const provided = request.headers["x-demo-key"];
  if (typeof provided !== "string") return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const contentType = request.headers["content-type"];
  if (
    typeof contentType !== "string" ||
    !contentType.toLowerCase().startsWith("application/json")
  ) {
    throw new HttpError(
      400,
      "INVALID_CONTENT_TYPE",
      "Content-Type must be application/json.",
    );
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES)
      throw new HttpError(400, "BODY_TOO_LARGE", "Request body is too large.");
    chunks.push(buffer);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new HttpError(
      400,
      "INVALID_JSON",
      "Request body must be valid JSON.",
    );
  }
}

function parseItems(body: unknown): OrderItemInput[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_ORDER", "Order body must be an object.");
  }
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "items") {
    throw new HttpError(
      400,
      "INVALID_ORDER",
      "Order body must contain only items.",
    );
  }
  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
    throw new HttpError(
      400,
      "INVALID_ITEMS",
      "Items must contain between 1 and 20 rows.",
    );
  }

  const merged = new Map<string, number>();
  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) {
      throw new HttpError(400, "INVALID_ITEM", "Each item must be an object.");
    }
    const itemKeys = Object.keys(rawItem).sort();
    if (itemKeys.join(",") !== "productId,quantity") {
      throw new HttpError(
        400,
        "INVALID_ITEM",
        "Each item must contain productId and quantity only.",
      );
    }
    const { productId, quantity } = rawItem as {
      productId?: unknown;
      quantity?: unknown;
    };
    if (
      typeof productId !== "string" ||
      productId.trim().length < 1 ||
      productId.length > 100
    ) {
      throw new HttpError(
        400,
        "INVALID_PRODUCT_ID",
        "productId must be a non-empty string.",
      );
    }
    if (
      !Number.isInteger(quantity) ||
      (quantity as number) < 1 ||
      (quantity as number) > 99
    ) {
      throw new HttpError(
        400,
        "INVALID_QUANTITY",
        "quantity must be an integer between 1 and 99.",
      );
    }
    const normalizedId = productId.trim();
    const combined = (merged.get(normalizedId) ?? 0) + (quantity as number);
    if (combined > 99)
      throw new HttpError(
        400,
        "INVALID_QUANTITY",
        "Combined quantity cannot exceed 99.",
      );
    merged.set(normalizedId, combined);
  }

  return [...merged.entries()]
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((left, right) => left.productId.localeCompare(right.productId));
}

function payloadHash(items: OrderItemInput[]): string {
  return createHash("sha256").update(JSON.stringify({ items })).digest("hex");
}

function validateIdempotencyKey(request: IncomingMessage): string {
  const key = request.headers["idempotency-key"];
  if (typeof key !== "string" || key.trim().length < 8 || key.length > 128) {
    throw new HttpError(
      400,
      "INVALID_IDEMPOTENCY_KEY",
      "Idempotency-Key must contain 8 to 128 characters.",
    );
  }
  return key;
}

export function createOrderServer(options: OrderServerOptions): Server {
  if (options.apiKey.length < 8)
    throw new Error("ORDER_API_KEY must contain at least 8 characters.");
  const logger =
    options.logger ?? ((record) => console.log(JSON.stringify(record)));
  const store = options.store ?? new OrderStore(3_600_000, 1_000);
  const inFlight = new Map<string, { hash: string; promise: Promise<Order> }>();
  let ready = true;

  async function createOrder(
    items: OrderItemInput[],
    key: string,
    hash: string,
    requestId: string,
  ): Promise<Order> {
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await options.catalogClient.getProduct(
          item.productId,
          requestId,
        );
        if (!product)
          throw new HttpError(
            400,
            "INVALID_PRODUCT",
            `Product ${item.productId} does not exist.`,
          );
        return { item, product };
      }),
    );
    const orderItems: OrderItem[] = products.map(({ item, product }) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: product.name,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * item.quantity,
    }));
    return store.create(orderItems, key, hash);
  }

  const server = createServer(
    {
      requestTimeout: 8_000,
      headersTimeout: 7_000,
      keepAliveTimeout: 5_000,
    },
    async (request, response) => {
      const startedAt = performance.now();
      const requestId = requestIdFrom(request);
      const path = normalizePath(request.url);

      response.once("finish", () => {
        logger({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "order-api",
          method: request.method,
          path,
          status: response.statusCode,
          durationMs: Math.round(performance.now() - startedAt),
          requestId,
        });
      });

      try {
        if (request.method === "GET" && path === "/healthz") {
          sendJson(
            response,
            200,
            { status: "ok", service: "order-api" },
            requestId,
          );
          return;
        }
        if (request.method === "GET" && path === "/readyz") {
          if (!ready)
            throw new HttpError(
              503,
              "NOT_READY",
              "Order API is shutting down.",
            );
          sendJson(
            response,
            200,
            { status: "ready", service: "order-api" },
            requestId,
          );
          return;
        }

        if (!hasValidApiKey(request, options.apiKey)) {
          throw new HttpError(
            401,
            "UNAUTHORIZED",
            "A valid X-Demo-Key header is required.",
          );
        }

        if (request.method === "POST" && path === "/api/orders") {
          const key = validateIdempotencyKey(request);
          const items = parseItems(await readJsonBody(request));
          const hash = payloadHash(items);
          const stored = store.lookupIdempotency(key, hash);
          if (stored.kind === "conflict")
            throw new HttpError(
              409,
              "IDEMPOTENCY_CONFLICT",
              "Idempotency-Key was reused with a different payload.",
            );
          if (stored.kind === "hit") {
            sendJson(
              response,
              200,
              { order: stored.order, idempotentReplay: true },
              requestId,
            );
            return;
          }

          const pending = inFlight.get(key);
          if (pending) {
            if (pending.hash !== hash)
              throw new HttpError(
                409,
                "IDEMPOTENCY_CONFLICT",
                "Idempotency-Key is already processing a different payload.",
              );
            const order = await pending.promise;
            sendJson(
              response,
              200,
              { order, idempotentReplay: true },
              requestId,
            );
            return;
          }

          const promise = createOrder(items, key, hash, requestId);
          inFlight.set(key, { hash, promise });
          try {
            const order = await promise;
            sendJson(
              response,
              201,
              { order, idempotentReplay: false },
              requestId,
            );
          } finally {
            inFlight.delete(key);
          }
          return;
        }

        const orderMatch = path.match(/^\/api\/orders\/(ord_[0-9a-f-]+)$/i);
        if (request.method === "GET" && orderMatch) {
          const order = store.find(orderMatch[1] ?? "");
          if (!order)
            throw new HttpError(
              404,
              "ORDER_NOT_FOUND",
              "Order was not found or has expired.",
            );
          sendJson(response, 200, { order }, requestId);
          return;
        }

        if (path === "/api/orders" || path.startsWith("/api/orders/")) {
          throw new HttpError(
            405,
            "METHOD_NOT_ALLOWED",
            "Method is not supported for this resource.",
          );
        }
        throw new HttpError(404, "ROUTE_NOT_FOUND", "Route was not found.");
      } catch (error) {
        if (error instanceof HttpError) {
          sendError(response, error, requestId);
        } else if (error instanceof CatalogUnavailableError) {
          sendError(
            response,
            new HttpError(
              503,
              "CATALOG_UNAVAILABLE",
              "Catalog dependency is unavailable.",
            ),
            requestId,
          );
        } else {
          logger({
            timestamp: new Date().toISOString(),
            level: "error",
            service: "order-api",
            requestId,
            message: "unhandled-request-error",
          });
          sendError(
            response,
            new HttpError(
              500,
              "INTERNAL_ERROR",
              "An unexpected error occurred.",
            ),
            requestId,
          );
        }
      }
    },
  );

  server.on("close", () => {
    ready = false;
  });
  return server;
}
