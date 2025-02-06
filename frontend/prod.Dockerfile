# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production - Utilisation de nginx pour servir les fichiers statiques
FROM nginx:alpine
COPY --from=builder /frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]