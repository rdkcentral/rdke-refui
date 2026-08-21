# flutter-dist.ps1 - Build script for Flutter Web production build (Windows)
# Generates a deployable flutter-dist/ folder in the project root.
#
# Usage: powershell -ExecutionPolicy Bypass -File flutter-dist.ps1
# Requirements: Flutter SDK must be installed and in PATH.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$FlutterAppDir = $ScriptDir
$DistDir = Join-Path $ProjectRoot "flutter-dist"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " RDK RefUI - Flutter Web Build" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean previous builds
Write-Host "[1/4] Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
    Write-Host "       Removed existing flutter-dist/"
}

Set-Location $FlutterAppDir
flutter clean
Write-Host "       Flutter clean complete."
Write-Host ""

# Step 2: Get dependencies
Write-Host "[2/4] Getting dependencies..." -ForegroundColor Yellow
flutter pub get
Write-Host "       Dependencies resolved."
Write-Host ""

# Step 3: Build Flutter Web (release)
Write-Host "[3/4] Building Flutter Web (release)..." -ForegroundColor Yellow
flutter build web --release
Write-Host "       Build complete."
Write-Host ""

# Step 4: Copy output to flutter-dist/
Write-Host "[4/4] Copying build output to flutter-dist/..." -ForegroundColor Yellow
Copy-Item -Recurse -Force (Join-Path $FlutterAppDir "build\web") $DistDir
Write-Host "       Output copied to: $DistDir"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host " BUILD SUCCESSFUL" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host " Output: $DistDir" -ForegroundColor White
Write-Host ""
Write-Host " To serve locally:" -ForegroundColor White
Write-Host "   cd $DistDir" -ForegroundColor Gray
Write-Host "   python -m http.server 8080" -ForegroundColor Gray
Write-Host ""
Write-Host " Then open: http://localhost:8080" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Green
