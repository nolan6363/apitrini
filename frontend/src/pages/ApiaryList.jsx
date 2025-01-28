import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { API_URL } from "@/config/api.js";
import SearchBar from "@/components/ui/SearchBar.jsx";

const ApiaryCard = ({ apiary }) => {
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

    const fetchApiaryData = async (search = '', sort = 'name') => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
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

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des ruchers');
            }

            const data = await response.json();
            setApiaries(data);
        } catch (err) {
            setError(err.message);
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
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 m-1">Mes Ruchers</h1>
            <SearchBar onSearch={handleSearch} onSort={handleSort} />
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