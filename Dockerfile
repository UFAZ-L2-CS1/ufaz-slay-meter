# ---------- Stage 1: Build React Frontend ----------
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# ---------- Stage 2: Build Backend ----------
FROM node:18-alpine AS backend-build
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./

# ---------- Stage 3: Serve with Nginx ----------
FROM nginx:stable-alpine
WORKDIR /app

# Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Frontend build
COPY --from=frontend-build /frontend/build /usr/share/nginx/html

# Backend files
COPY --from=backend-build /backend /app/backend

# Node & npm əlavə et
RUN apk add --no-cache nodejs npm

# Backend dependencies quraşdır
WORKDIR /app/backend
RUN npm install --production

EXPOSE 808

# Backend və Nginx birlikdə işə salınır
CMD ["sh", "-c", "node server.js & nginx -g 'daemon off;'"]
