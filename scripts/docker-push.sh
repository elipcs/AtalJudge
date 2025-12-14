#!/bin/bash

# AtalJudge Docker Push Script
# Pushes Docker images to Docker Hub

set -e

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-elipcs}"
VERSION=$(cat VERSION 2>/dev/null || echo "1.0.0")
SERVICES=("frontend" "backend")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if logged in
if ! docker info | grep -q "Username"; then
    echo -e "${RED}Error: Not logged in to Docker Hub${NC}"
    echo "Please run: docker login"
    exit 1
fi

echo "================================================"
echo "  AtalJudge Docker Push"
echo "================================================"
echo "Version: ${VERSION}"
echo "Docker Username: ${DOCKER_USERNAME}"
echo "================================================"
echo ""

# Parse version
IFS='.' read -ra VERSION_PARTS <<< "$VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]:-0}"

# Push all services
for service in "${SERVICES[@]}"; do
    image_name="${DOCKER_USERNAME}/ataljudge-${service}"
    
    echo -e "${GREEN}Pushing ${service}...${NC}"
    
    # Push all tags
    docker push "${image_name}:latest"
    docker push "${image_name}:${VERSION}"
    docker push "${image_name}:${MAJOR}.${MINOR}"
    docker push "${image_name}:${MAJOR}"
    
    echo -e "${GREEN}✓ ${service} pushed successfully${NC}"
    echo ""
done

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  All images pushed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "View images at:"
for service in "${SERVICES[@]}"; do
    echo "  https://hub.docker.com/r/${DOCKER_USERNAME}/ataljudge-${service}"
done
