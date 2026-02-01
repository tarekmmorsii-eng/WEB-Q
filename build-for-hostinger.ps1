# Quick Deployment Script for Hostinger

Write-Host "Starting build process..." -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Step 2: Build the project
Write-Host "`nBuilding project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Copy .htaccess to dist
Write-Host "`nCopying .htaccess to dist folder..." -ForegroundColor Yellow
if (Test-Path "public\.htaccess") {
    Copy-Item "public\.htaccess" "dist\.htaccess" -Force
    Write-Host ".htaccess copied successfully!" -ForegroundColor Green
}
else {
    Write-Host "Warning: .htaccess not found in public folder!" -ForegroundColor Yellow
}

# Step 4: Show summary
Write-Host "`nBuild completed successfully!" -ForegroundColor Green
Write-Host "`nFiles ready for upload in dist folder:" -ForegroundColor Cyan
Get-ChildItem -Path "dist" -Recurse | Select-Object FullName

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to Hostinger File Manager" -ForegroundColor White
Write-Host "2. Navigate to public_html folder" -ForegroundColor White
Write-Host "3. Delete old files (keep .well-known if exists)" -ForegroundColor White
Write-Host "4. Upload ALL contents from dist folder" -ForegroundColor White
Write-Host "5. Verify .htaccess is uploaded" -ForegroundColor White
Write-Host "`nYour site will be live at your domain!" -ForegroundColor Green
