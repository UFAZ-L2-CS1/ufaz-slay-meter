# ---------- Stage 1: Build React App ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json və package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy bütün frontend faylları
COPY frontend ./

# Fix icazə problemi (renderdə olur bəzən)
RUN chmod +x node_modules/.bin/* || true

# Build React app (çıxış qovluğu: build/)
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# React build fayllarını Nginx-ə kopyalayırıq
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 808
CMD ["nginx", "-g", "daemon off;"]
