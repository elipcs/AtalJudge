# AtalJudge Docker Push Script - PowerShell Version
# Pushes Docker images to Docker Hub

# Configuration
$DOCKER_USERNAME = if ($env:DOCKER_USERNAME) { $env:DOCKER_USERNAME } else { "elipcs" }
$VERSION = if (Test-Path "VERSION") { Get-Content "VERSION" -Raw } else { "1.0.0" }
$VERSION = $VERSION.Trim()
$SERVICES = @("frontend", "backend")

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

# Check if logged in
$dockerInfo = docker info 2>&1 | Out-String
if (-not ($dockerInfo -match "Username")) {
    Write-Host "Error: Not logged in to Docker Hub" -ForegroundColor $Red
    Write-Host "Please run: docker login"
    exit 1
}

Write-Host "================================================"
Write-Host "  AtalJudge Docker Push"
Write-Host "================================================"
Write-Host "Version: $VERSION"
Write-Host "Docker Username: $DOCKER_USERNAME"
Write-Host "================================================"
Write-Host ""

# Parse version
$versionParts = $VERSION.Split('.')
$major = $versionParts[0]
$minor = if ($versionParts.Length -gt 1) { $versionParts[1] } else { "0" }

# Push all services
foreach ($service in $SERVICES) {
    $imageName = "$DOCKER_USERNAME/ataljudge-$service"
    
    Write-Host "Pushing $service..." -ForegroundColor $Green
    
    # Push all tags
    docker push "${imageName}:latest"
    docker push "${imageName}:${VERSION}"
    docker push "${imageName}:${major}.${minor}"
    docker push "${imageName}:${major}"
    
    Write-Host "✓ $service pushed successfully" -ForegroundColor $Green
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor $Green
Write-Host "  All images pushed successfully!" -ForegroundColor $Green
Write-Host "================================================" -ForegroundColor $Green
Write-Host ""
Write-Host "View images at:"
foreach ($service in $SERVICES) {
    Write-Host "  https://hub.docker.com/r/$DOCKER_USERNAME/ataljudge-$service"
}
