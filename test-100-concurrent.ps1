param(
  [string]$Mode = "login",
  [int]$Users = 100,
  [int]$Port = 5000
)

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "       SPHERONIX - 100 CONCURRENT USERS LOAD & CRASH TEST RUNNER              " -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " Mode:       $Mode (login, register, or both)" -ForegroundColor Yellow
Write-Host " Users:      $Users simultaneous members" -ForegroundColor Yellow
Write-Host " Target:     Port $Port (auto-fallback to dedicated runner if not running)" -ForegroundColor Yellow
Write-Host "==============================================================================`n" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendDir)) {
  $backendDir = Join-Path $PSScriptRoot "id\backend"
}

Push-Location $backendDir
try {
  npx tsx src/tests/concurrentStressTest.ts --mode=$Mode --users=$Users --port=$Port
} finally {
  Pop-Location
}
