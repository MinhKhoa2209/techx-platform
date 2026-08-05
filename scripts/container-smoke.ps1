param(
  [string]$BaseUrl = 'http://localhost:3000',
  [int]$ReadyTimeoutSeconds = 90
)

$ErrorActionPreference = 'Stop'

function Wait-Ready {
  $deadline = (Get-Date).AddSeconds($ReadyTimeoutSeconds)
  do {
    try {
      $response = Invoke-WebRequest -Uri "$BaseUrl/readyz" -TimeoutSec 3
      if ($response.StatusCode -eq 200) { return }
    } catch {
      Start-Sleep -Seconds 2
    }
  } while ((Get-Date) -lt $deadline)
  throw "Frontend did not become ready within $ReadyTimeoutSeconds seconds."
}

Wait-Ready

$health = Invoke-RestMethod -Uri "$BaseUrl/healthz" -TimeoutSec 5
if ($health.status -ne 'ok') { throw 'Frontend health response is invalid.' }

$catalog = Invoke-RestMethod -Uri "$BaseUrl/api/products" -TimeoutSec 8
if (-not $catalog.products -or $catalog.products.Count -lt 1) {
  throw 'Catalog returned no products through the frontend BFF.'
}

$product = Invoke-RestMethod -Uri "$BaseUrl/api/products/$($catalog.products[0].id)" -TimeoutSec 8
if ($product.product.id -ne $catalog.products[0].id) {
  throw 'Product detail response does not match the requested product.'
}

function New-SmokeOrder($selectedProduct) {
  $orderBody = @{
    items = @(
      @{ productId = $selectedProduct.id; quantity = 1 }
    )
  } | ConvertTo-Json -Depth 4
  $headers = @{ 'Idempotency-Key' = "smoke-$([guid]::NewGuid())" }
  return Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/orders" -Headers $headers -ContentType 'application/json' -Body $orderBody -TimeoutSec 10
}

$freeShippingProduct = $catalog.products | Where-Object { $_.priceCents -ge 5000 } | Select-Object -First 1
$standardShippingProduct = $catalog.products | Where-Object { $_.priceCents -lt 5000 } | Select-Object -First 1
$freeOrder = New-SmokeOrder $freeShippingProduct
$standardOrder = New-SmokeOrder $standardShippingProduct

if ($freeOrder.order.shippingCents -ne 0 -or $freeOrder.order.totalCents -ne $freeOrder.order.subtotalCents) {
  throw 'Free-shipping order totals are inconsistent.'
}
if ($standardOrder.order.shippingCents -ne 999 -or $standardOrder.order.totalCents -ne ($standardOrder.order.subtotalCents + 999)) {
  throw 'Standard-shipping order totals are inconsistent.'
}

foreach ($created in @($freeOrder, $standardOrder)) {
  if (-not $created.order.id) { throw 'Order creation did not return an order ID.' }
  $lookedUp = Invoke-RestMethod -Uri "$BaseUrl/api/orders/$($created.order.id)" -TimeoutSec 8
  if ($lookedUp.order.id -ne $created.order.id -or $lookedUp.order.totalCents -ne $created.order.totalCents) {
    throw 'Order lookup did not return the created order with locked totals.'
  }
}

Write-Host "Container smoke passed: $($freeOrder.order.id), $($standardOrder.order.id)"
