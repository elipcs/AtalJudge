# AtalJudge Makefile
# Convenient commands for Docker builds and management

.PHONY: help build build-frontend build-backend build-tcm push version bump-major bump-minor bump-patch clean

# Variables
VERSION := $(shell cat VERSION)
DOCKER_USERNAME ?= elipcs

help:
	@echo "AtalJudge Docker Commands"
	@echo "========================="
	@echo ""
	@echo "Building:"
	@echo "  make build              - Build all Docker images"
	@echo "  make build-frontend     - Build frontend image only"
	@echo "  make build-backend      - Build backend image only"
	@echo "  make build-tcm          - Build test-case-manager image only"
	@echo "  make build-multi        - Build multi-architecture images"
	@echo ""
	@echo "Publishing:"
	@echo "  make push               - Push all images to Docker Hub"
	@echo "  make publish            - Build and push all images"
	@echo ""
	@echo "Versioning:"
	@echo "  make version            - Show current version"
	@echo "  make bump-major         - Bump major version (X.0.0)"
	@echo "  make bump-minor         - Bump minor version (x.X.0)"
	@echo "  make bump-patch         - Bump patch version (x.x.X)"
	@echo ""
	@echo "Development:"
	@echo "  make up                 - Start all services with docker-compose"
	@echo "  make up-prod            - Start with production config"
	@echo "  make down               - Stop all services"
	@echo "  make logs               - View logs"
	@echo "  make clean              - Remove all containers and images"
	@echo ""
	@echo "Current version: $(VERSION)"

# Build commands
build:
	@bash scripts/docker-build.sh

build-frontend:
	@bash scripts/docker-build.sh -s frontend

build-backend:
	@bash scripts/docker-build.sh -s backend

build-tcm:
	@bash scripts/docker-build.sh -s test-case-manager

build-multi:
	@bash scripts/docker-build.sh -m

# Push commands
push:
	@bash scripts/docker-push.sh

publish: build push
	@echo "Build and push complete!"

publish-multi:
	@bash scripts/docker-build.sh -m -p

# Version commands
version:
	@echo "Current version: $(VERSION)"

bump-major:
	@echo "Bumping major version..."
	@current=$$(cat VERSION); \
	major=$$(echo $$current | cut -d. -f1); \
	new_major=$$(($$major + 1)); \
	echo "$$new_major.0.0" > VERSION
	@echo "Version bumped to $$(cat VERSION)"

bump-minor:
	@echo "Bumping minor version..."
	@current=$$(cat VERSION); \
	major=$$(echo $$current | cut -d. -f1); \
	minor=$$(echo $$current | cut -d. -f2); \
	new_minor=$$(($$minor + 1)); \
	echo "$$major.$$new_minor.0" > VERSION
	@echo "Version bumped to $$(cat VERSION)"

bump-patch:
	@echo "Bumping patch version..."
	@current=$$(cat VERSION); \
	major=$$(echo $$current | cut -d. -f1); \
	minor=$$(echo $$current | cut -d. -f2); \
	patch=$$(echo $$current | cut -d. -f3); \
	new_patch=$$(($$patch + 1)); \
	echo "$$major.$$minor.$$new_patch" > VERSION
	@echo "Version bumped to $$(cat VERSION)"

# Docker Compose commands
up:
	docker-compose up -d
	@echo "Services started! Access at http://localhost:3000"

up-prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "Services started in production mode!"

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-frontend:
	docker-compose logs -f frontend

logs-backend:
	docker-compose logs -f backend

logs-tcm:
	docker-compose logs -f test-case-manager

# Cleanup
clean:
	@echo "Stopping all containers..."
	docker-compose down -v
	@echo "Removing AtalJudge images..."
	docker images | grep ataljudge | awk '{print $$3}' | xargs -r docker rmi -f || true
	@echo "Cleanup complete!"

# Development helpers
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && npm run dev

dev-tcm:
	cd test-case-manager && python run.py

# Health checks
health:
	@echo "Checking service health..."
	@curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✓ Frontend: healthy" || echo "✗ Frontend: unhealthy"
	@curl -f http://localhost:3333/health > /dev/null 2>&1 && echo "✓ Backend: healthy" || echo "✗ Backend: unhealthy"
	@curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✓ Test Case Manager: healthy" || echo "✗ Test Case Manager: unhealthy"
	@curl -f http://localhost:2358 > /dev/null 2>&1 && echo "✓ Judge0: healthy" || echo "✗ Judge0: unhealthy"
