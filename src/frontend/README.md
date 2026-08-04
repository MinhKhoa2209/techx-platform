# Frontend

Next.js storefront and server-side BFF.

```powershell
$env:CATALOG_API_URL='http://localhost:3001'
$env:ORDER_API_URL='http://localhost:3002'
$env:ORDER_API_KEY='local-demo-key'
npm run dev -w @techx/frontend
```

The browser calls only same-origin `/api/*` routes. `ORDER_API_KEY` is read only by server route handlers and must never use a `NEXT_PUBLIC_` prefix.

The BFF applies dependency timeouts and GET retries, forwards request IDs, rate-limits order creation to 20 attempts per client per minute, and maps dependency failures to structured responses. Orders remain ephemeral by design.

Local checks:

```powershell
npm run check -w @techx/frontend
npm run test -w @techx/frontend
npm run build -w @techx/frontend
```
