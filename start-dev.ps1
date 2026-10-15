Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " SPHERONIX TECHNOLOGIES PVT. LTD. - DEV LAUNCHER" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Initializing Backend, Database Seed, and API on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm install; npm run seed; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend Next.js Portal on Port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " Backend:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host " Frontend: http://localhost:3000" -ForegroundColor White
Write-Host " Register: http://localhost:3000/register" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

