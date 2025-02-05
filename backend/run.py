import sys
from pathlib import Path

# Cette ligne permet à Python de trouver notre package apitrini
# Elle ajoute le dossier parent (qui contient apitrini) au chemin de recherche Python
sys.path.append(str(Path(__file__).parent))

from apitrini import create_app

# Création de l'instance de l'application
app = create_app()

# Ces variables d'environnement peuvent être définies dans un fichier dev.env
# ou directement dans votre environnement
app.config.update(
    # Active le mode debug pour voir les erreurs en détail pendant le développement
    DEBUG=True,
    # Le port sur lequel votre API sera accessible
    PORT=5000,
    # L'hôte sur lequel votre API écoutera
    HOST='0.0.0.0'
)

# Ce bloc ne s'exécute que si on lance directement ce fichier
# Il ne s'exécute pas si le fichier est importé
if __name__ == '__main__':
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )