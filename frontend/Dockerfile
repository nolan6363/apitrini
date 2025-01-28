FROM node:18-alpine

WORKDIR /frontend

# Installation de dépendances système qui peuvent aider avec le file watching
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# L'option --legacy-peer-deps reste importante pour la compatibilité
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

# La commande modifiée inclut des options importantes pour le HMR
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--force"]