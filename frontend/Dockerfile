# ---------- Builder ----------
FROM node:20-slim AS builder

# Metadata
LABEL maintainer="AtalJudge Team"
LABEL org.opencontainers.image.title="AtalJudge Frontend"
LABEL org.opencontainers.image.description="Next.js frontend for AtalJudge online judge platform"
LABEL org.opencontainers.image.source="https://github.com/elipcs/AtalJudge"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

COPY package*.json ./
# Install ALL dependencies (including devDependencies like TypeScript needed for build)
RUN npm install
COPY . .
# Set NODE_ENV to production for build optimization
ENV NODE_ENV=production
# Build Next.js app
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine

# Metadata
LABEL maintainer="AtalJudge Team"
LABEL org.opencontainers.image.title="AtalJudge Frontend"
LABEL org.opencontainers.image.description="Next.js frontend for AtalJudge online judge platform"
LABEL org.opencontainers.image.source="https://github.com/elipcs/AtalJudge"
LABEL org.opencontainers.image.version="1.0.0"

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Accept and set runtime environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Copy necessary files for standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

