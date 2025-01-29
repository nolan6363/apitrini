import React, {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {API_URL} from "@/config/api.js";
import { Trash2 } from 'lucide-react';
import SearchBar from "@/components/ui/SearchBar.jsx";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal.jsx";

const ApiaryCard = ({ apiary, onDelete }) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCardClick = (e) => {
        // Empêcher la navigation si on clique sur le bouton de suppression
        if (e.target.closest('.delete-button')) return;
        navigate(`/apiary/${apiary.id}`);
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/hives/delete_apiary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ apiaryId: apiary.id })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du rucher');
            }

            onDelete(apiary.id);
            setShowDeleteModal(false);

        } catch (error) {
            console.error('Erreur:', error);
            // Vous pourriez vouloir gérer l'erreur différemment ici
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="w-64 h-40 m-2 p-4 bg-white rounded-lg hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={handleCardClick}
            >
                <button
                    className="delete-button absolute top-2 right-2 p-2 rounded-full hover:bg-red-100 text-red-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(true);
                    }}
                >
                    <Trash2 size={20} />
                </button>

                <p className="font-bold text-lg mb-2">{apiary.name}</p>
                <p className="text-gray-600">{apiary.localisation}</p>
                <p className="mt-2">{apiary.hiveNumber} ruches</p>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Supprimer le rucher ?"
                message={`Êtes-vous sûr de vouloir supprimer le rucher "${apiary.name}" ? Cette action supprimera également toutes les ruches associées et ne peut pas être annulée.`}
            />
        </>
    );
};

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
                            onDelete={(apiaryId) => {
                                setApiaries(apiaries.filter((a) => a.id !== apiaryId));
                            }}
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