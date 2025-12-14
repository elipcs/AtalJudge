#!/bin/bash

# AtalJudge Quick Deploy Script
# Pulls and starts all services from Docker Hub

set -e

echo "================================================"
echo "  AtalJudge Quick Deploy"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env from template..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file with your configuration"
    echo ""
fi

# Pull latest images
echo "📥 Pulling latest images from Docker Hub..."
docker pull elipcs/ataljudge-frontend:latest
docker pull elipcs/ataljudge-backend:latest

# Copy production compose file
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "Creating docker-compose.prod.yml from template..."
    cp docker-compose.prod.yml.template docker-compose.prod.yml
fi

# Start services
echo ""
echo "🚀 Starting AtalJudge services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait a bit for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check health
echo ""
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "================================================"
echo "  ✅ AtalJudge is running!"
echo "================================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3333"
echo ""
echo "To stop: docker-compose -f docker-compose.prod.yml down"
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
