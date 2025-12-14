FROM node:20-slim AS builder

# Metadata
LABEL maintainer="AtalJudge Team"
LABEL org.opencontainers.image.title="AtalJudge Backend"
LABEL org.opencontainers.image.description="Express backend for AtalJudge online judge platform"
LABEL org.opencontainers.image.source="https://github.com/elipcs/AtalJudge"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app
COPY package*.json ./
# Install dependencies (including devDependencies for tsc)
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

# Metadata
LABEL maintainer="AtalJudge Team"
LABEL org.opencontainers.image.title="AtalJudge Backend"
LABEL org.opencontainers.image.description="Express backend for AtalJudge online judge platform"
LABEL org.opencontainers.image.source="https://github.com/elipcs/AtalJudge"
LABEL org.opencontainers.image.version="1.0.0"

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && \
    npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3333

CMD ["node", "dist/server.js"]

