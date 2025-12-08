# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies (use npm ci for faster, reliable installs)
RUN npm ci || npm install

# Copy all frontend source files
COPY frontend ./

# Build the React app
RUN npm run build

# ---------- Stage 2: Run Backend + Nginx ----------
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend ./backend

# Install nginx and gettext
RUN apk add --no-cache nginx gettext

# Create nginx directories
RUN mkdir -p /var/log/nginx /run/nginx /etc/nginx/conf.d

# Copy nginx config as template
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template

# Copy built frontend from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Verify frontend was copied
RUN ls -la /usr/share/nginx/html && \
    test -f /usr/share/nginx/html/index.html || (echo "❌ Frontend build failed!" && exit 1)

# Create startup script
RUN printf '#!/bin/sh\n\
set -e\n\
\n\
export PORT=${PORT:-10000}\n\
echo "==> Starting services..."\n\
echo "    - Nginx will listen on port $PORT"\n\
echo "    - Backend will run on port 5000"\n\
\n\
envsubst '"'"'$PORT'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf\n\
echo "==> Nginx config generated"\n\
\n\
echo "==> Starting backend..."\n\
cd /app/backend && PORT=5000 node src/server.js &\n\
BACKEND_PID=$!\n\
echo "    Backend PID: $BACKEND_PID"\n\
\n\
echo "==> Waiting for backend to initialize..."\n\
sleep 3\n\
\n\
echo "==> Starting nginx..."\n\
exec nginx -g "daemon off;"\n' > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
