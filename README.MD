# Apitrini - Une Solution Intelligente pour la Détection des Varroas

## À propos du Projet

Apitrini est une plateforme open source conçue pour aider les apiculteurs à surveiller et gérer l'infestation de varroas dans leurs ruches. En utilisant l'intelligence artificielle et plus précisément un modèle YOLO (You Only Look Once), Apitrini permet de compter automatiquement les varroas présents sur les langes à partir de simples photos.

Le varroa destructor est l'un des plus grands défis auxquels font face les apiculteurs aujourd'hui. Un comptage précis et régulier est essentiel pour maintenir des colonies saines. Apitrini vise à simplifier et automatiser ce processus chronophage tout en fournissant des données précises et exploitables.

## État du Projet

🚧 **En Développement Actif** 🚧

Actuellement, nous nous concentrons sur le développement et l'optimisation de la fonctionnalité principale : la détection automatique des varroas. Cette phase devrait s'étendre sur les trois prochains mois pour assurer une détection fiable et précise.

## Fonctionnalités

### Détection Automatique des Varroas
- Upload simple des photos de langes
- Détection en temps réel des varroas grâce à un modèle YOLO entraîné
- Comptage automatique des varroas détectés
- Visualisation des résultats avec mise en évidence des détections

## Installation

### Prérequis
- Docker et Docker Compose
- Git

### Installation Rapide

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/apitrini.git
cd apitrini

# Lancer l'application avec Docker Compose
docker compose -f docker-compose.prod.yml up -d --build
```

L'application sera accessible à l'adresse `http://localhost:5173`

## Comment Contribuer

Nous accueillons chaleureusement toute contribution à Apitrini ! Voici comment vous pouvez nous aider :

### Pour les Apiculteurs
- Testez l'application et partagez vos retours
- Fournissez des photos de langes pour enrichir notre dataset
- Partagez votre expertise sur les besoins spécifiques en matière de détection de varroas

### Pour les Développeurs
1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Priorités Actuelles
- Amélioration de la précision du modèle YOLO
- Optimisation des performances de détection
- Amélioration de l'interface utilisateur pour l'upload et la visualisation des résultats

## Feuille de Route

### Phase 1 - En Cours (3 mois)
- [x] Mise en place de l'infrastructure de base
- [x] Développement du modèle YOLO initial
- [ ] Interface utilisateur de base pour l'upload de photos
- [ ] Système de visualisation des résultats
- [ ] Tests et optimisation du modèle

### Phases Futures
- Système de gestion de rucher
- Conseils personnalisés basés sur la saison et la météo
- Statistiques et heatmaps
- Historique des traitements et opérations

## Licence

Ce projet est sous licence [MIT](LICENSE.md) - voir le fichier LICENSE.md pour plus de détails.

## Contact

Email - nolan.bayon@gmail.com

Lien du projet : [https://github.com/nolan6363/apitrini](https://github.com/votre-username/apitrini)

## Remerciements

Un grand merci à tous les apiculteurs qui contribuent à ce projet en fournissant des données et des retours précieux, ainsi qu'à la communauté open source qui rend ce projet possible.

---

<div align="center">
  <small>Fait avec ❤️ par et pour les apiculteurs</small>
</div>