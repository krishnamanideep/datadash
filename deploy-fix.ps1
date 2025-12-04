#!/usr/bin/env pwsh

# Election Dashboard - Automated Deployment Script
# This script automates GitHub Pages deployment

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Election Dashboard - GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git Installation
Write-Host "Step 1: Checking Git Installation..." -ForegroundColor Yellow
$gitInstalled = $null -ne (Get-Command git -ErrorAction SilentlyContinue)

if (-not $gitInstalled) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "OK: Git is installed" -ForegroundColor Green
git --version
Write-Host ""

# Step 2: Verify build
Write-Host "Step 2: Verifying production build..." -ForegroundColor Yellow
if (-not (Test-Path "./out")) {
    Write-Host "Building now..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK: Production build exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Initialize Git
Write-Host "Step 3: Initializing Git Repository..." -ForegroundColor Yellow
if (-not (Test-Path "./.git")) {
    git init
    Write-Host "OK: Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "OK: Git repository already exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Configure Git User
Write-Host "Step 4: Configuring Git User..." -ForegroundColor Yellow
$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName) {
    Write-Host ""
    $userName = Read-Host "Enter your Git username"
    git config user.name $userName
}

if (-not $gitUserEmail) {
    Write-Host ""
    $userEmail = Read-Host "Enter your Git email (use your GitHub email)"
    git config user.email $userEmail
}

Write-Host "OK: Git user configured" -ForegroundColor Green
git config user.name
git config user.email
Write-Host ""

# Step 5: Add and Commit
Write-Host "Step 5: Staging and Committing Files..." -ForegroundColor Yellow
git add .
git commit -m "Election Dashboard - Production Build"
Write-Host "OK: Files committed" -ForegroundColor Green
Write-Host ""

# Step 6: Get Repository URL
Write-Host "Step 6: Setting Up Remote Repository..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Before continuing, you need to:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Create a NEW repository named 'datadash'" -ForegroundColor White
Write-Host "3. Don't initialize with README/gitignore" -ForegroundColor White
Write-Host "4. Copy the HTTPS URL from GitHub" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Paste your GitHub repository URL"

if (-not $repoUrl) {
    Write-Host "ERROR: No repository URL provided" -ForegroundColor Red
    exit 1
}

git remote add origin $repoUrl
Write-Host "OK: Remote repository configured" -ForegroundColor Green
Write-Host ""

# Step 7: Push to GitHub
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may be prompted to authenticate with GitHub" -ForegroundColor Cyan
Write-Host ""

git branch -M main
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed! Check your URL and authentication." -ForegroundColor Red
    exit 1
}

Write-Host "OK: Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""

# Step 8: Enable GitHub Pages
Write-Host "Step 8: Enabling GitHub Pages..." -ForegroundColor Yellow
Write-Host ""
Write-Host "MANUAL STEP REQUIRED:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to your GitHub repository" -ForegroundColor White
Write-Host "2. Click 'Settings' -> 'Pages'" -ForegroundColor White
Write-Host "3. Under 'Source', select 'GitHub Actions'" -ForegroundColor White
Write-Host "4. Save settings" -ForegroundColor White
Write-Host ""

$pauseWait = Read-Host "Have you completed the GitHub Pages setup? (yes/no)"

if ($pauseWait -ne "yes") {
    Write-Host "Skipping verification. Complete GitHub Pages setup manually." -ForegroundColor Yellow
} else {
    Write-Host "OK: GitHub Pages setup confirmed" -ForegroundColor Green
}

Write-Host ""

# Final Summary
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT INITIATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: $($repoUrl)" -ForegroundColor Green
Write-Host ""
Write-Host "Your dashboard will be live at:" -ForegroundColor Green
Write-Host "https://YOUR_USERNAME.github.io/datadash/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment takes 2-3 minutes" -ForegroundColor White
Write-Host "Check GitHub Actions tab for status" -ForegroundColor White
Write-Host "Auto-deploys on every push to main" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for GitHub Actions to complete" -ForegroundColor White
Write-Host "2. Go to GitHub Actions tab to see deployment log" -ForegroundColor White
Write-Host "3. Visit your dashboard URL above when it's ready" -ForegroundColor White
Write-Host "4. Share your dashboard with stakeholders!" -ForegroundColor White
Write-Host ""
Write-Host "Deployment complete! Dashboard will be online soon." -ForegroundColor Green
Write-Host ""
