$ErrorActionPreference = 'Stop'

$required = @(
  '.env.example',
  '.gitignore',
  'LICENSE',
  'README.md',
  'package-lock.json',
  'package.json',
  'compose.yaml',
  'src/catalog-api/Dockerfile',
  'src/order-api/Dockerfile',
  'src/frontend/Dockerfile',
  'src/frontend/README.md',
  'src/frontend/package.json',
  'src/catalog-api/README.md',
  'src/order-api/README.md'
)

foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required bootstrap file: $path"
  }
}

$forbidden = git ls-files | Select-String -Pattern '(^|/)(\.env$|node_modules/|\.next/|dist/|coverage/)|\.(tfstate|tfplan|tsbuildinfo)$'
if ($forbidden) {
  throw "Forbidden generated or sensitive path is tracked: $($forbidden -join ', ')"
}

if (-not (Test-Path -LiteralPath 'node_modules')) {
  throw 'Dependencies are missing. Run npm ci before verification.'
}

& "$PSScriptRoot\ui-hardcode-audit.ps1"

npm run check
if ($LASTEXITCODE -ne 0) { throw 'TypeScript verification failed.' }
npm run format:check
if ($LASTEXITCODE -ne 0) { throw 'Formatting verification failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Lint verification failed.' }
npm test
if ($LASTEXITCODE -ne 0) { throw 'Test verification failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Production build verification failed.' }

Write-Host 'techx-platform local verification passed.'
