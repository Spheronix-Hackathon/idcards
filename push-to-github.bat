@echo off
echo ========================================================
echo   Uploading Spheronix Student ID Project to GitHub
echo   Repository: https://github.com/Spheronix-Hackathon/idcards.git
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/5] Checking Git initialization...
if not exist ".git" (
    git init
    echo Git repository initialized.
) else (
    echo Git repository already exists.
)

echo.
echo [2/5] Configuring Remote origin...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/Spheronix-Hackathon/idcards.git
echo Remote origin set to https://github.com/Spheronix-Hackathon/idcards.git

echo.
echo [3/5] Staging files...
git add .

echo.
echo [4/5] Committing changes...
git commit -m "Spheronix Student ID Card Generator - Official Portal with Photo Cropper, Retrieval & Export"

echo.
echo [5/5] Setting main branch and pushing to GitHub...
git branch -M main

echo Pushing to GitHub (if prompted, please sign in to your GitHub account)...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Standard push was rejected (remote repository likely has an existing README or branch).
    echo Overwriting remote with all project files using --force...
    git push -u origin main --force
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! All project files and folders uploaded to:
    echo   https://github.com/Spheronix-Hackathon/idcards
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed. Please verify your internet connection and GitHub repository permissions.
)

echo.
pause
