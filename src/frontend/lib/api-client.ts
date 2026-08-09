import type {
  ApiErrorEnvelope,
  CatalogResponse,
  CreateOrderInput,
  Order,
  StoreConfig,
} from "./types";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: "no-store" });
  } catch {
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Could not reach the demo service.",
    );
  }
  const body = (await response.json().catch(() => ({}))) as
    T | Partial<ApiErrorEnvelope>;
  if (!response.ok) {
    const error = (body as Partial<ApiErrorEnvelope>).error;
    throw new ApiClientError(
      response.status,
      error?.code ?? "UNEXPECTED_ERROR",
      error?.message ?? `Request failed with status ${response.status}.`,
      error?.requestId,
    );
  }
  return body as T;
}

export function getCatalog(): Promise<CatalogResponse> {
  return requestJson<CatalogResponse>("/api/products");
}

export function getStoreConfig(): Promise<{ config: StoreConfig }> {
  return requestJson<{ config: StoreConfig }>("/api/store-config");
}

export function createOrder(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<{ order: Order; idempotentReplay: boolean }> {
  return requestJson("/api/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify(input),
  });
}

export function getOrder(id: string): Promise<{ order: Order }> {
  return requestJson(`/api/orders/${encodeURIComponent(id)}`);
}
