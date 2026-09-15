@echo off
title Spheronix Temporary ID Card Generator
echo ========================================================
echo  SPHERONIX TECHNOLOGIES PVT. LTD. - DEV LAUNCHER
echo ========================================================
echo.

echo [1/3] Initializing Backend, Database Seed, and API on Port 5000...
start cmd /k "cd backend && npm install && npm run seed && npm run dev"

echo [2/3] Waiting 3 seconds for Backend initialization...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Next.js Portal on Port 3000...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================================
echo  Backend:  http://localhost:5000/api/health
echo  Frontend: http://localhost:3000
echo  Register: http://localhost:3000/register
echo ========================================================
pause

