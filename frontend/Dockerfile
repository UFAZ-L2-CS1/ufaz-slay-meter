# ---------- Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install react-scripts@5.0.1 --legacy-peer-deps
COPY . .
# Əlavə sətir – react-scripts icazəsini düzəldir
RUN chmod +x node_modules/.bin/react-scripts
RUN npm run build

# ---------- Run stage ----------
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]

