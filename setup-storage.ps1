# Firebase Storage Setup Script
# This script will open the Firebase Console and guide you through enabling Storage

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firebase Storage Setup Assistant" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening Firebase Console..." -ForegroundColor Yellow
Start-Process "https://console.firebase.google.com/project/datadash-459eb/storage"

Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Green
Write-Host "1. The Firebase Console should open in your browser" -ForegroundColor White
Write-Host "2. If you see a 'Get Started' button, click it" -ForegroundColor White
Write-Host "3. Choose 'Start in production mode'" -ForegroundColor White
Write-Host "4. Select location: 'asia-south1' (or any location)" -ForegroundColor White
Write-Host "5. Click 'Done'" -ForegroundColor White
Write-Host ""
Write-Host "6. Once enabled, come back here and press ENTER" -ForegroundColor Yellow

Read-Host "Press ENTER when Storage is enabled"

Write-Host ""
Write-Host "Deploying Storage Rules..." -ForegroundColor Yellow

# Deploy storage rules
firebase deploy --only storage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Storage is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now upload maps in the admin panel!" -ForegroundColor White
    Write-Host "Go to: http://localhost:3000/admin" -ForegroundColor Cyan
    Write-Host "Click: Settings tab -> Upload map image" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Deployment failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error message above" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press ENTER to close"
