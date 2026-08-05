param(
  [string]$BaseUrl = 'http://localhost:3000',
  [int]$DurationSeconds = 60,
  [int]$BurstRequests = 30
)

$ErrorActionPreference = 'Stop'
$services = @('catalog-api', 'order-api', 'frontend')
$samples = @{}
$initialRestarts = @{}
foreach ($service in $services) {
  $samples[$service] = @()
  $id = docker compose ps -q $service
  $initialRestarts[$service] = [int](docker inspect --format '{{.RestartCount}}' $id)
}
$errors = 0
$deadline = (Get-Date).AddSeconds($DurationSeconds)

while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/products" -TimeoutSec 5
    if ($response.StatusCode -ne 200) { $errors++ }
  } catch { $errors++ }

  foreach ($service in $services) {
    $id = docker compose ps -q $service
    $usage = docker stats --no-stream --format '{{.MemUsage}}' $id
    if ($LASTEXITCODE -ne 0) { throw "Could not sample $service memory." }
    $samples[$service] += $usage.Trim()
  }
  Start-Sleep -Milliseconds 500
}

if ($errors -ne 0) { throw "Steady traffic produced $errors errors." }

$catalog = Invoke-RestMethod -Uri "$BaseUrl/api/products" -TimeoutSec 5
$body = @{ items = @(@{ productId = $catalog.products[0].id; quantity = 1 }) } | ConvertTo-Json -Depth 4
$statuses = 1..$BurstRequests | ForEach-Object -Parallel {
  try {
    $response = Invoke-WebRequest -Method Post -Uri "$using:BaseUrl/api/orders" -Headers @{ 'Idempotency-Key' = "burst-$([guid]::NewGuid())" } -ContentType 'application/json' -Body $using:body -TimeoutSec 10 -SkipHttpErrorCheck
    $response.StatusCode
  } catch { 0 }
} -ThrottleLimit 10

$unexpected = $statuses | Where-Object { $_ -notin @(201, 429) }
if ($unexpected) { throw "Burst returned unexpected statuses: $($unexpected -join ', ')." }
if (($statuses | Where-Object { $_ -eq 429 }).Count -lt 1) {
  throw 'Burst did not exercise the documented 429 rate limit.'
}

foreach ($service in $services) {
  $id = docker compose ps -q $service
  $restartCount = [int](docker inspect --format '{{.RestartCount}}' $id)
  if ($restartCount -ne $initialRestarts[$service]) {
    throw "$service restart count changed during soak: $($initialRestarts[$service]) -> $restartCount."
  }
  Write-Host "$service memory samples: $($samples[$service][0]) -> $($samples[$service][-1])"
}

Write-Host "Soak passed: $DurationSeconds seconds steady traffic, $BurstRequests-request controlled burst."
