import React, {useEffect, useState} from "react";

const ApiaryCard = ({apiary}) => {
    return (
        <div className="w-64 h-40 border-2 m-1 p-4 border-blue-500 rounded-lg hover:shadow-lg transition-shadow">
            <p className="font-bold text-lg mb-2">{apiary.name}</p>
            <p className="text-gray-600">{apiary.localisation}</p>
            <p className="mt-2">{apiary.hiveNumber} ruches</p>
        </div>
    );
}

function ApiaryList() {
    const [apiaries, setApiaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApiaryData();
    }, []);

    const fetchApiaryData = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Non authentifié');
        }

        const response = await fetch("http://localhost:5000/api/hives/get_apiary_list", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setApiaries(data);
    } catch (err) {
        setError(err.message);
        if (err.message === 'Non authentifié') {
            // Rediriger vers la page de connexion
            window.location.href = '/login';
        }
    } finally {
        setLoading(false);
    }
}

    if (loading) {
        return <div className="p-4">Chargement...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Erreur: {error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Mes Ruchers</h1>
            <div className="flex flex-wrap mt-4">
                {apiaries.length > 0 ? (
                    apiaries.map((apiary) => (
                        <ApiaryCard
                            key={apiary.id}
                            apiary={apiary}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">Aucun rucher trouvé</p>
                )}
            </div>
        </div>
    );
}

export default ApiaryList;