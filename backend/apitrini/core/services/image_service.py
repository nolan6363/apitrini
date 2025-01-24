from apitrini.infrastructure.storage import StorageManager

class ImageService:
    def __init__(self):
        self.storage = StorageManager()
        self.allowed_extensions = {'png', 'jpg', 'jpeg'}

    def _is_allowed_file(self, filename):
        """Vérifie si l'extension du fichier est autorisée."""
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.allowed_extensions

    def handle_upload(self, image_file):
        """Gère le processus complet d'upload d'une image."""
        if not image_file:
            return {"error": "Aucune image fournie"}, 400

        if image_file.filename == '':
            return {"error": "Nom de fichier invalide"}, 400

        if not self._is_allowed_file(image_file.filename):
            return {"error": "Type de fichier non autorisé"}, 400

        try:
            saved_filename = self.storage.save_image(image_file)
            return {
                "success": True,
                "filename": saved_filename,
                "message": "Image sauvegardée avec succès"
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def get_image_path(self, filename):
        """Récupère le chemin complet d'une image."""
        return os.path.join(self.storage.base_path, filename)