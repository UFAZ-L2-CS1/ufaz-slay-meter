# ---------- Stage 1: Build React App ----------
FROM node:18-bullseye AS build
WORKDIR /app

# Paketləri kopyala və quraşdır
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Qalan frontend fayllarını kopyala
COPY frontend/ ./

# react-scripts üçün icazə düzəlt
RUN chmod +x node_modules/.bin/* || true

# Build əməliyyatı
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Build nəticələrini kopyala
COPY --from=build /app/build .

# Öz Nginx konfiqurasiyanı əlavə et
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 808
CMD ["nginx", "-g", "daemon off;"]
