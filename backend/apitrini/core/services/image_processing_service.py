import os
from werkzeug.utils import secure_filename
from PIL import Image
from ..ml.varroa_detector import YOLODetector


class ImageProcessingService:
    def __init__(self):
        self.storage_path = 'storage/perm'
        # Vous pouvez ajuster le chemin du modèle selon votre structure
        model_path = os.path.join('apitrini', 'core', 'ml', 'models', 'model_v3.pt')
        self.detector = YOLODetector(model_path=model_path)

    def process_image(self, image_file):
        """
        Traite une image et retourne les résultats de la détection de varroas.
        """
        # Création des chemins de fichiers
        input_filename = secure_filename(image_file.filename)
        input_path = os.path.join(self.storage_path, 'input', input_filename)
        output_filename = f"processed_{input_filename}"
        output_path = os.path.join(self.storage_path, 'output', output_filename)

        # Assure que les dossiers existent
        os.makedirs(os.path.dirname(input_path), exist_ok=True)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        try:
            # Sauvegarde l'image originale
            image_file.save(input_path)

            # Ouvre l'image avec PIL
            image = Image.open(input_path)

            # Fonction de callback pour suivre la progression
            def progress_callback(progress):
                print(f"Traitement en cours : {progress:.1f}%")

            # Traitement de l'image avec le détecteur
            count, result_image = self.detector.detect_varroas(
                image,
                progress_callback=progress_callback
            )

            # Sauvegarde l'image résultante
            result_image.save(output_path)

            return {
                "success": True,
                "varroa_count": count,
                "original_image": input_filename,
                "processed_image": output_filename,
                "message": f"Détection terminée. {count} varroas trouvés."
            }

        except Exception as e:
            # Log l'erreur pour le débogage
            print(f"Erreur lors du traitement de l'image : {str(e)}")
            raise Exception(f"Erreur lors du traitement de l'image : {str(e)}")