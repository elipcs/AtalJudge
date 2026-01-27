# Stage 1: Frontend Builder
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install --frozen-lockfile
COPY frontend/ .
# Setup Next.js environment for static export
ENV NEXT_PUBLIC_API_BASE_URL=/api
RUN bun run build

# Stage 2: Backend Builder
FROM oven/bun:1-alpine AS backend-builder
WORKDIR /app
COPY backend/package.json backend/bun.lockb* ./
RUN bun install --frozen-lockfile
COPY backend/ .
RUN bun run build

# Stage 3: Production Image
FROM oven/bun:1-alpine
WORKDIR /app

# Install Docker CLI for LocalExecutionService
RUN apk add --no-cache docker-cli

# Copy Backend Build
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package.json ./

# Copy Frontend Build (Static Export)
COPY --from=frontend-builder /app/out ./client

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy Scripts
COPY backend/scripts ./scripts

# Expose API port
EXPOSE 3333

# Start the application (Run migrations then start server)
CMD ["sh", "-c", "bun run scripts/run-migrations.js && bun run dist/server.js"]
