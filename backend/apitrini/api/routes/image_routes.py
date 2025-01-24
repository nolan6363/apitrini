from flask import Blueprint, request, send_file
from apitrini.core.services.image_service import ImageService

image_bp = Blueprint('image', __name__)
image_service = ImageService()

@image_bp.route('/upload', methods=['POST'])
def upload_image():
    """Route pour uploader une image."""
    return image_service.handle_upload(request.files.get('image'))

@image_bp.route('/images/<filename>', methods=['GET'])
def get_image(filename):
    """Route pour récupérer une image."""
    try:
        return send_file(image_service.get_image_path(filename))
    except FileNotFoundError:
        return {"error": "Image non trouvée"}, 404