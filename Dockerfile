# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy frontend dependencies
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy və build
COPY frontend/ ./
RUN npm run build


# ---------- Stage 2: Run Backend + Nginx ----------
FROM node:18-alpine AS runtime
WORKDIR /app

# Backend üçün lazımi faylları kopyala
COPY backend ./backend
RUN cd backend && npm install --omit=dev

# Nginx quraşdır
RUN apk add --no-cache nginx

# Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Build edilmiş frontend fayllarını Nginx root-a kopyala
COPY --from=build /app/frontend/build /usr/share/nginx/html

# Portlar
EXPOSE 808

# CMD ilə həm backend-i, həm Nginx-i eyni anda işə salmaq
CMD sh -c "node backend/server.js & nginx -g 'daemon off;'"
