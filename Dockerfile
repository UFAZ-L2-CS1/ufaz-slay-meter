# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy və install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source və build et
COPY frontend ./frontend
RUN cd frontend && npm run build

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

# Nginx config və frontend build output kopyala
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
# ⚡ DİQQƏT: build mərhələsində /app/frontend/build deyil, /app/frontend/build-dən gəlir
COPY --from=build /app/frontend/build /usr/share/nginx/html

# Startup script yarat
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo 'export PORT=${PORT:-10000}' >> /start.sh && \
    echo 'echo "==> Backend starting on port 5000, nginx on $PORT"' >> /start.sh && \
    echo 'envsubst '\''$PORT'\'' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'cd /app/backend && PORT=5000 node src/server.js &' >> /start.sh && \
    echo 'sleep 3' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
