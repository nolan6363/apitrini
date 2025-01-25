import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

function ImageDisplay({ selectedImage, analysisResult }) {
    // État local pour stocker l'URL de prévisualisation de l'image sélectionnée
    const [previewUrl, setPreviewUrl] = useState(null);
    // État pour l'image analysée retournée par le backend
    const [analysisImage, setAnalysisImage] = useState(null);

    // Effet pour créer l'URL de prévisualisation quand une nouvelle image est sélectionnée
    useEffect(() => {
        // Si une image a été sélectionnée, créer une URL pour la prévisualisation
        if (selectedImage) {
            const objectUrl = URL.createObjectURL(selectedImage);
            setPreviewUrl(objectUrl);

            // Nettoyage de l'URL quand le composant est démonté ou quand l'image change
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [selectedImage]);

    // Effet pour charger l'image analysée quand le résultat est disponible
    useEffect(() => {
        if (analysisResult?.imagePath) {
            // Construction de l'URL pour récupérer l'image analysée
            setAnalysisImage(`http://localhost:5000/api/images/${analysisResult.imagePath}`);
        }
    }, [analysisResult]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Affichage de la miniature de l'image sélectionnée */}
            {previewUrl && (
                <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Image sélectionnée</h3>
                    <div className="relative aspect-video">
                        <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="rounded object-contain w-full h-full"
                        />
                    </div>
                </div>
            )}

            {/* Affichage des résultats de l'analyse */}
            {analysisImage && (
                <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Résultats de l'analyse</h3>
                    <div className="relative aspect-video">
                        <img
                            src={analysisImage}
                            alt="Résultats de l'analyse"
                            className="rounded object-contain w-full h-full"
                        />
                    </div>
                    {analysisResult.varroaCount && (
                        <p className="mt-2 text-center">
                            Nombre de varroas détectés : {analysisResult.varroaCount}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ImageDisplay;