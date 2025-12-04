#!/usr/bin/env pwsh

# Election Dashboard - Automated Deployment Script
# This script automates GitHub Pages deployment

$gitPath = "C:\Program Files\Git\bin\git.exe"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Election Dashboard - GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify build
Write-Host "Step 1: Verifying production build..." -ForegroundColor Yellow
if (-not (Test-Path "./out")) {
    Write-Host "Building now..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK: Production build exists" -ForegroundColor Green
    $fileCount = (Get-ChildItem "./out" -Recurse | Measure-Object).Count
    Write-Host "Files ready: $fileCount" -ForegroundColor Green
}
Write-Host ""

# Step 2: Initialize Git
Write-Host "Step 2: Initializing Git Repository..." -ForegroundColor Yellow
if (-not (Test-Path "./.git")) {
    & $gitPath "init"
    Write-Host "OK: Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "OK: Git repository already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Configure Git User
Write-Host "Step 3: Configuring Git User..." -ForegroundColor Yellow
$gitUserName = & $gitPath "config" "user.name"
$gitUserEmail = & $gitPath "config" "user.email"

if (-not $gitUserName) {
    Write-Host ""
    $userName = Read-Host "Enter your Git username"
    & $gitPath "config" "user.name" $userName
}

if (-not $gitUserEmail) {
    Write-Host ""
    $userEmail = Read-Host "Enter your Git email (use your GitHub email)"
    & $gitPath "config" "user.email" $userEmail
}

Write-Host "OK: Git user configured" -ForegroundColor Green
Write-Host "Name: $(& $gitPath config user.name)" -ForegroundColor Gray
Write-Host "Email: $(& $gitPath config user.email)" -ForegroundColor Gray
Write-Host ""

# Step 4: Add and Commit
Write-Host "Step 4: Staging and Committing Files..." -ForegroundColor Yellow
& $gitPath "add" "."
$commitResult = & $gitPath "commit" "-m" "Election Dashboard - Production Build" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Files committed" -ForegroundColor Green
} else {
    Write-Host "Note: $($commitResult -join ' ')" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Get Repository URL
Write-Host "Step 5: Setting Up Remote Repository..." -ForegroundColor Yellow
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

$remoteCheck = & $gitPath "remote" -v 2>&1 | Select-String "origin"
if (-not $remoteCheck) {
    & $gitPath "remote" "add" "origin" $repoUrl
}
Write-Host "OK: Remote repository configured" -ForegroundColor Green
Write-Host ""

# Step 6: Push to GitHub
Write-Host "Step 6: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may be prompted to authenticate with GitHub" -ForegroundColor Cyan
Write-Host ""

& $gitPath "branch" "-M" "main"
& $gitPath "push" "-u" "origin" "main"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed! Check your URL and authentication." -ForegroundColor Red
    Write-Host "Try again with: git push -u origin main" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""

# Step 7: Enable GitHub Pages
Write-Host "Step 7: Enabling GitHub Pages..." -ForegroundColor Yellow
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
