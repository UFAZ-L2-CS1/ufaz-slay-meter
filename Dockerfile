# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy və install frontend dependencies
COPY frontend/package*.json ./ 
RUN npm install

# Copy qalan frontend kodu və build et
COPY frontend ./ 
RUN chmod +x node_modules/.bin/* || true
RUN npm run build

# ---------- Stage 2: Run Backend + Nginx ----------
FROM node:18-alpine
WORKDIR /app

# Backend fayllarını kopyala və dependency quraşdır
COPY backend ./backend
RUN cd backend && npm install --omit=dev

# Nginx quraşdır
RUN apk add --no-cache nginx

# Nginx config və frontend build output kopyala
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Port aç
EXPOSE 808

# Həm backend, həm Nginx-i eyni anda başlat
CMD sh -c "node backend/server.js & nginx -g 'daemon off;'"
