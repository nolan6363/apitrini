from flask import Blueprint, request, jsonify, send_from_directory
from apitrini.api.routes.auth_routes import optional_token, token_required
from apitrini.core.infrastructure.db import mysql
from apitrini.core.services.image_processing_service import ImageProcessingService
import os

image_bp = Blueprint('image', __name__)
image_service = ImageProcessingService()


@image_bp.route('/process', methods=['POST'])
def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Aucune image fournie"}), 400

        image = request.files['image']
        if image.filename == '':
            return jsonify({"error": "Aucun fichier sélectionné"}), 400

        try:
            # Uniquement le traitement de l'image
            results = image_service.process_image(image)
            return jsonify(results), 200

        except Exception as e:
            print(f"Erreur lors du traitement: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"Erreur générale: {str(e)}")
        return jsonify({"error": str(e)}), 500

@image_bp.route('/save_analysis', methods=['POST'])
@token_required  # Cette route nécessite une authentification
def save_analysis():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not all(key in data for key in ['hiveId', 'varroaCount', 'picturePath']):
            return jsonify({"error": "Données manquantes"}), 400

        hive_id = data['hiveId']
        varroa_count = data['varroaCount']
        picture_path = data['picturePath']

        cur = mysql.connection.cursor()
        try:
            # Vérification de l'accès
            check_query = """
                SELECT 1 
                FROM hive
                INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = hive.apiary_id_fk
                WHERE hive.id = %(hive_id)s AND relations_user_apiary.user_id_fk = %(user_id)s
            """
            cur.execute(check_query, {
                'user_id': user_id,
                'hive_id': hive_id
            })

            if not cur.fetchone():
                return jsonify({"error": "Accès non autorisé à cette ruche"}), 403

            # Enregistrement de l'analyse
            insert_query = """
                INSERT INTO analysis (
                    hive_id_fk, 
                    created_at, 
                    varroa_count,
                    picture_path
                ) VALUES (
                    %(hive_id)s,
                    NOW(),
                    %(varroa_count)s,
                    %(picture_path)s
                )
            """

            cur.execute(insert_query, {
                'hive_id': hive_id,
                'varroa_count': varroa_count,
                'picture_path': picture_path
            })
            mysql.connection.commit()

            return jsonify({
                'message': 'Analyse enregistrée avec succès',
                'analysis_id': cur.lastrowid
            }), 201

        except Exception as e:
            mysql.connection.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@image_bp.route('/get/<path:filename>', methods=['GET'])
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
