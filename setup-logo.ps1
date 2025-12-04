# Quick setup script to prepare for JCM logo PNG
# The image file should be placed at: public/logo/jcm-logo.png

Write-Host "JCM Logo Setup Instructions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To use the JCM PNG image:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Save the JCM image file as:" -ForegroundColor White
Write-Host "   Filename: jcm-logo.png" -ForegroundColor Cyan
Write-Host "   Location: d:\Datadash\dashboard\public\logo\" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Then run the build and deploy:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Add JCM PNG logo'" -ForegroundColor Cyan
Write-Host "   git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your dashboard will update in 2-3 minutes!" -ForegroundColor Green
