# AtalJudge Docker Build Script - PowerShell Version
# Builds Docker images for all services with proper tagging

param(
    [string]$Service = "",
    [switch]$Push = $false,
    [switch]$MultiArch = $false,
    [switch]$Help = $false
)

# Configuration
$DOCKER_USERNAME = if ($env:DOCKER_USERNAME) { $env:DOCKER_USERNAME } else { "elipcs" }
$VERSION = if (Test-Path "VERSION") { Get-Content "VERSION" -Raw } else { "1.0.0" }
$VERSION = $VERSION.Trim()
$SERVICES = @("frontend", "backend")

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

function Show-Usage {
    Write-Host "Usage: .\scripts\docker-build.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Service <name>    Build specific service (frontend|backend)"
    Write-Host "  -MultiArch         Build for multiple architectures (amd64, arm64)"
    Write-Host "  -Push              Push images after building"
    Write-Host "  -Help              Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\scripts\docker-build.ps1                     # Build all services"
    Write-Host "  .\scripts\docker-build.ps1 -Service frontend   # Build only frontend"
    Write-Host "  .\scripts\docker-build.ps1 -Push               # Build and push all"
    exit 0
}

if ($Help) {
    Show-Usage
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running" -ForegroundColor $Red
    exit 1
}

# Check if logged in when pushing
# Note: Commented out as this check doesn't work reliably on all Windows environments
# Docker will fail naturally on push if not logged in
# if ($Push) {
#     $dockerInfo = docker info 2>&1 | Out-String
#     if (-not ($dockerInfo -match "Username")) {
#         Write-Host "Warning: Not logged in to Docker Hub" -ForegroundColor $Yellow
#         Write-Host "Run: docker login"
#         exit 1
#     }
# }

function Build-Service {
    param(
        [string]$ServiceName,
        [string]$ContextDir
    )
    
    $imageName = "$DOCKER_USERNAME/ataljudge-$ServiceName"
    
    Write-Host "`nBuilding $ServiceName..." -ForegroundColor $Green
    Write-Host "Image: $imageName"
    Write-Host "Version: $VERSION"
    
    # Parse version for tags
    $versionParts = $VERSION.Split('.')
    $major = $versionParts[0]
    $minor = if ($versionParts.Length -gt 1) { $versionParts[1] } else { "0" }
    
    # Build tags
    $tags = @(
        "${imageName}:latest",
        "${imageName}:${VERSION}",
        "${imageName}:${major}.${minor}",
        "${imageName}:${major}"
    )
    
    # Build command
    $buildCmd = "docker"
    $buildArgs = @("build")
    
    # Add platform if multi-arch
    if ($MultiArch) {
        Write-Host "Multi-arch builds require Docker Buildx..."
        $buildArgs = @("buildx", "build", "--platform", "linux/amd64,linux/arm64")
        
        if ($Push) {
            $buildArgs += "--push"
        } else {
            Write-Host "Warning: Multi-arch build without -Push will not save images locally" -ForegroundColor $Yellow
            $buildArgs += "--load"
            $MultiArch = $false  # Fallback to single arch
        }
    }
    
    # Add all tags
    foreach ($tag in $tags) {
        $buildArgs += "-t"
        $buildArgs += $tag
    }
    
    # Add build args for frontend
    if ($ServiceName -eq "frontend") {
        $buildArgs += "--build-arg"
        $buildArgs += "NEXT_PUBLIC_API_URL=$env:NEXT_PUBLIC_API_URL"
        $buildArgs += "--build-arg"
        $buildArgs += "NEXT_PUBLIC_API_BASE_URL=$env:NEXT_PUBLIC_API_BASE_URL"
    }
    
    # Add context
    $buildArgs += $ContextDir
    
    # Execute build
    Write-Host "Command: docker $($buildArgs -join ' ')"
    & $buildCmd $buildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $ServiceName built successfully" -ForegroundColor $Green
        
        # Push if requested and not already pushed by buildx
        if ($Push -and -not $MultiArch) {
            Write-Host "Pushing $ServiceName..." -ForegroundColor $Green
            foreach ($tag in $tags) {
                docker push $tag
            }
            Write-Host "✓ $ServiceName pushed successfully" -ForegroundColor $Green
        }
    } else {
        Write-Host "✗ Failed to build $ServiceName" -ForegroundColor $Red
        exit 1
    }
}

# Main build logic
Write-Host "================================================"
Write-Host "  AtalJudge Docker Build"
Write-Host "================================================"
Write-Host "Version: $VERSION"
Write-Host "Docker Username: $DOCKER_USERNAME"
Write-Host "Multi-arch: $MultiArch"
Write-Host "Push: $Push"
Write-Host "================================================"

# Build specific service or all services
if ($Service) {
    switch ($Service.ToLower()) {
        "frontend" { Build-Service "frontend" ".\frontend" }
        "backend" { Build-Service "backend" ".\backend" }
        default {
            Write-Host "Invalid service: $Service" -ForegroundColor $Red
            Write-Host "Valid services: frontend, backend"
            exit 1
        }
    }
} else {
    # Build all services
    Build-Service "frontend" ".\frontend"
    Build-Service "backend" ".\backend"
}

Write-Host "`n================================================" -ForegroundColor $Green
Write-Host "  Build Complete!" -ForegroundColor $Green
Write-Host "================================================" -ForegroundColor $Green
Write-Host ""
Write-Host "Images built:"
foreach ($svc in $SERVICES) {
    if (-not $Service -or $Service -eq $svc) {
        Write-Host "  - $DOCKER_USERNAME/ataljudge-${svc}:$VERSION"
        Write-Host "  - $DOCKER_USERNAME/ataljudge-${svc}:latest"
    }
}
Write-Host ""

if ($Push) {
    Write-Host "Images pushed to Docker Hub successfully!" -ForegroundColor $Green
} else {
    Write-Host "To push images to Docker Hub, run:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\docker-build.ps1 -Push"
    Write-Host "  or"
    Write-Host "  .\scripts\docker-push.ps1"
}
