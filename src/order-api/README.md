# Order API

Authenticated, idempotent, in-memory order HTTP API.

```powershell
$env:ORDER_API_KEY='local-demo-key'
$env:CATALOG_API_URL='http://localhost:3001'
npm run dev -w @techx/order-api
npm run test -w @techx/order-api
```

Order data and idempotency records are intentionally bounded and ephemeral. Restarting the process clears them.
