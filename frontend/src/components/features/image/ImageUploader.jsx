import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button.jsx';

function ImageUploader({ onUploadSuccess, onUploadError }) {
    // Les états sont correctement initialisés avec des valeurs par défaut
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // Cette fonction gère la sélection d'une image par l'utilisateur
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        // Nous vérifions que le fichier existe bien
        if (!file) return;

        // Nous vérifions que c'est bien une image
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide');
            return;
        }

        setSelectedImage(file);
        // Création de l'URL pour la prévisualisation
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setError(null);
    };

    // Cette fonction gère l'envoi de l'image vers le backend
    const handleUpload = async () => {
        if (!selectedImage) {
            setError('Veuillez sélectionner une image');
            return;
        }

        setUploading(true);
        setError(null);

        // Création du FormData pour l'envoi du fichier
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('http://localhost:5000/api/images/upload', {
                method: 'POST',
                body: formData,
                // Nous ne définissons pas le Content-Type car il est automatiquement
                // défini avec la boundary correcte pour le multipart/form-data
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de l'upload: ${response.statusText}`);
            }

            const data = await response.json();
            // Appel du callback de succès si fourni
            if (onUploadSuccess) {
                onUploadSuccess(data);
            }

            // Nettoyage après succès
            resetUploader();
        } catch (err) {
            const errorMessage = err.message || "Une erreur est survenue lors de l'upload";
            setError(errorMessage);
            // Appel du callback d'erreur si fourni
            if (onUploadError) {
                onUploadError(errorMessage);
            }
        } finally {
            setUploading(false);
        }
    };

    // Fonction utilitaire pour réinitialiser l'état
    const resetUploader = () => {
        setSelectedImage(null);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        setError(null);
    };

    // Nettoyage des ressources quand le composant est démonté
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            {/* Zone de dépôt d'image avec prévisualisation */}
            <div
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center
                    transition-colors duration-200
                    ${selectedImage ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400'}
                `}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-input"
                    disabled={uploading}
                />
                <label
                    htmlFor="image-input"
                    className={`block ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="Aperçu"
                            className="max-h-64 mx-auto rounded object-contain"
                        />
                    ) : (
                        <div className="py-8">
                            <p className="text-gray-600">
                                Cliquez ou glissez une image ici pour la sélectionner
                            </p>
                        </div>
                    )}
                </label>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3">
                {selectedImage && (
                    <>
                        <Button
                            variant="secondary"
                            onClick={resetUploader}
                            disabled={uploading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? 'Envoi en cours...' : "Envoyer l'image"}
                        </Button>
                    </>
                )}
            </div>

            {/* Affichage des erreurs */}
            {error && (
                <div className="text-red-600 text-sm mt-2 text-center">
                    {error}
                </div>
            )}
        </div>
    );
}

export default ImageUploader;