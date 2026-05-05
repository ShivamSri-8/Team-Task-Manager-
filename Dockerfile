# ── Stage 1: Build the React frontend ────────────────────────────────────────
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Run the Express backend ─────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Install backend dependencies (production only)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend from Stage 1 into backend's public folder
COPY --from=frontend-build /app/frontend/dist ./public

# Expose the port Railway will use
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
