#!/usr/bin/env powershell

# Deploy to GitHub Pages using gh-pages branch
# This is a fallback method if GitHub Actions doesn't work

Write-Host "GitHub Pages Deployment (Alternative Method)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

$gitPath = "C:\Program Files\Git\bin\git.exe"
$outDir = "out"

if (-not (Test-Path $outDir)) {
    Write-Host "ERROR: ./out directory not found. Build first!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Creating gh-pages branch..." -ForegroundColor Yellow
& $gitPath branch -D gh-pages 2>$null
& $gitPath checkout --orphan gh-pages

Write-Host "Step 2: Removing all files..." -ForegroundColor Yellow
& $gitPath rm -rf .

Write-Host "Step 3: Copying build output..." -ForegroundColor Yellow
Copy-Item -Path "$outDir\*" -Destination . -Recurse -Force

Write-Host "Step 4: Committing deployment..." -ForegroundColor Yellow
& $gitPath add .
& $gitPath commit -m "Deploy to GitHub Pages [skip ci]"

Write-Host "Step 5: Pushing to gh-pages branch..." -ForegroundColor Yellow
& $gitPath push -u origin gh-pages --force

Write-Host ""
Write-Host "SUCCESS! Website deployed to gh-pages branch" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps on GitHub:" -ForegroundColor Cyan
Write-Host "1. Go to Settings -> Pages" -ForegroundColor White
Write-Host "2. Source: Deploy from a branch" -ForegroundColor White
Write-Host "3. Branch: gh-pages" -ForegroundColor White
Write-Host "4. Folder: / (root)" -ForegroundColor White
Write-Host ""
Write-Host "Your site will be live at:" -ForegroundColor Green
Write-Host "https://krishnamanideep.github.io/datadash/" -ForegroundColor Cyan
