import React, {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {API_URL} from "@/config/api.js";
import SearchBar from "@/components/ui/SearchBar.jsx";

const ApiaryCard = ({apiary}) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/hives/${apiary.id}`);
    };

    return (
        <div className="w-64 h-40 border-2 m-1 p-4 border-blue-500 rounded-lg hover:shadow-lg transition-shadow"
             onClick={handleClick}>
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

    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();  // Ajout pour la redirection

    const fetchApiaryData = async (search = '', sort = 'name') => {
        try {
            const token = localStorage.getItem('token');

            // Vérification du token
            if (!token) {
                setError('Veuillez vous connecter pour accéder à vos ruchers');
                setTimeout(() => {
                    navigate('/login');  // Redirection vers la page de login après 2 secondes
                }, 2000);
                return;
            }

            setLoading(true);
            const response = await fetch(`${API_URL}/api/hives/get_apiary_list`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search: search,
                    sort: sort
                })
            });

            if (response.status === 401) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des ruchers');
            }

            const data = await response.json();
            setApiaries(data);
            setError(null);  // Réinitialisation de l'erreur en cas de succès
        } catch (err) {
            setError(err.message);
            // Si c'est une erreur d'authentification, rediriger vers la page de login
            if (err.message.includes('Session expirée') || err.message.includes('connecter')) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Effet pour le debounce de la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300); // Attend 300ms après la dernière frappe

        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    // Effet pour faire la requête API
    useEffect(() => {
        fetchApiaryData(debouncedSearch, sortOption);
    }, [debouncedSearch, sortOption]); // Utilise debouncedSearch au lieu de searchTerm

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleSort = (option) => {
        setSortOption(option);
    };

    if (loading && !apiaries.length) return <div className="p-4">Chargement des ruchers...</div>;
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
            <div className="flex justify-between w-full">
                <h1 className="text-2xl font-bold mb-4 m-1">Mes Ruchers</h1>
                <button
                    onClick={() => navigate('/apiaries/add')}
                    className="px-4 py-2 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Ajouter un rucher
                </button>
            </div>
            <SearchBar
                onSearch={handleSearch}
                onSort={handleSort}
                currentSort={sortOption}
                searchPlaceholder="Filtrer les ruchers..."
                sortOptions={[
                    {value: 'name', label: 'Nom'},
                    {value: 'date', label: 'Date'},
                    {value: 'location', label: 'Emplacement'}
                ]}
            />
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