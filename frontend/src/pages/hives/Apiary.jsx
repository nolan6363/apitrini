import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import SearchBar from "@/components/ui/SearchBar.jsx";
import {API_URL} from "@/config/api.js";
import {Trash2, PencilIcon, Save, X} from "lucide-react";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal.jsx";

const ApiaryHeader = ({apiary, isEditing, onEdit, onSave, onCancel, onChange}) => {
    const handleSave = () => {
        const updateData = {
            name: apiary.name,
            description: apiary.description,
            location: apiary.location
        };
        onSave(updateData);
    };

    if (isEditing) {
        return (
            <div className="mb-4 mx-2 px-4 p-4 bg-white rounded-lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du rucher</label>
                        <input
                            type="text"
                            name="name"
                            value={apiary.name || ''}
                            onChange={onChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Localisation</label>
                        <input
                            type="text"
                            name="location"
                            value={apiary.location || ''}
                            onChange={onChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={apiary.description || ''}
                            onChange={onChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center"
                        >
                            <X size={16} className="mr-2"/>
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <Save size={16} className="mr-2"/>
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 mx-2 px-4 p-4 bg-white rounded-lg relative">
            <button
                onClick={onEdit}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
                <PencilIcon size={20}/>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
                {apiary.name}
                <span className="text-gray-500 text-lg ml-2">
                    ({apiary.hives.length} ruches)
                </span>
            </h1>
            {apiary.location && (
                <p className="text-gray-600 mt-2">📍 {apiary.location}</p>
            )}
            {apiary.description && (
                <p className="text-gray-600 mt-2">{apiary.description}</p>
            )}
        </div>
    );
};

const HiveCard = ({hive, onDelete}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        if (e.target.closest('.delete-button')) return;
        navigate(`/hive/${hive.id}`);
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/hives/delete_hive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({hiveId: hive.id})
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de la ruche');
            }

            onDelete(hive.id);
            setShowDeleteModal(false);

        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className="w-64 h-40 mx-2 p-4 bg-white rounded-lg hover:shadow-lg transition-shadow relative"
            >
                <button
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-100 text-red-500 delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(true);
                    }}
                >
                    <Trash2 size={20}/>
                </button>

                <p className="font-bold text-lg mb-2">{hive.name}</p>
                <p className="text-gray-600">
                    Créée le : {new Date(hive.createdAt).toLocaleDateString()}
                </p>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Supprimer la ruche ?"
                message={`Êtes-vous sûr de vouloir supprimer la ruche "${hive.name}" ? Cette action ne peut pas être annulée.`}
            />
        </>
    );
};

const Apiary = () => {
    const {apiaryId} = useParams();
    const [apiaryData, setApiaryData] = useState({
        apiary: null,
        hives: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const navigate = useNavigate();

    const fetchHiveData = async (search = '', sort = 'name') => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Veuillez vous connecter pour accéder à vos ruches');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            setLoading(true);
            const response = await fetch(`${API_URL}/api/hives/get_apiary_data`, {
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

            // Mise à jour de la structure des données pour inclure toutes les infos du rucher
            setApiaryData({
                apiary: {
                    id: data.apiary_id,
                    name: data.apiary_name,
                    location: data.apiary_location,
                    description: data.apiary_description,
                    hives: data.hives || []
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
    };

    const handleApiaryUpdate = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hives/update_apiary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apiaryId,
                    ...updatedData
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du rucher');
            }

            setApiaryData(prev => ({
                ...prev,
                apiary: {
                    ...prev.apiary,
                    ...updatedData
                }
            }));
            setIsEditing(false);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

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
            <button
                onClick={() => navigate('/apiaries')}
                className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
            >
                <span className="mr-2">←</span>
                Retour aux ruchers
            </button>

            {apiaryData.apiary && (
                <ApiaryHeader
                    apiary={apiaryData.apiary}
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(true)}
                    onSave={handleApiaryUpdate}
                    onCancel={() => setIsEditing(false)}
                    onChange={(e) => {
                        const {name, value} = e.target;
                        setApiaryData(prev => ({
                            ...prev,
                            apiary: {
                                ...prev.apiary,
                                [name]: value
                            }
                        }));
                    }}
                />
            )}

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
                            onDelete={(hiveId) => {
                                setApiaryData(prev => ({
                                    ...prev,
                                    hives: prev.hives.filter((h) => h.id !== hiveId)
                                }));
                            }}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">Aucune ruche trouvée</p>
                )}
            </div>
        </div>
    );
};

export default Apiary;