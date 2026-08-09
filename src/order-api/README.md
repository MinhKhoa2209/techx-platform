# Order API

Authenticated, idempotent, in-memory demo order HTTP API. It owns pricing totals,
shipping configuration, inventory enforcement, masked customer data, confirmation
status, and estimated demo delivery dates.

```powershell
$env:ORDER_API_KEY='local-demo-key'
$env:CATALOG_API_URL='http://localhost:3001'
npm run dev -w @techx/order-api
npm run test -w @techx/order-api
```

`GET /api/store-config` is unauthenticated and exposes the frontend-safe shipping,
quantity, and TTL contract. Order create/lookup endpoints require the demo key;
create also requires an idempotency key. No payment credential is accepted or
stored. Full email and street address are validated for the request but are not
retained in the in-memory order.

Order data and idempotency records are intentionally bounded and ephemeral.
Restarting the process clears them.
