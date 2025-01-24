import React from 'react';
import ImageUploader from '../features/image/ImageUploader';

function VarroaScanner() {
    const handleUploadSuccess = (data) => {
        console.log('Upload réussi:', data);
        // Traitez les données reçues du backend ici
    };

    const handleUploadError = (error) => {
        console.error("Erreur d'upload:", error);
        // Gérez l'erreur ici
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Scanner de Varroas</h1>
            <ImageUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
            />
        </div>
    );
}

export default VarroaScanner;