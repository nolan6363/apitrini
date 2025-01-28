import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {API_URL} from "@/config/api.js";

const HiveCard = ({hive}) => {
    return (
        <div className="w-64 h-40 border-2 m-1 p-4 border-blue-500 rounded-lg hover:shadow-lg transition-shadow">
            <p className="font-bold text-lg mb-2">{hive.name}</p>
        </div>
    );
}

const HiveList = () => {
    const {apiaryId} = useParams();
    const [apiary, setApiary] = useState(null);
    const [hives, setHives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    let navigate = useNavigate();

    useEffect (() => {
        fetchHiveData();
    }, []);

    const fetchHiveData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch(`${API_URL}/api/hives/get_hive_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({apiaryId})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setHives(data.hives);
            setApiary(data.apiary);
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
        return <div className="p-4">Erreur: {error}</div>;
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">{apiary?.name}</h1>
                <button
                    onClick={() => navigate('/apiaries')}
                    className="mr-4 text-blue-500 hover:text-blue-700"
                >
                    ← Retour aux ruchers
                </button>
            </div>
            <div className="flex flex-wrap mt-4">
                {hives.length > 0 ? (
                    hives.map((hive) => (
                        <HiveCard
                            key={hive.id}
                            hive={hive}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">Aucun rucher trouvé</p>
                )}
            </div>
        </div>
    );
}

export default HiveList;