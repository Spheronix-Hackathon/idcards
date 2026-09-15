# PowerShell script to upload Spheronix project to GitHub
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Uploading Spheronix Student ID Project to GitHub" -ForegroundColor Cyan
Write-Host "  Repository: https://github.com/Spheronix-Hackathon/idcards.git" -ForegroundColor DarkCyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Step 1: Initialize Git
Write-Host "[1/5] Checking Git initialization..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Git repository initialized." -ForegroundColor Green
} else {
    Write-Host "Git repository already exists." -ForegroundColor Green
}

# Step 2: Configure Remote
Write-Host "`n[2/5] Configuring Remote origin..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/Spheronix-Hackathon/idcards.git
Write-Host "Remote origin set to https://github.com/Spheronix-Hackathon/idcards.git" -ForegroundColor Green

# Step 3: Stage files
Write-Host "`n[3/5] Staging files..." -ForegroundColor Yellow
git add .

# Step 4: Commit
Write-Host "`n[4/5] Committing changes..." -ForegroundColor Yellow
git commit -m "Spheronix Student ID Card Generator - Official Portal with Photo Cropper, Retrieval & Export"

# Step 5: Push
Write-Host "`n[5/5] Pushing to GitHub (branch: main)..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nStandard push was rejected (remote repository likely contains an existing README).`nOverwriting remote with all project files using --force..." -ForegroundColor Yellow
    git push -u origin main --force
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! All project files and folders uploaded to:" -ForegroundColor Green
    Write-Host "  https://github.com/Spheronix-Hackathon/idcards" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Push failed. Please verify your internet connection and GitHub repository permissions." -ForegroundColor Red
}
