import os
from werkzeug.utils import secure_filename
from datetime import datetime


class StorageManager:
    def __init__(self, base_path='storage/perm'):
        self.base_path = base_path
        self._ensure_storage_exists()

    def _ensure_storage_exists(self):
        """S'assure que le dossier de stockage existe, le crée si nécessaire."""
        os.makedirs(self.base_path, exist_ok=True)

    def _generate_unique_filename(self, original_filename):
        """Génère un nom de fichier unique basé sur un timestamp."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        secure_name = secure_filename(original_filename)
        base, extension = os.path.splitext(secure_name)
        return f"{base}_{timestamp}{extension}"

    def save_image(self, file):
        """Sauvegarde une image et retourne son chemin relatif."""
        if not file:
            raise ValueError("Aucun fichier fourni")

        filename = self._generate_unique_filename(file.filename)
        filepath = os.path.join(self.base_path, filename)
        file.save(filepath)
        return filename
