# AtalJudge Windows PowerShell Commands
# Alternative to Makefile for Windows users

Write-Host "AtalJudge Docker Commands (Windows)" -ForegroundColor Cyan
Write-Host "====================================`n"

Write-Host "Building:" -ForegroundColor Yellow
Write-Host "  .\scripts\docker-build.ps1              - Build all Docker images"
Write-Host "  .\scripts\docker-build.ps1 -Service frontend  - Build frontend only"
Write-Host "  .\scripts\docker-build.ps1 -Service backend   - Build backend only"
Write-Host "  .\scripts\docker-build.ps1 -Service test-case-manager  - Build TCM only"
Write-Host ""

Write-Host "Publishing:" -ForegroundColor Yellow
Write-Host "  .\scripts\docker-push.ps1               - Push all images to Docker Hub"
Write-Host "  .\scripts\docker-build.ps1 -Push        - Build and push all"
Write-Host ""

Write-Host "Development:" -ForegroundColor Yellow
Write-Host "  docker-compose up -d                    - Start all services"
Write-Host "  docker-compose down                     - Stop all services"
Write-Host "  docker-compose logs -f                  - View logs"
Write-Host "  docker-compose ps                       - Check status"
Write-Host ""

Write-Host "Version:" -ForegroundColor Yellow
$VERSION = if (Test-Path "VERSION") { Get-Content "VERSION" -Raw } else { "1.0.0" }
Write-Host "  Current version: $($VERSION.Trim())"
Write-Host ""

Write-Host "Health Check:" -ForegroundColor Yellow
Write-Host "  Testing services..."
$services = @(
    @{Name="Frontend"; Url="http://localhost:3000"},
    @{Name="Backend"; Url="http://localhost:3333/health"},
    @{Name="Test Case Manager"; Url="http://localhost:8000/health"},
    @{Name="Judge0"; Url="http://localhost:2358"}
)

foreach ($svc in $services) {
    try {
        $response = Invoke-WebRequest -Uri $svc.Url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✓ $($svc.Name): healthy" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $($svc.Name): unhealthy" -ForegroundColor Red
    }
}
