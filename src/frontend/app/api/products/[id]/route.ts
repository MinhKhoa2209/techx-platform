import type { NextRequest } from "next/server";
import { configurationError, proxyJson } from "@/lib/server/proxy";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const baseUrl = process.env.CATALOG_API_URL;
  if (!baseUrl) return configurationError("Catalog API URL is not configured.");
  const { id } = await context.params;
  return proxyJson(
    `${baseUrl.replace(/\/$/, "")}/api/products/${encodeURIComponent(id)}`,
    {
      requestId: request.headers.get("x-request-id"),
    },
  );
}
