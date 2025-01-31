import React, {useEffect, useState} from "react";
import {isRouteErrorResponse, useNavigate, useParams} from "react-router-dom";
import {PencilIcon, Save, X, Plus, ChevronDown, ExternalLink} from 'lucide-react';
import {API_URL} from "@/config/api.js";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal.jsx";

const HiveHeader = ({hive, isEditing, onEdit, onSave, onCancel, onChange}) => {
    const handleSave = () => {
        // On n'envoie que les champs nécessaires
        const updateData = {
            name: hive.name,
            description: hive.description
        };
        onSave(updateData);
    };

    if (isEditing) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de la ruche</label>
                        <input
                            type="text"
                            name="name"
                            value={hive.name || ''}
                            onChange={onChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={hive.description || ''}
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
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 relative">
            <button
                onClick={onEdit}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
                <PencilIcon size={20}/>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{hive.name}</h1>
            {hive.description && (
                <p className="text-gray-600 mt-2">{hive.description}</p>
            )}
        </div>
    );
};

const Analysis = ({analysis, onDelete, onEdit}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = () => {
        onDelete(analysis.id);
        setShowDeleteModal(false);
    };

    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center text-gray-900 font-medium"
                        >
                            <ChevronDown
                                size={20}
                                className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                            <span className="ml-2">{formatDate(analysis.createdAt)}</span>
                        </button>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                            analysis.varroaCount <= 100 ? 'bg-green-200 text-green-800' :
                                analysis.varroaCount <= 500 ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-red-200 text-red-800'
                        }`}>
                        {analysis.varroaCount} Varroas
                    </span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-2 text-red-400 hover:text-red-600"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                </div>
                {isExpanded && (
                    <div className="mt-4 pl-8">
                        <div className="flex flex-col">
                            {analysis.picturePath && !imageError && (
                                <div className="relative">
                                    <img
                                        src={`${API_URL}/api/images/get/${analysis.picturePath}`}
                                        alt="Analyse de la ruche"
                                        className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                    <a
                                        href={`${API_URL}/api/images/get/${analysis.picturePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                    >
                                        <ExternalLink size={16}/>
                                    </a>
                                </div>
                            )}
                            {imageError && (
                                <div className="text-red-500 text-sm mt-2">
                                    Erreur lors du chargement de l'image
                                </div>
                            )}
                        </div>
                        {analysis.notes && (
                            <div className="mt-4">
                                <h3 className="text-gray-700 font-medium mb-2">Notes</h3>
                                <p className="text-gray-600">{analysis.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Supprimer l'analyse ?"
                message={`Êtes-vous sûr de vouloir supprimer l'analyse du "${formatDate(analysis.createdAt)}" ? Cette action ne peut pas être annulée.`}
            />
        </>
    );
};

const Hive = () => {
    const {hiveId} = useParams();
    const navigate = useNavigate();
    const [hive, setHive] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchHive = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Veuillez vous connecter pour accéder à cette page');
            }

            const response = await fetch(`${API_URL}/api/hives/get_hive_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({hiveId})
            });

            if (!response.ok) {
                if (response.status === 404) {
                    navigate('/404');
                    return;
                }
                throw new Error('Erreur lors de la récupération de la ruche');
            }

            const data = await response.json();
            setHive({
                id: hiveId,
                name: data.name,
                createdAt: data.createdAt,
                apiaryId: data.apiaryId,
                apiaryName: data.apiaryName,
                description: data.description,
                analyses: data.analyses || []
            });

        } catch (error) {
            setError(error.message);
            if (error.message.includes('connecter')) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHive();
    }, [hiveId, navigate]);

    const handleHiveUpdate = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hives/update_hive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hiveId,
                    ...updatedData
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de la ruche');
            }

            setHive(prev => ({
                ...prev,
                ...updatedData
            }));
            setIsEditing(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAnalysisDelete = async (analysisId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hives/delete_analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({analysisId})
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'analyse');
            }

            setHive(prev => ({
                ...prev,
                analyses: prev.analyses.filter(a => a.id !== analysisId)
            }));
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">Chargement en cours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            </div>
        );
    }

    if (!hive) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(`/apiary/${hive.apiaryId}`)}
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                    ← Retour au rucher {hive.apiaryName}
                </button>
            </div>

            <HiveHeader
                hive={hive}
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleHiveUpdate}
                onCancel={() => setIsEditing(false)}
                onChange={(e) => {
                    const {name, value} = e.target;
                    setHive(prev => ({
                        ...prev,
                        [name]: value
                    }));
                }}
            />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Analyses</h2>
                    <button
                        onClick={() => navigate(`/varroa/${hiveId}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                    >
                        <Plus size={16} className="mr-2"/>
                        Nouvelle analyse
                    </button>
                </div>

                <div className="space-y-4">
                    {hive.analyses?.length > 0 ? (
                        hive.analyses.map(analysis => (
                            <Analysis
                                key={analysis.id}
                                analysis={analysis}
                                onDelete={handleAnalysisDelete}
                                onEdit={() => navigate(`/hives/${hiveId}/analysis/${analysis.id}/edit`)}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Aucune analyse enregistrée
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default Hive;