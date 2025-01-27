from flask import Blueprint, request, jsonify, send_from_directory
from apitrini.core.services.image_processing_service import ImageProcessingService
import os

image_bp = Blueprint('image', __name__)
image_service = ImageProcessingService()


@image_bp.route('/process', methods=['POST'])
def process_image():
    """
    Route pour traiter une image et détecter les varroas.
    """
    if 'image' not in request.files:
        return jsonify({"error": "Aucune image fournie"}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "Aucun fichier sélectionné"}), 400

    try:
        results = image_service.process_image(image)
        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@image_bp.route('/get/<path:filename>')
def serve_image(filename):
    """
    Route pour servir les images (originales et traitées).
    """
    storage_dir = os.path.abspath('./storage/perm/output/')
    print(f"Accessing file: {filename} in directory: {storage_dir}")  # Debug log

    if not os.path.exists(os.path.join(storage_dir, filename)):
        print(f"File not found: {os.path.join(storage_dir, filename)}")  # Debug log
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(storage_dir, filename)
