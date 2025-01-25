from flask import Blueprint, request, jsonify, send_from_directory
from apitrini.core.services.image_processing_service import ImageProcessingService

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

@image_bp.route('/images/<path:filename>')
def serve_image(filename):
    """
    Route pour servir les images (originales et traitées).
    """
    return send_from_directory('storage/perm', filename)