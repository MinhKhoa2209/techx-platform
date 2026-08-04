$ErrorActionPreference = 'Stop'

$required = @(
  '.env.example',
  '.gitignore',
  'LICENSE',
  'README.md',
  'src/frontend/README.md',
  'src/catalog-api/README.md',
  'src/order-api/README.md'
)

foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required bootstrap file: $path"
  }
}

$forbidden = git ls-files | Select-String -Pattern '(^|/)(\.env$|node_modules/|\.next/|dist/|coverage/)|\.(tfstate|tfplan)$'
if ($forbidden) {
  throw "Forbidden generated or sensitive path is tracked: $($forbidden -join ', ')"
}

Write-Host 'techx-platform bootstrap verification passed.'

