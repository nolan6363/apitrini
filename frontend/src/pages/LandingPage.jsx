import React from 'react';
import {useNavigate} from 'react-router-dom';  // Ajout de l'import pour la navigation
import {Clock, ChartBar, Award, Users, ArrowRight} from 'lucide-react';
import demoImage from '@/assets/img/demonstration_ia.jpg'

const LandingPage = () => {
    // Initialisation du hook de navigation
    const navigate = useNavigate();
    return (
        <main className="w-full overflow-hidden bg-stone-50">
            {/* Hero Section avec un design plus subtil */}
            <div className="relative min-h-screen flex items-center">
                {/* Arrière-plan subtil */}
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-amber-50 overflow-hidden">
                    <div
                        className="absolute w-96 h-96 bg-amber-100 rounded-full blur-3xl -top-20 -left-20 opacity-20"></div>
                    <div
                        className="absolute w-96 h-96 bg-stone-100 rounded-full blur-3xl bottom-20 right-20 opacity-20"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div
                                className="inline-flex items-center px-4 py-2 bg-stone-900 bg-opacity-5 rounded-full text-stone-900 text-sm">
                                <span className="bg-stone-900 text-stone-50 px-3 py-1 rounded-full mr-2">Nouveau</span>
                                Intelligence Artificielle pour l'Apiculture
                            </div>

                            <h1 className="text-6xl lg:text-7xl font-bold text-stone-900 leading-tight">
                                Comptage Intelligent des Varroas
                            </h1>

                            <p className="text-xl text-stone-700 leading-relaxed">
                                Une solution moderne qui transforme 15 minutes de comptage en quelques secondes, pour un
                                meilleur suivi de vos colonies.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => navigate('/varroa')}
                                    className="group inline-flex items-center bg-stone-900 px-8 py-4 rounded-lg text-lg font-semibold text-stone-50 hover:bg-stone-800 transition-all duration-300"
                                >
                                    Démarrer maintenant
                                    <ArrowRight
                                        className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                                </button>

                                <button
                                    onClick={() => navigate('/about')}
                                    className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold text-stone-900 border-2 border-stone-900 hover:bg-stone-900 hover:text-stone-50 transition-all duration-300"
                                >
                                    En savoir plus
                                </button>
                            </div>
                        </div>

                        {/* Image avec design épuré */}
                        <div className="relative">
                            <div className="relative bg-white p-8 rounded-lg shadow-md">
                                <div className="aspect-ratio-16/9 w-full overflow-hidden rounded-lg shadow-sm">
                                    <img
                                        src={demoImage}
                                        alt="Démonstration IA"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Statistiques avec meilleur contraste */}
                                <div className="absolute -right-4 top-1/4 bg-stone-900 p-4 rounded-lg shadow-lg">
                                    <div className="text-3xl font-bold text-stone-50">95%</div>
                                    <div className="text-sm text-stone-200">Précision</div>
                                </div>

                                <div className="absolute -left-4 bottom-1/4 bg-stone-900 p-4 rounded-lg shadow-lg">
                                    <div className="text-3xl font-bold text-stone-50">&lt;10s</div>
                                    <div className="text-sm text-stone-200">Par analyse</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Caractéristiques avec design minimaliste */}
            <div className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-stone-900">Une Solution Innovante</h2>
                        <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                            Optimisez votre temps et améliorez la santé de vos colonies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Clock,
                                title: "Gain de Temps Significatif",
                                description: "Réduisez drastiquement le temps consacré au comptage des varroas"
                            },
                            {
                                icon: ChartBar,
                                title: "Précision Optimale",
                                description: "Bénéficiez d'une précision de 95% grâce à notre modèle d'IA"
                            },
                            {
                                icon: Award,
                                title: "Suivi Sanitaire Efficace",
                                description: "Prenez des décisions éclairées pour la santé de vos colonies"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="group">
                                <div
                                    className="p-8 bg-stone-50 rounded-lg hover:shadow-md transition-shadow duration-300">
                                    <div
                                        className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-stone-900 text-stone-50 mb-6">
                                        <feature.icon className="w-8 h-8"/>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4 text-stone-900">{feature.title}</h3>
                                    <p className="text-stone-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section Partenaires avec design épuré */}
            <div className="py-24 bg-stone-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-stone-900">Nos Partenaires</h2>
                        <p className="text-xl text-stone-600">Une collaboration avec des experts reconnus</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12">
                        {[
                            {
                                name: "LMGE",
                                description: "Laboratoire de Microorganismes : Génome et Environnement",
                                type: "Recherche scientifique"
                            },
                            {
                                name: "GDSA63",
                                description: "Groupement de Défense Sanitaire Apicole",
                                type: "Organisation sanitaire"
                            }
                        ].map((partner, index) => (
                            <div key={index} className="group">
                                <div
                                    className="p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="text-center">
                                        <div
                                            className="w-24 h-24 bg-stone-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                                            <Users className="w-12 h-12 text-stone-900"/>
                                        </div>
                                        <h3 className="text-2xl font-semibold mb-2 text-stone-900">{partner.name}</h3>
                                        <p className="text-stone-600 mb-2">{partner.description}</p>
                                        <p className="text-sm text-amber-700 font-medium">{partner.type}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Final avec design minimaliste */}
            <div className="relative py-24 bg-stone-900">
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-stone-50 mb-6">
                        Prêt à Améliorer Votre Suivi Sanitaire ?
                    </h2>
                    <p className="text-xl text-stone-300 mb-8">
                        Rejoignez les apiculteurs qui ont déjà modernisé leur approche
                    </p>
                    <button
                        className="group inline-flex items-center bg-stone-50 px-8 py-4 rounded-lg text-lg font-semibold text-stone-900 hover:bg-white transition-all duration-300">
                        Commencer gratuitement
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
        </main>
    );
};

export default LandingPage;