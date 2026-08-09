$ErrorActionPreference = 'Stop'

$frontendRoot = Join-Path $PSScriptRoot '..\src\frontend'
$productionUiFiles = @(
  Get-ChildItem -LiteralPath (Join-Path $frontendRoot 'app') -Recurse -File -Include '*.tsx'
  Get-ChildItem -LiteralPath (Join-Path $frontendRoot 'components') -Recurse -File -Include '*.tsx'
)
$catalog = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot '..\src\catalog-api\data\products.json') | ConvertFrom-Json

$forbiddenDomainValues = @()
foreach ($product in $catalog) {
  $forbiddenDomainValues += @(
    [string]$product.id,
    [string]$product.sku,
    [string]$product.name,
    [string]$product.images[0].src
  )
}

foreach ($file in $productionUiFiles) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  foreach ($value in $forbiddenDomainValues) {
    if ($content.Contains($value, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Hard-coded catalog value '$value' found in $($file.FullName)."
    }
  }
  if ($content -match 'style\s*=\s*\{\{') {
    throw "Inline style found in $($file.FullName)."
  }
  if ($content -match 'href\s*=\s*["''][/]') {
    throw "Hard-coded UI route found in $($file.FullName); use ROUTES."
  }
  if ($content -match '<(?:p|span|strong|h[1-6]|label|button|a|dt|dd|li|code)\b[^>]*>\s*[^<>{}]*[A-Za-z][^<>{}]*<') {
    throw "Raw user-facing JSX copy found in $($file.FullName); use typed CONTENT/SITE configuration."
  }
  if ($content -match '(?:aria-label|placeholder|title)\s*=\s*["''][A-Za-z]') {
    throw "Hard-coded accessibility or input copy found in $($file.FullName); use typed CONTENT/SITE configuration."
  }
}

$businessConstantNames = @(
  'FREE_SHIPPING_THRESHOLD_CENTS',
  'STANDARD_SHIPPING_CENTS',
  'MAX_QUANTITY_PER_ITEM',
  'MAX_ORDER_LINES'
)
foreach ($file in $productionUiFiles) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  foreach ($constantName in $businessConstantNames) {
    if ($content -match "\b$constantName\b") {
      throw "Order business constant '$constantName' imported into $($file.FullName); consume StoreConfig instead."
    }
  }
}

$joinedUi = ($productionUiFiles | ForEach-Object {
  Get-Content -Raw -LiteralPath $_.FullName
}) -join "`n"

$forbiddenClaims = @(
  '50K\+?',
  '124 reviews',
  '4\.5 out of 5',
  'cardNumber',
  '\bcvv\b',
  'promo code',
  'newsletter',
  'coming soon'
)
foreach ($pattern in $forbiddenClaims) {
  if ($joinedUi -match $pattern) {
    throw "Unsupported storefront claim or control matched '$pattern'."
  }
}

Write-Host 'UI hard-code audit passed.'
