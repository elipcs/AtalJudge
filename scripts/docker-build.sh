#!/bin/bash

# AtalJudge Docker Build Script
# Builds Docker images for all services with proper tagging

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-elipcs}"
VERSION=$(cat VERSION 2>/dev/null || echo "1.0.0")
SERVICES=("frontend" "backend")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
BUILD_MULTI_ARCH=false
PUSH_IMAGES=false
SERVICE=""

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --service <name>    Build specific service (frontend|backend)"
    echo "  -m, --multi-arch        Build for multiple architectures (amd64, arm64)"
    echo "  -p, --push              Push images after building"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Build all services for current platform"
    echo "  $0 -s frontend          # Build only frontend"
    echo "  $0 -m -p                # Build multi-arch and push to Docker Hub"
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -m|--multi-arch)
            BUILD_MULTI_ARCH=true
            shift
            ;;
        -p|--push)
            PUSH_IMAGES=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if logged in to Docker Hub when pushing
if [ "$PUSH_IMAGES" = true ]; then
    if ! docker info | grep -q "Username"; then
        echo -e "${YELLOW}Warning: Not logged in to Docker Hub${NC}"
        echo "Run: docker login"
        exit 1
    fi
fi

# Function to build a service
build_service() {
    local service=$1
    local context_dir=$2
    local image_name="${DOCKER_USERNAME}/ataljudge-${service}"
    
    echo -e "${GREEN}Building ${service}...${NC}"
    echo "Image: ${image_name}"
    echo "Version: ${VERSION}"
    
    # Parse version for tags
    IFS='.' read -ra VERSION_PARTS <<< "$VERSION"
    MAJOR="${VERSION_PARTS[0]}"
    MINOR="${VERSION_PARTS[1]:-0}"
    
    # Build tags
    TAGS=(
        "${image_name}:latest"
        "${image_name}:${VERSION}"
        "${image_name}:${MAJOR}.${MINOR}"
        "${image_name}:${MAJOR}"
    )
    
    # Build command
    BUILD_CMD="docker build"
    
    # Add platform if multi-arch
    if [ "$BUILD_MULTI_ARCH" = true ]; then
        echo "Building for multiple architectures (amd64, arm64)..."
        BUILD_CMD="docker buildx build --platform linux/amd64,linux/arm64"
        
        # Multi-arch requires push or load, we'll push if requested
        if [ "$PUSH_IMAGES" = true ]; then
            BUILD_CMD="${BUILD_CMD} --push"
        else
            echo -e "${YELLOW}Warning: Multi-arch build without --push will not save images locally${NC}"
            BUILD_CMD="${BUILD_CMD} --load"  # Only works for single platform
            BUILD_MULTI_ARCH=false  # Fallback to single arch
        fi
    fi
    
    # Add all tags
    for tag in "${TAGS[@]}"; do
        BUILD_CMD="${BUILD_CMD} -t ${tag}"
    done
    
    # Add build args for frontend
    if [ "$service" = "frontend" ]; then
        BUILD_CMD="${BUILD_CMD} --build-arg NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}"
        BUILD_CMD="${BUILD_CMD} --build-arg NEXT_PUBLIC_API_BASE_URL=\${NEXT_PUBLIC_API_BASE_URL}"
    fi
    
    # Add context
    BUILD_CMD="${BUILD_CMD} ${context_dir}"
    
    # Execute build
    echo "Command: ${BUILD_CMD}"
    eval $BUILD_CMD
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${service} built successfully${NC}"
        
        # Push if requested and not already pushed by buildx
        if [ "$PUSH_IMAGES" = true ] && [ "$BUILD_MULTI_ARCH" = false ]; then
            echo -e "${GREEN}Pushing ${service}...${NC}"
            for tag in "${TAGS[@]}"; do
                docker push "$tag"
            done
            echo -e "${GREEN}✓ ${service} pushed successfully${NC}"
        fi
    else
        echo -e "${RED}✗ Failed to build ${service}${NC}"
        exit 1
    fi
    
    echo ""
}

# Main build logic
echo "================================================"
echo "  AtalJudge Docker Build"
echo "================================================"
echo "Version: ${VERSION}"
echo "Docker Username: ${DOCKER_USERNAME}"
echo "Multi-arch: ${BUILD_MULTI_ARCH}"
echo "Push: ${PUSH_IMAGES}"
echo "================================================"
echo ""

# Build specific service or all services
if [ -n "$SERVICE" ]; then
    case $SERVICE in
        frontend)
            build_service "frontend" "./frontend"
            ;;
        backend)
            build_service "backend" "./backend"
            ;;
        *)
            echo -e "${RED}Invalid service: ${SERVICE}${NC}"
            echo "Valid services: frontend, backend"
            exit 1
            ;;
    esac
else
    # Build all services
    build_service "frontend" "./frontend"
    build_service "backend" "./backend"
fi

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Images built:"
for service in "${SERVICES[@]}"; do
    if [ -z "$SERVICE" ] || [ "$SERVICE" = "$service" ]; then
        echo "  - ${DOCKER_USERNAME}/ataljudge-${service}:${VERSION}"
        echo "  - ${DOCKER_USERNAME}/ataljudge-${service}:latest"
    fi
done
echo ""

if [ "$PUSH_IMAGES" = true ]; then
    echo -e "${GREEN}Images pushed to Docker Hub successfully!${NC}"
else
    echo -e "${YELLOW}To push images to Docker Hub, run:${NC}"
    echo "  ./scripts/docker-build.sh -p"
    echo "  or"
    echo "  ./scripts/docker-push.sh"
fi
