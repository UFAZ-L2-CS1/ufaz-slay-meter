# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy and install frontend dependencies
COPY frontend/package*.json ./ 
RUN npm install

# Copy frontend code and build
COPY frontend ./ 
RUN chmod +x node_modules/.bin/* || true
RUN npm run build

# ---------- Stage 2: Run Backend + Nginx ----------
FROM node:18-alpine
WORKDIR /app

# Copy backend files and install dependencies
COPY backend ./backend
RUN cd backend && npm install --omit=dev

# Install nginx and gettext (for envsubst)
RUN apk add --no-cache nginx gettext

# Create necessary nginx directories
RUN mkdir -p /var/log/nginx /run/nginx /etc/nginx/conf.d

# Copy nginx config as template and frontend build
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Get PORT from Render (defaults to 10000 for local testing)' >> /start.sh && \
    echo 'export PORT=${PORT:-10000}' >> /start.sh && \
    echo 'echo "==> Port Configuration: Nginx will listen on $PORT"' >> /start.sh && \
    echo 'echo "==> Backend will run on port 5000 (internal)"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Replace $PORT in nginx config template' >> /start.sh && \
    echo 'envsubst '\''$PORT'\'' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'echo "==> Nginx config generated"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start backend on port 5000' >> /start.sh && \
    echo 'echo "==> Starting Node.js backend on port 5000..."' >> /start.sh && \
    echo 'cd /app/backend && PORT=5000 node src/server.js &' >> /start.sh && \
    echo 'BACKEND_PID=$!' >> /start.sh && \
    echo 'echo "==> Backend started with PID $BACKEND_PID"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Wait for backend to initialize' >> /start.sh && \
    echo 'echo "==> Waiting 3 seconds for backend to initialize..."' >> /start.sh && \
    echo 'sleep 3' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start nginx' >> /start.sh && \
    echo 'echo "==> Starting Nginx on port $PORT..."' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
