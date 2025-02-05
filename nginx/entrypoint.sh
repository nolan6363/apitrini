#!/bin/bash

# Fonction pour tuer tous les processus Nginx
kill_nginx() {
    echo "Arrêt de tous les processus Nginx..."
    # Utiliser pkill avec force (-9) si nécessaire
    pkill nginx
    sleep 2
    pkill -9 nginx 2>/dev/null || true
    sleep 1
}

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    netstat -tln | grep -q ":${port} "
    return $?
}

# Fonction pour attendre que les ports soient libres
wait_for_ports() {
    local timeout=10  # Réduit à 10 secondes car nous sommes plus agressifs maintenant
    local count=0
    echo "Vérification des ports 80 et 443..."
    while [ $count -lt $timeout ]; do
        if ! check_port 80 && ! check_port 443; then
            echo "Les ports sont libres"
            return 0
        fi
        if [ $count -eq 5 ]; then
            echo "Les ports sont toujours occupés, tentative de libération forcée..."
            kill_nginx
        fi
        sleep 1
        count=$((count + 1))
    done
    echo "Impossible de libérer les ports"
    return 1
}

# Fonction pour gérer l'arrêt gracieux
cleanup() {
    echo "Arrêt des services..."
    kill_nginx
    exit 0
}

# Mettre en place le gestionnaire de signal
trap cleanup SIGTERM SIGINT

# Configuration initiale
echo "Configuration initiale..."
cp /etc/nginx/init-config.conf /etc/nginx/nginx.conf
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R nginx:nginx /var/www/html

# S'assurer qu'aucun processus nginx n'est en cours
kill_nginx
wait_for_ports

# Obtenir le certificat
echo "Démarrage du processus de certification..."
certbot --nginx \
    --email nolan.bayon@gmail.com \
    --agree-tos \
    --no-eff-email \
    -d apitrini.fr, varroa.apitrini.fr, api.apitrini.fr\
    --redirect \
    --non-interactive

# S'assurer que tout processus Nginx est arrêté après Certbot
kill_nginx
wait_for_ports || { echo "Impossible de libérer les ports après certbot"; exit 1; }

# Configurer le renouvellement automatique
echo "Configuration du renouvellement automatique..."
echo "0 0,12 * * * certbot renew --quiet --post-hook 'pkill nginx'" | crontab -

# Démarrer crond en arrière-plan
echo "Démarrage de crond..."
crond &

# Vérifier la configuration Nginx avant le démarrage final
echo "Vérification de la configuration Nginx..."
nginx -t || { echo "La configuration Nginx est invalide"; exit 1; }

# Démarrer Nginx au premier plan
echo "Démarrage de Nginx..."
exec nginx -g 'daemon off;'