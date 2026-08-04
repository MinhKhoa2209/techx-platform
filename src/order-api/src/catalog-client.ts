import type { Product } from "./types.js";

export class CatalogUnavailableError extends Error {
  constructor(message = "Catalog API is unavailable.") {
    super(message);
    this.name = "CatalogUnavailableError";
  }
}

export interface CatalogClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  retries?: number;
  fetchImpl?: typeof fetch;
}

export class CatalogClient {
  readonly #baseUrl: string;
  readonly #timeoutMs: number;
  readonly #retries: number;
  readonly #fetch: typeof fetch;

  constructor(options: CatalogClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#timeoutMs = options.timeoutMs ?? 3_000;
    this.#retries = options.retries ?? 2;
    this.#fetch = options.fetchImpl ?? fetch;
  }

  async getProduct(id: string, requestId: string): Promise<Product | null> {
    for (let attempt = 0; attempt <= this.#retries; attempt += 1) {
      try {
        const response = await this.#fetch(
          `${this.#baseUrl}/api/products/${encodeURIComponent(id)}`,
          {
            headers: { "x-request-id": requestId },
            signal: AbortSignal.timeout(this.#timeoutMs),
          },
        );
        if (response.status === 404) return null;
        if (!response.ok)
          throw new CatalogUnavailableError(
            `Catalog returned ${response.status}.`,
          );
        const body = (await response.json()) as { product?: Product };
        if (!body.product || body.product.id !== id)
          throw new CatalogUnavailableError(
            "Catalog returned an invalid product.",
          );
        return body.product;
      } catch (error) {
        if (attempt >= this.#retries) {
          if (error instanceof CatalogUnavailableError) throw error;
          throw new CatalogUnavailableError();
        }
        await new Promise((resolve) => setTimeout(resolve, 40 * 2 ** attempt));
      }
    }
    throw new CatalogUnavailableError();
  }
}
