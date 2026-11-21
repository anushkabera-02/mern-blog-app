# ==========================================
# Production Dockerfile for Express.js Backend
# ==========================================
FROM node:20-alpine AS base

# Install dumb-init or clean shell if needed
WORKDIR /app

# Install dependencies first (leverage Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Use non-root node user for container security
USER node

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
