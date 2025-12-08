# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./ 
RUN npm install
COPY frontend ./ 
RUN chmod +x node_modules/.bin/* || true
RUN npm run build

# ---------- Stage 2: Run Backend + Nginx ----------
FROM node:18-alpine
WORKDIR /app

COPY backend ./backend
RUN cd backend && npm install --omit=dev

RUN apk add --no-cache nginx gettext

# Create nginx directories
RUN mkdir -p /var/log/nginx /run/nginx /etc/nginx/conf.d

# Copy nginx config as template
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html

# Don't use EXPOSE - Render uses $PORT
# EXPOSE removed

# Startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'export PORT=${PORT:-10000}' >> /start.sh && \
    echo 'echo "Starting on port $PORT"' >> /start.sh && \
    echo 'envsubst '\''$PORT'\'' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'cd /app/backend && node src/server.js &' >> /start.sh && \
    echo 'sleep 3' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
