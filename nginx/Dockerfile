FROM nginx:alpine

# Installation de certbot et du plugin nginx
RUN apk add --no-cache certbot certbot-nginx bash

# Copie de la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Création du script d'initialisation SSL
COPY init-ssl.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/init-ssl.sh