import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { API_URL } from "@/config/api.js";

function CreateApiary() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                throw new Error('Veuillez vous connecter pour créer un rucher');
            }

            const response = await fetch(`${API_URL}/api/hives/create_apiary`, {
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
                throw new Error('Erreur lors de la création du rucher');
            }

            // Redirection vers la liste des ruchers
            navigate('/apiaries');

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
        navigate('/apiaries');
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Créer un nouveau rucher</h1>
                <button
                    onClick={handleCancel}
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                    ← Retour
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
                <div>
                    <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                        Nom du rucher *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Entrez le nom du rucher"
                    />
                </div>

                <div>
                    <label htmlFor="location" className="block mb-2 font-medium text-gray-700">
                        Emplacement *
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Entrez l'emplacement du rucher"
                    />
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
                        {loading ? 'Création...' : 'Créer le rucher'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateApiary;