# ========== Stage 1: Build Frontend ==========
FROM node:18 AS frontend-build

WORKDIR /frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps || npm install

# Copy source and build
COPY frontend ./
RUN chmod -R 755 node_modules/.bin || true
RUN npm run build

# Verify build succeeded
RUN echo "=== Checking build output ===" && \
    ls -la && \
    if [ -d "build" ]; then \
        echo "✅ build/ exists"; \
        ls -la build/ | head -20; \
        test -f build/index.html && echo "✅ index.html found" || (echo "❌ NO index.html!" && exit 1); \
    else \
        echo "❌ NO build/ folder!" && exit 1; \
    fi

# ========== Stage 2: Production ==========
FROM node:18-slim

WORKDIR /app

# Install nginx and tools
RUN apt-get update && \
    apt-get install -y nginx gettext-base && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /run/nginx /var/log/nginx /usr/share/nginx/html

# Setup backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend ./backend

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template

# Copy frontend build from previous stage
COPY --from=frontend-build /frontend/build /usr/share/nginx/html

# Verify frontend was copied successfully
RUN echo "=== Verifying frontend in production ===" && \
    ls -la /usr/share/nginx/html && \
    test -f /usr/share/nginx/html/index.html && echo "✅ Frontend copied successfully" || \
    (echo "❌ Frontend copy FAILED!" && exit 1)

# Create startup script
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
export PORT=${PORT:-10000}\n\
echo "==> Configuration: nginx on $PORT, backend on 5000"\n\
\n\
# Generate nginx config\n\
envsubst '"'"'$PORT'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf\n\
echo "==> Nginx config generated"\n\
\n\
# Verify frontend files\n\
echo "==> Frontend files:"\n\
ls -la /usr/share/nginx/html | head -10\n\
\n\
# Start backend\n\
echo "==> Starting backend on port 5000..."\n\
cd /app/backend && PORT=5000 node src/server.js &\n\
BACKEND_PID=$!\n\
echo "    Backend PID: $BACKEND_PID"\n\
\n\
# Wait for backend\n\
sleep 3\n\
\n\
# Start nginx\n\
echo "==> Starting nginx on port $PORT..."\n\
nginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
