import type { NextRequest } from "next/server";
import { configurationError, proxyJson } from "@/lib/server/proxy";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.ORDER_API_URL;
  if (!baseUrl) return configurationError("Order API URL is not configured.");
  return proxyJson(`${baseUrl.replace(/\/$/, "")}/api/store-config`, {
    requestId: request.headers.get("x-request-id"),
  });
}
