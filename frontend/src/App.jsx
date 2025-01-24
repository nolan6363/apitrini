import { useState } from 'react'

function App() {
    const [count, setCount] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/health');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Container principal avec un dégradé de fond subtil et une hauteur plein écran
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Conteneur central avec une largeur maximale pour la lisibilité */}
            <div className="max-w-3xl mx-auto">
                {/* En-tête avec un titre élégant */}
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 tracking-tight">
                    Apitrini
                </h1>

                {/* Carte principale avec ombre et bordure arrondie */}
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Bouton de test avec états de hover et disabled */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleClick}
                            disabled={loading}
                            className={`
                                px-6 py-3 rounded-md text-sm font-medium
                                transition-colors duration-200
                                ${loading 
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }
                            `}
                        >
                            {loading ? 'Chargement...' : 'Tester la connexion au backend'}
                        </button>
                    </div>

                    {/* États de chargement, erreur et données avec animations subtiles */}
                    {loading && (
                        <p className="text-gray-600 text-center animate-pulse">
                            Chargement en cours...
                        </p>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-red-700">
                                Erreur : {error}
                            </p>
                        </div>
                    )}

                    {data && (
                        <div className="bg-gray-50 rounded-md p-4 overflow-auto">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(data["message"], null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App