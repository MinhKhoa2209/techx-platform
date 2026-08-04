import { CatalogClient } from "./catalog-client.js";
import { OrderStore } from "./order-store.js";
import { createOrderServer } from "./server.js";

function integerEnv(name: string, fallback: number, minimum: number): number {
  const value = Number.parseInt(process.env[name] ?? String(fallback), 10);
  if (!Number.isInteger(value) || value < minimum)
    throw new Error(`${name} must be an integer >= ${minimum}.`);
  return value;
}

const port = integerEnv("ORDER_PORT", 3002, 1);
if (port > 65_535) throw new Error("ORDER_PORT must be a valid TCP port.");
const apiKey = process.env.ORDER_API_KEY ?? "";
const catalogApiUrl = process.env.CATALOG_API_URL ?? "http://localhost:3001";
const ttlMs = integerEnv("ORDER_STORE_TTL_MS", 3_600_000, 1_000);
const maxRecords = integerEnv("ORDER_STORE_MAX_RECORDS", 1_000, 1);

const server = createOrderServer({
  apiKey,
  catalogClient: new CatalogClient({ baseUrl: catalogApiUrl }),
  store: new OrderStore(ttlMs, maxRecords),
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "order-api",
      message: "listening",
      port,
    }),
  );
});

let shuttingDown = false;
function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "order-api",
      message: "shutdown-started",
      signal,
    }),
  );
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
  setTimeout(() => process.exit(1), 8_000).unref();
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
