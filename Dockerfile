# ---------- Stage 1: Build Frontend ----------
FROM node:18 AS build

WORKDIR /app

# Copy package files and install
COPY frontend/package*.json ./
RUN npm install

# Copy source
COPY frontend ./

# FIX PERMISSIONS before building!
RUN chmod -R 755 node_modules/.bin

# Now build
RUN npm run build

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

# Copy nginx config and frontend build
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=build /app/build /usr/share/nginx/html

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
export PORT=${PORT:-10000}\n\
echo "==> Configuring services (nginx: $PORT, backend: 5000)"\n\
envsubst '"'"'$PORT'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf\n\
echo "==> Starting backend on port 5000..."\n\
cd /app/backend && PORT=5000 node src/server.js &\n\
sleep 3\n\
echo "==> Starting nginx on port $PORT..."\n\
exec nginx -g "daemon off;"\n' > /start.sh && \
chmod +x /start.sh

CMD ["/start.sh"]
