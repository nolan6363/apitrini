import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from "@/config/api.js";

function CreateHive() {
    const navigate = useNavigate();
    const { apiaryId } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        apiaryId: apiaryId
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiaryInfo, setApiaryInfo] = useState(null);

    // Récupérer les informations du rucher
    useEffect(() => {
        const fetchApiaryInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Veuillez vous connecter pour accéder à cette page');
                }

                const response = await fetch(`${API_URL}/api/hives/get_apiary_info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ apiaryId })
                });

                if (response.status === 401) {
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des informations du rucher');
                }

                const data = await response.json();
                setApiaryInfo(data);

            } catch (err) {
                setError(err.message);
                if (err.message.includes('Session expirée') || err.message.includes('connecter')) {
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                }
            }
        };

        fetchApiaryInfo();
    }, [apiaryId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Veuillez vous connecter pour créer une ruche');
            }

            const response = await fetch(`${API_URL}/api/hives/create_hive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.status === 401) {
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la ruche');
            }

            // Redirection vers la liste des ruches du rucher
            navigate(`/hives/${apiaryId}`);

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

    const handleCancel = () => {
        navigate(`/hives/${apiaryId}`);
    };

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
        <div className="p-4 max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Ajouter une nouvelle ruche</h1>
                    {apiaryInfo && (
                        <p className="text-gray-600 mt-1">
                            Rucher : {apiaryInfo.name}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleCancel}
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                    ← Retour
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
                <div>
                    <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                        Nom de la ruche *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Entrez le nom de la ruche"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Donnez un nom unique à votre ruche pour la retrouver facilement
                    </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Création...' : 'Créer la ruche'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateHive;