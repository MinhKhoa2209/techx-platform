import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { ApiErrorEnvelope } from "../types";

interface ProxyOptions {
  requestId?: string | null;
  init?: RequestInit;
  retries?: number;
  timeoutMs?: number;
}

function safeRequestId(candidate?: string | null): string {
  return candidate && candidate.length <= 128 ? candidate : randomUUID();
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId: string,
): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json(
    { error: { code, message, requestId } },
    {
      status,
      headers: { "x-request-id": requestId, "cache-control": "no-store" },
    },
  );
}

export async function proxyJson(
  url: string,
  options: ProxyOptions = {},
): Promise<NextResponse> {
  const requestId = safeRequestId(options.requestId);
  const method = options.init?.method?.toUpperCase() ?? "GET";
  const retries = method === "GET" ? (options.retries ?? 2) : 0;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const headers = new Headers(options.init?.headers);
      headers.set("x-request-id", requestId);
      const upstream = await fetch(url, {
        ...options.init,
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(options.timeoutMs ?? 3_000),
      });
      const text = await upstream.text();
      let body: unknown;
      try {
        body = text ? (JSON.parse(text) as unknown) : {};
      } catch {
        return errorResponse(
          503,
          "INVALID_UPSTREAM_RESPONSE",
          "A dependency returned an invalid response.",
          requestId,
        );
      }
      return NextResponse.json(body, {
        status: upstream.status,
        headers: { "x-request-id": requestId, "cache-control": "no-store" },
      });
    } catch {
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            40 * 2 ** attempt + Math.floor(Math.random() * 20),
          ),
        );
        continue;
      }
      return errorResponse(
        503,
        "DEPENDENCY_UNAVAILABLE",
        "A required service is temporarily unavailable.",
        requestId,
      );
    }
  }
  return errorResponse(
    503,
    "DEPENDENCY_UNAVAILABLE",
    "A required service is temporarily unavailable.",
    requestId,
  );
}

export function configurationError(
  message: string,
): NextResponse<ApiErrorEnvelope> {
  const requestId = randomUUID();
  return errorResponse(503, "BFF_NOT_READY", message, requestId);
}
