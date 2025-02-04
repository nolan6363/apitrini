#!/bin/bash

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    netstat -tln | grep -q ":${port} "
    return $?
}

# Fonction pour attendre que les ports soient libres
wait_for_ports() {
    local timeout=30
    local count=0
    echo "Attente de la libération des ports 80 et 443..."
    while [ $count -lt $timeout ]; do
        if ! check_port 80 && ! check_port 443; then
            echo "Les ports sont libres"
            return 0
        fi
        sleep 1
        count=$((count + 1))
        if [ $((count % 5)) -eq 0 ]; then
            echo "Toujours en attente... ($count secondes)"
        fi
    done
    echo "Timeout en attendant la libération des ports"
    return 1
}

# Fonction pour gérer l'arrêt gracieux
cleanup() {
    echo "Arrêt des services..."
    if [ -f /var/run/nginx.pid ]; then
        nginx -s quit
    fi
    exit 0
}

# Mettre en place le gestionnaire de signal
trap cleanup SIGTERM SIGINT

# Copier la configuration initiale
cp /etc/nginx/init-config.conf /etc/nginx/nginx.conf

# Créer le répertoire pour le challenge ACME
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R nginx:nginx /var/www/html

# S'assurer que nginx n'est pas en cours d'exécution
if [ -f /var/run/nginx.pid ]; then
    echo "Arrêt de l'instance Nginx existante..."
    nginx -s quit
    wait_for_ports || { echo "Impossible d'arrêter l'instance Nginx existante"; exit 1; }
fi

# Obtenir/renouveler le certificat
echo "Démarrage du processus de certification..."
certbot --nginx \
    --email nolan.bayon@gmail.com \
    --agree-tos \
    --no-eff-email \
    --domains apitrini.fr \
    --redirect \
    --non-interactive \
    --post-hook "nginx -s quit" \
    --deploy-hook "nginx -s quit"

# Vérifier le statut de certbot
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'obtention du certificat"
    exit 1
fi

# Configurer le renouvellement automatique
echo "Configuration du renouvellement automatique..."
echo "0 0,12 * * * certbot renew --quiet --post-hook 'nginx -s quit'" | crontab -

# Démarrer crond en arrière-plan
echo "Démarrage de crond..."
crond &

# Attendre que les ports soient disponibles une dernière fois
wait_for_ports || { echo "Les ports ne sont pas disponibles pour le démarrage final"; exit 1; }

# Démarrer nginx au premier plan
echo "Démarrage de Nginx..."
exec nginx -g 'daemon off;'