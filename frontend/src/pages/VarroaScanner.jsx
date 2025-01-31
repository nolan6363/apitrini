import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "@/config/api.js";

function VarroaScanner() {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [processedImageUrl, setProcessedImageUrl] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const { hiveId } = useParams();

    const [apiaries, setApiaries] = useState([]);
    const [hives, setHives] = useState([]);
    const [selectedApiary, setSelectedApiary] = useState(null);
    const [selectedHive, setSelectedHive] = useState(null);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [currentHiveInfo, setCurrentHiveInfo] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Gestionnaire pour prévenir la navigation si analyse non sauvegardée
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        fetchApiaries();
        if (hiveId) {
            fetchHiveInfo(hiveId);
        }
    }, []);

    useEffect(() => {
        if (selectedApiary) {
            fetchHives(selectedApiary);
        }
    }, [selectedApiary]);

    useEffect(() => {
        if (selectedImage) {
            const objectUrl = URL.createObjectURL(selectedImage);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [selectedImage]);

    // Mise à jour de hasUnsavedChanges quand une analyse est complétée
    useEffect(() => {
        if (analysisComplete && !results?.saved) {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }
    }, [analysisComplete, results?.saved]);

    const resetAnalysis = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setProcessedImageUrl(null);
        setResults(null);
        setAnalysisComplete(false);
        setHasUnsavedChanges(false);
        setError(null);
    };

    const fetchApiaries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hives/get_apiary_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sort: 'name',
                    search: ''
                })
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des ruchers');
            const data = await response.json();
            setApiaries(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchHives = async (apiaryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hives/get_apiary_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apiaryId: apiaryId,
                    sort: 'name',
                    search: ''
                })
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des ruches');
            const data = await response.json();
            setHives(data.hives);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchHiveInfo = async (hiveId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hives/get_hive_info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ hiveId }),
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des informations de la ruche');
            const data = await response.json();
            setCurrentHiveInfo(data);
            setSelectedHive(data.id);
            setSelectedApiary(data.apiaryId);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setError(null);
            setResults(null);
            setProcessedImageUrl(null);
            setAnalysisComplete(false);
            setHasUnsavedChanges(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/images/process`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Erreur lors du traitement de l\'image');

            const data = await response.json();
            setResults(data);
            setAnalysisComplete(true);
            setHasUnsavedChanges(true);

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

    const handleSaveAnalysis = async () => {
        if (!selectedHive && !currentHiveInfo?.id) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/images/save_analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    hiveId: currentHiveInfo?.id || selectedHive,
                    varroaCount: results.varroa_count,
                    picturePath: results.processed_image
                }),
            });

            if (!response.ok) throw new Error('Erreur lors de l\'enregistrement de l\'analyse');

            const data = await response.json();
            setResults(prev => ({
                ...prev,
                saved: true,
                analysis_id: data.analysis_id
            }));
            setHasUnsavedChanges(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center">Détection de Varroas</h1>

            {/* Information de la ruche sélectionnée via URL */}
            {currentHiveInfo && (
                <div className="text-center mb-4">
                    <p className="text-lg">Analyse pour la ruche {currentHiveInfo.name} du rucher {currentHiveInfo.apiaryName}</p>
                </div>
            )}

            {/* Sélection du rucher et de la ruche */}
            {!hiveId && !analysisComplete && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sélectionner un rucher
                        </label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedApiary || ''}
                            onChange={(e) => {
                                setSelectedApiary(e.target.value);
                                setSelectedHive(null);
                            }}
                        >
                            <option value="">Choisir un rucher</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={apiary.id}>
                                    {apiary.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sélectionner une ruche
                        </label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedHive || ''}
                            onChange={(e) => setSelectedHive(e.target.value)}
                            disabled={!selectedApiary}
                        >
                            <option value="">Choisir une ruche</option>
                            {hives.map((hive) => (
                                <option key={hive.id} value={hive.id}>
                                    {hive.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Section de sélection d'image */}
            <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-input"
                        disabled={processing}
                    />
                    <label
                        htmlFor="image-input"
                        className={`block text-center ${!analysisComplete && !processing ? 'cursor-pointer' : ''}`}
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

            {/* Bouton d'analyse (uniquement visible si image sélectionnée et analyse non effectuée) */}
            {selectedImage && !analysisComplete && (
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
                <div className="border rounded-lg p-4 space-y-4">
                    <h2 className="text-xl font-semibold">Résultats</h2>
                    <p>Nombre de varroas détectés : {results.varroa_count}</p>
                    <p>Temps de traitement : {results.processing_time}</p>

                    {/* Bouton de sauvegarde */}
                    {!results.saved && (selectedHive || currentHiveInfo) && (
                        <button
                            onClick={handleSaveAnalysis}
                            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                        >
                            Enregistrer l'analyse
                        </button>
                    )}

                    {results.saved && (
                        <div className="p-2 rounded bg-green-100">
                            <p className="text-green-700">
                                Analyse enregistrée avec succès (ID: {results.analysis_id})
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Bouton nouvelle analyse */}
            {analysisComplete && (
                <button
                    onClick={resetAnalysis}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Analyser une nouvelle image
                </button>
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