# ---------- Stage 1: Build Frontend ----------
FROM node:18 AS build

WORKDIR /app

# Copy package files and install
COPY frontend/package*.json ./
RUN npm install

# Copy source
COPY frontend ./

# Fix permissions
RUN chmod -R 755 node_modules/.bin

# Build
RUN npm run build

# DEBUG - Verify build output
RUN echo "=== BUILD OUTPUT CHECK ===" && \
    ls -la && \
    echo "=== CHECKING FOR BUILD FOLDER ===" && \
    if [ -d "build" ]; then \
        echo "✅ build/ folder exists"; \
        ls -la build/; \
    else \
        echo "❌ build/ folder NOT found"; \
    fi && \
    if [ -d "dist" ]; then \
        echo "✅ dist/ folder exists"; \
        ls -la dist/; \
    else \
        echo "❌ dist/ folder NOT found"; \
    fi

# ---------- Stage 2: Production ----------
FROM node:18-slim

WORKDIR /app

# Install nginx and tools
RUN apt-get update && \
    apt-get install -y nginx gettext-base && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /run/nginx /var/log/nginx

# Install backend
COPY backend ./backend
RUN cd backend && npm install --omit=dev

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template

# Copy frontend build (try both build and dist)
COPY --from=build /app/build /usr/share/nginx/html

# Verify frontend was copied
RUN echo "=== FRONTEND FILES CHECK ===" && \
    ls -la /usr/share/nginx/html/ && \
    if [ -f "/usr/share/nginx/html/index.html" ]; then \
        echo "✅ index.html found"; \
    else \
        echo "❌ index.html NOT found - FRONTEND MISSING!"; \
        exit 1; \
    fi

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
export PORT=${PORT:-10000}\n\
echo "==> Services starting (nginx: $PORT, backend: 5000)"\n\
echo "==> Frontend files:"\n\
ls -la /usr/share/nginx/html/ | head -10\n\
envsubst '"'"'$PORT'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf\n\
echo "==> Starting backend..."\n\
cd /app/backend && PORT=5000 node src/server.js &\n\
sleep 3\n\
echo "==> Starting nginx..."\n\
exec nginx -g "daemon off;"\n' > /start.sh && \
chmod +x /start.sh

CMD ["/start.sh"]
