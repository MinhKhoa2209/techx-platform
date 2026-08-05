param([string]$BaseUrl = 'http://localhost:3000')

$ErrorActionPreference = 'Stop'
$services = @('catalog-api', 'order-api', 'frontend')

function Get-ContainerId([string]$Service) {
  $id = docker compose ps -q $Service
  if ($LASTEXITCODE -ne 0 -or -not $id) { throw "No container for $Service." }
  return $id.Trim()
}

function Wait-Healthy([string]$Service, [int]$TimeoutSeconds = 60) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    $id = Get-ContainerId $Service
    $status = docker inspect --format '{{.State.Health.Status}}' $id
    if ($LASTEXITCODE -eq 0 -and $status.Trim() -eq 'healthy') { return }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)
  throw "$Service did not recover to healthy within $TimeoutSeconds seconds."
}

$initialIds = @{}
$initialRestarts = @{}
foreach ($service in $services) {
  $initialIds[$service] = Get-ContainerId $service
  $initialRestarts[$service] = [int](docker inspect --format '{{.RestartCount}}' $initialIds[$service])
}

foreach ($target in $services) {
  docker compose restart --timeout 10 $target
  if ($LASTEXITCODE -ne 0) { throw "Restart failed for $target." }
  Wait-Healthy $target
  & "$PSScriptRoot/container-smoke.ps1" -BaseUrl $BaseUrl

  foreach ($other in $services | Where-Object { $_ -ne $target }) {
    $currentId = Get-ContainerId $other
    $currentRestarts = [int](docker inspect --format '{{.RestartCount}}' $currentId)
    if ($currentId -ne $initialIds[$other] -or $currentRestarts -ne $initialRestarts[$other]) {
      throw "Restart cascade detected: $other changed while restarting $target."
    }
  }

  $initialIds[$target] = Get-ContainerId $target
  $initialRestarts[$target] = [int](docker inspect --format '{{.RestartCount}}' $initialIds[$target])
}

Write-Host 'Sequential recovery passed without a restart cascade.'
