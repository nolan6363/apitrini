from flask import Blueprint, request, jsonify, send_from_directory
from apitrini.api.routes.auth_routes import optional_token
from apitrini.core.infrastructure.db import mysql
from apitrini.core.services.image_processing_service import ImageProcessingService
import os

image_bp = Blueprint('image', __name__)
image_service = ImageProcessingService()


@image_bp.route('/process', methods=['POST'])
@optional_token
def process_image():
    try:
        print("Début du traitement de l'image")  # Log de début

        if 'image' not in request.files:
            return jsonify({"error": "Aucune image fournie"}), 400

        # Log des informations de la requête
        print(f"User ID: {getattr(request, 'user_id', 'Anonymous')}")
        print(f"Hive ID from form: {request.form.get('hiveId')}")

        image = request.files['image']
        if image.filename == '':
            return jsonify({"error": "Aucun fichier sélectionné"}), 400

        try:
            # Traitement de l'image
            results = image_service.process_image(image)
            print(f"Résultats du traitement: {results}")  # Log des résultats

            # Vérification authentification et hive_id
            user_id = getattr(request, 'user_id', None)
            hive_id = request.form.get('hiveId')

            print(f"Tentative d'enregistrement - User ID: {user_id}, Hive ID: {hive_id}")

            if user_id and hive_id:
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

                    has_access = cur.fetchone() is not None
                    print(f"Accès à la ruche: {has_access}")  # Log de l'accès

                    if has_access:
                        # Enregistrement
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

                        insert_data = {
                            'hive_id': hive_id,
                            'varroa_count': results['varroa_count'],
                            'picture_path': results['processed_image']
                        }
                        print(f"Données à insérer: {insert_data}")  # Log des données

                        cur.execute(insert_query, insert_data)
                        mysql.connection.commit()

                        results['analysis_id'] = cur.lastrowid
                        results['saved'] = True
                        print(f"Analyse enregistrée avec l'ID: {cur.lastrowid}")
                    else:
                        results['saved'] = False
                        results['error_message'] = "Accès non autorisé à cette ruche"
                        print("Accès refusé à la ruche")

                except Exception as e:
                    print(f"Erreur lors de l'enregistrement: {str(e)}")
                    mysql.connection.rollback()
                    results['saved'] = False
                    results['error_message'] = str(e)
                finally:
                    cur.close()
            else:
                results['saved'] = False
                if not user_id:
                    results['message'] = "Analyse effectuée en mode anonyme"
                elif not hive_id:
                    results['message'] = "Aucune ruche spécifiée pour l'enregistrement"
                print(f"Mode anonyme ou sans ruche: {results['message']}")

            return jsonify(results), 200

        except Exception as e:
            print(f"Erreur lors du traitement: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"Erreur générale: {str(e)}")
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
