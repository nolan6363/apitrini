FROM nginx:alpine

# Installer les outils nécessaires
# net-tools fournit les commandes réseau de base comme netstat
# procps fournit des commandes comme ps et pkill pour la gestion des processus
RUN apk add --no-cache \
    certbot \
    certbot-nginx \
    bash \
    net-tools \
    procps \
    curl

# Copier les fichiers de configuration
COPY init-config.conf /etc/nginx/init-config.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Définir le point d'entrée
ENTRYPOINT ["/entrypoint.sh"]