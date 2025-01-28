import React, { useState, useEffect} from 'react';
import ImageUploader from '@/components/features/image/ImageUploader.jsx';
import ImageDisplay from '@/components/features/image/ImageDisplay.jsx';
import {API_URL} from "@/config/api.js";

function VarroaScanner() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [processedImageUrl, setProcessedImageUrl] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedImage) {
            const objectUrl = URL.createObjectURL(selectedImage);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [selectedImage]);

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setError(null);
            setResults(null);
            setProcessedImageUrl(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await fetch(`${API_URL}/api/images/process`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.statusText}`);
            }

            const data = await response.json();
            setResults(data);

            // Si l'API renvoie le nom de l'image traitée
            if (data.processed_image) {
                setProcessedImageUrl(`${API_URL}/api/images/get/${data.processed_image}`);
            }
        } catch (err) {
            setError(err.message);
            setResults(null);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center">Détection de Varroas</h1>

            {/* Section de sélection d'image */}
            <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-input"
                    />
                    <label
                        htmlFor="image-input"
                        className="block text-center cursor-pointer"
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Image originale"
                                className="max-h-64 mx-auto rounded"
                            />
                        ) : (
                            <p>Cliquez pour sélectionner une image</p>
                        )}
                    </label>
                </div>

                {/* Affichage de l'image traitée */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {processedImageUrl ? (
                        <img
                            src={processedImageUrl}
                            alt="Image traitée"
                            className="max-h-64 mx-auto rounded"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            L'image traitée apparaîtra ici
                        </div>
                    )}
                </div>
            </div>

            {/* Bouton de traitement */}
            {selectedImage && (
                <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {processing ? 'Traitement en cours...' : 'Analyser l\'image'}
                </button>
            )}

            {/* Affichage des résultats */}
            {results && (
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Résultats</h2>
                    <p>Nombre de varroas détectés : {results.varroa_count}</p>
                    <p>Temps de traitement : {results.processing_time}</p>
                </div>
            )}

            {/* Affichage des erreurs */}
            {error && (
                <div className="text-red-600 p-4 border border-red-200 rounded">
                    Erreur : {error}
                </div>
            )}
        </div>
    );
}

export default VarroaScanner;