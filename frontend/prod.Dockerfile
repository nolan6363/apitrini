# Étape de build
FROM node:18-alpine as builder
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape de production - on ne garde que les fichiers buildés
FROM nginx:alpine
COPY --from=builder /frontend/dist /usr/share/nginx/html