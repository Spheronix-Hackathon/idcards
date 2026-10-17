@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo   SPHERONIX - 100 CONCURRENT USERS LOAD & STABILITY TEST RUNNER
echo ==============================================================================
echo.
echo Choose the test mode to run:
echo   [1] 100 Concurrent Student Logins / Retrievals (Fast - ~3 seconds)
echo   [2] 100 Concurrent Student Registrations with Photo Processing
echo   [3] Full Suite: Both Login and Registration with Continuity Watchdog
echo.

set /p choice="Enter choice [1, 2, or 3] (default is 1): "
if "%choice%"=="" set choice=1

cd /d "%~dp0backend"

if "%choice%"=="1" (
  echo.
  echo [RUNNING] 100 Concurrent Student Logins & Live Continuity Watchdog...
  npx tsx src/tests/concurrentStressTest.ts --mode=login --users=100
) else if "%choice%"=="2" (
  echo.
  echo [RUNNING] 100 Concurrent Student Registrations & Concurrency Gate...
  npx tsx src/tests/concurrentStressTest.ts --mode=register --users=100
) else (
  echo.
  echo [RUNNING] Full Suite: 100 Logins + 100 Registrations + Watchdog...
  npx tsx src/tests/concurrentStressTest.ts --mode=both --users=100
)

echo.
echo ==============================================================================
echo   Test completed. Check results and crash analysis above.
echo ==============================================================================
pause
