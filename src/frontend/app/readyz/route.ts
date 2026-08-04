import { NextResponse } from "next/server";

export function GET() {
  const ready = Boolean(
    process.env.CATALOG_API_URL &&
    process.env.ORDER_API_URL &&
    process.env.ORDER_API_KEY &&
    process.env.ORDER_API_KEY.length >= 8,
  );
  return NextResponse.json(
    ready
      ? { status: "ready", service: "frontend" }
      : {
          error: {
            code: "NOT_READY",
            message: "Frontend configuration is incomplete.",
          },
        },
    { status: ready ? 200 : 503 },
  );
}
