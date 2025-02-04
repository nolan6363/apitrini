#!/bin/bash

# Attente pour s'assurer que Nginx est bien démarré
sleep 5

# Configuration du certificat SSL
certbot --nginx \
    --email votre@email.com \
    --agree-tos \
    --no-eff-email \
    --domains apitrini.fr \
    --non-interactive

# Configuration du renouvellement automatique
echo "0 0,12 * * * certbot renew --quiet" | crontab -

# Démarrage de crond pour gérer les renouvellements automatiques
crond