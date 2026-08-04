import { createCatalogServer } from "./server.js";

const port = Number.parseInt(process.env.CATALOG_PORT ?? "3001", 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("CATALOG_PORT must be a valid TCP port.");
}

const server = createCatalogServer();

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "catalog-api",
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
      service: "catalog-api",
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
