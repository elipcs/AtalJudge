# AtalJudge Quick Deploy Script - PowerShell Version
# Pulls and starts all services from Docker Hub

$ErrorActionPreference = "Stop"

Write-Host "================================================"
Write-Host "  AtalJudge Quick Deploy"
Write-Host "================================================"
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env from template..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "Please create .env file with your configuration" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Pull latest images
Write-Host "📥 Pulling latest images from Docker Hub..." -ForegroundColor Green
docker pull elipcs/ataljudge-frontend:latest
docker pull elipcs/ataljudge-backend:latest

# Copy production compose file
if (-not (Test-Path "docker-compose.prod.yml")) {
    Write-Host "Creating docker-compose.prod.yml from template..."
    Copy-Item "docker-compose.prod.yml.template" "docker-compose.prod.yml"
}

# Start services
Write-Host ""
Write-Host "🚀 Starting AtalJudge services..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d

# Wait a bit for services to start
Write-Host ""
Write-Host "⏳ Waiting for services to start..."
Start-Sleep -Seconds 5

# Check health
Write-Host ""
Write-Host "🏥 Checking service health..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ AtalJudge is running!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:3333"
Write-Host ""
Write-Host "To stop: docker-compose -f docker-compose.prod.yml down"
Write-Host "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
