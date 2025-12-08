# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy və install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source və build et
COPY frontend ./
RUN npm run build

# ---------- Stage 2: Run Backend + Nginx ----------
FROM node:18-alpine
WORKDIR /app

# Backend fayllarını kopyala və dependency quraşdır
COPY backend ./backend
RUN cd backend && npm install --omit=dev

# Nginx və gettext quraşdır
RUN apk add --no-cache nginx gettext

# Nginx üçün lazımi qovluqları yarat
RUN mkdir -p /var/log/nginx /run/nginx /etc/nginx/conf.d

# Nginx config template kopyala
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template

# Frontend build output kopyala (React default: /app/build)
COPY --from=build /app/build /usr/share/nginx/html

# Startup script yarat
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Render PORT-dan istifadə et (default: 10000)' >> /start.sh && \
    echo 'export PORT=${PORT:-10000}' >> /start.sh && \
    echo 'echo "==> Configuration: nginx on port $PORT, backend on port 5000"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Nginx config-də $PORT-u əvəz et' >> /start.sh && \
    echo 'envsubst '\''$PORT'\'' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'echo "==> Nginx configuration generated"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Backend-i başlat (port 5000)' >> /start.sh && \
    echo 'echo "==> Starting backend on port 5000..."' >> /start.sh && \
    echo 'cd /app/backend && PORT=5000 node src/server.js &' >> /start.sh && \
    echo 'BACKEND_PID=$!' >> /start.sh && \
    echo 'echo "==> Backend started with PID $BACKEND_PID"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Backend başlasın deyə gözlə' >> /start.sh && \
    echo 'sleep 3' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Nginx-i başlat' >> /start.sh && \
    echo 'echo "==> Starting nginx on port $PORT..."' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
