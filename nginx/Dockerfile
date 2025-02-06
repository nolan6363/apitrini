FROM nginx:1.24.0

# Installer les outils nécessaires
RUN apt-get update && apt-get install -y \
    certbot \
    python3-certbot-nginx \
    bash \
    net-tools \
    procps \
    curl \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de configuration
COPY init-config.conf /etc/nginx/init-config.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN rm -rf ./nginx/letsencrypt/*

# Définir le point d'entrée
ENTRYPOINT ["/entrypoint.sh"]