import React from 'react';
import { Microscope, Users, ClipboardCheck, Brain } from 'lucide-react';

const AboutPage = () => {
  return (
    <main className="bg-stone-50 min-h-screen">
      {/* En-tête de la page */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">À Propos du Projet</h1>
          <p className="text-xl text-stone-200 max-w-3xl">
            Découvrez comment l'intelligence artificielle révolutionne le comptage des varroas pour une apiculture plus efficace et durable.
          </p>
        </div>
      </div>

      {/* Section Origine du Projet */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Origine et Développement</h2>
              <div className="prose prose-lg text-stone-600">
                <p>
                  Ce projet innovant a été développé au cours d'un stage au Laboratoire Microorganismes : Génome et Environnement (LMGE), conjuguant expertise scientifique et technologies de pointe pour répondre aux besoins des apiculteurs.
                </p>
                <p>
                  L'objectif était de créer un outil qui simplifierait significativement le processus de comptage des varroas, une tâche cruciale mais chronophage pour les apiculteurs. La solution développée permet de réduire le temps de comptage de 15 minutes à quelques secondes, tout en maintenant une précision remarquable.
                </p>
              </div>
            </div>
            <div className="bg-stone-50 p-8 rounded-2xl shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Microscope className="w-8 h-8 text-stone-900 mb-4" />
                  <h3 className="font-semibold text-stone-900">Recherche Scientifique</h3>
                  <p className="text-stone-600 mt-2">Collaboration étroite avec le LMGE</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Brain className="w-8 h-8 text-stone-900 mb-4" />
                  <h3 className="font-semibold text-stone-900">Intelligence Artificielle</h3>
                  <p className="text-stone-600 mt-2">Modèle de détection avancé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Méthodologie */}
      <div className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">Méthodologie et Validation</h2>
          <div className="prose prose-lg text-stone-600 max-w-4xl mx-auto">
            <p>
              Le développement du modèle s'est appuyé sur une vaste collection de données provenant de langes de ruches. Ces échantillons, soigneusement collectés et annotés, ont permis d'entraîner un système de détection robuste et précis.
            </p>
            <p>
              La validation du système a été réalisée en étroite collaboration avec le GDSA63 (Groupement de Défense Sanitaire Apicole). Les résultats obtenus par l'intelligence artificielle ont été systématiquement comparés aux comptages manuels effectués par des experts du GDSA63, permettant de confirmer la fiabilité du système avec une précision de 95%.
            </p>
          </div>
        </div>
      </div>

      {/* Section Avantages */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-900 mb-12 text-center">Avantages Clés</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-stone-50 p-8 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-stone-900 mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Précision Scientifique</h3>
              <p className="text-stone-600">
                95% de précision validée par des experts du domaine, garantissant des résultats fiables pour vos décisions sanitaires.
              </p>
            </div>
            <div className="bg-stone-50 p-8 rounded-xl">
              <Users className="w-8 h-8 text-stone-900 mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Support Professionnel</h3>
              <p className="text-stone-600">
                Soutenu par le GDSA63 et développé en collaboration avec le LMGE, assurant une approche scientifique rigoureuse.
              </p>
            </div>
            <div className="bg-stone-50 p-8 rounded-xl">
              <Brain className="w-8 h-8 text-stone-900 mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Technologie Innovante</h3>
              <p className="text-stone-600">
                Utilisation des dernières avancées en intelligence artificielle pour une détection rapide et précise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Perspectives */}
      <div className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-12 rounded-2xl">
            <h2 className="text-3xl font-bold mb-6">Perspectives d'Avenir</h2>
            <div className="prose prose-lg prose-invert">
              <p>
                Ce projet représente une avancée significative dans la modernisation des pratiques apicoles. En automatisant le comptage des varroas, nous permettons aux apiculteurs de consacrer plus de temps à d'autres aspects essentiels de leur activité.
              </p>
              <p>
                Le développement continu du système, soutenu par nos partenaires scientifiques et techniques, vise à intégrer de nouvelles fonctionnalités et à améliorer encore la précision des résultats, contribuant ainsi à la santé durable des colonies d'abeilles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;