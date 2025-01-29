import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import SearchBar from "@/components/ui/SearchBar.jsx";
import {API_URL} from "@/config/api.js";

const HiveCard = ({hive}) => {
    return (
        <div className="w-64 h-40 border-2 m-1 p-4 border-blue-500 rounded-lg hover:shadow-lg transition-shadow">
            <p className="font-bold text-lg mb-2">{hive.name}</p>
            <p className="text-gray-600">Créé le : {new Date(hive.createdAt).toLocaleDateString()}</p>
        </div>
    );
}

const HiveList = () => {
    const {apiaryId} = useParams();
    const [apiaryData, setApiaryData] = useState({
        apiary: null,
        hives: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const navigate = useNavigate();

    const fetchHiveData = async (search = '', sort = 'name') => {
        try {
            const token = localStorage.getItem('token');

            // Vérification du token
            if (!token) {
                setError('Veuillez vous connecter pour accéder à vos ruches');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            setLoading(true);
            const response = await fetch(`${API_URL}/api/hives/get_hive_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apiaryId: apiaryId,
                    search: search,
                    sort: sort
                })
            });

            if (response.status === 401) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des ruches');
            }

            const data = await response.json();
            setApiaryData({
                apiary: {
                    id: data.apiary_id,
                    name: data.apiary_name
                },
                hives: data.hives || []
            });
            setError(null);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Session expirée') || err.message.includes('connecter')) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    }

    // Effet pour le debounce de la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    // Effet pour faire la requête API
    useEffect(() => {
        fetchHiveData(debouncedSearch, sortOption);
    }, [debouncedSearch, sortOption, apiaryId]);

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleSort = (option) => {
        setSortOption(option);
    };

    if (loading && !apiaryData.hives.length) {
        return <div className="p-4">Chargement des ruches...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/apiaries')}
                        className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
                    >
                        <span className="mr-2">←</span>
                        Retour aux ruchers
                    </button>
                    <h1 className="text-2xl font-bold">{apiaryData.apiary?.name}</h1>
                </div>
                <button
                    onClick={() => navigate(`/hives/add/${apiaryId}`)}
                    className="px-4 py-2 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Ajouter une ruche
                </button>
            </div>

            <SearchBar
                onSearch={handleSearch}
                onSort={handleSort}
                currentSort={sortOption}
                searchPlaceholder="Filtrer les ruches..."
                sortOptions={[
                    {value: 'name', label: 'Nom'},
                    {value: 'date', label: 'Date'}
                ]}
            />

            <div className="flex flex-wrap mt-4">
                {apiaryData.hives.length > 0 ? (
                    apiaryData.hives.map((hive) => (
                        <HiveCard
                            key={hive.id}
                            hive={hive}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">Aucune ruche trouvée</p>
                )}
            </div>
        </div>
    );
}

export default HiveList;