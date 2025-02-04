#!/bin/bash

# Fonction pour s'assurer que les ports sont libres
ensure_ports_are_free() {
    # Vérifier si quelque chose utilise les ports 80 et 443
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null || lsof -Pi :443 -sTCP:LISTEN -t >/dev/null; then
        echo "Arrêt des processus utilisant les ports 80 et 443..."
        # Tuer tout processus utilisant ces ports
        lsof -ti:80,443 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Fonction pour démarrer Nginx proprement
start_nginx() {
    # S'assurer qu'aucun processus nginx n'est en cours
    pkill nginx || true
    sleep 2

    # Vérifier la configuration
    nginx -t || exit 1

    # Démarrer Nginx
    nginx

    # Vérifier si Nginx a démarré correctement
    sleep 2
    if ! pgrep nginx >/dev/null; then
        echo "Erreur: Nginx n'a pas démarré correctement"
        exit 1
    fi
}

# Copier la configuration initiale
cp /etc/nginx/init-config.conf /etc/nginx/nginx.conf

# Créer le répertoire pour le challenge ACME
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R nginx:nginx /var/www/html

# S'assurer que les ports sont libres
ensure_ports_are_free

# Démarrer Nginx proprement
start_nginx

# Obtenir le certificat
certbot --nginx \
    --email nolan.bayon@gmail.com \
    --agree-tos \
    --no-eff-email \
    --domains apitrini.fr \
    --redirect \
    --non-interactive

# Configurer le renouvellement automatique
echo "0 0,12 * * * certbot renew --quiet" | crontab -

# Démarrer crond en arrière-plan
crond &

# S'assurer encore une fois que les ports sont libres
ensure_ports_are_free

# Démarrer Nginx en premier plan avec la nouvelle configuration
exec nginx -g 'daemon off;'