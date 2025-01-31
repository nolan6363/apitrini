from flask import Blueprint, request, jsonify
from apitrini.api.routes.auth_routes import token_required
from apitrini.core.infrastructure.db import mysql
hives_bp = Blueprint('hives', __name__)


@hives_bp.route('/get_apiary_list', methods=['POST'])
@token_required
def get_apiary_list():
    try:
        user_id = request.user_id
        data = request.get_json()

        # Récupération des paramètres du body
        sort_by = data.get('sort', 'name')
        search = data.get('search', '')

        # Mapping des paramètres de tri
        sort_mapping = {
            'name': 'name',
            'location': 'location',
            'date': 'created_at'
        }

        # Utilise le mapping ou par défaut 'name'
        sort_column = sort_mapping.get(sort_by, 'name')
        search_term = f"%{search}%" if search else "%"

        cur = mysql.connection.cursor()

        query = """
            SELECT 
                apiary.id,
                apiary.name,
                apiary.location,
                COUNT(DISTINCT hive.id) as hive_count,
                apiary.created_at,
                apiary.description
            FROM apiary 
            INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
            LEFT JOIN hive ON hive.apiary_id_fk = apiary.id
            WHERE relations_user_apiary.user_id_fk = %(user_id)s 
            AND (apiary.name LIKE %(search)s OR apiary.location LIKE %(search)s)
            GROUP BY apiary.id, apiary.name, apiary.location, apiary.created_at
            ORDER BY """ + sort_column + " ASC"

        cur.execute(query, {
            'user_id': user_id,
            'search': search_term
        })

        apiaries = cur.fetchall()
        cur.close()

        formatted_apiaries = [{
            'id': apiary[0],
            'name': apiary[1],
            'localisation': apiary[2],
            'hiveNumber': apiary[3],
            'createdAt': apiary[4].isoformat() if apiary[4] else None,
            'description': apiary[5]
        } for apiary in apiaries]

        return jsonify(formatted_apiaries), 200

    except Exception as e:
        print("Erreur dans la récupération des ruchers: ", str(e))
        return jsonify({'error': 'Erreur dans la récupération des ruchers'}), 500


@hives_bp.route('/get_apiary_info', methods=['POST'])
@token_required
def get_apiary_info():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('apiaryId'):
            return jsonify({'error': 'ID de rucher non fourni'}), 400

        apiary_id = data.get('apiaryId')

        cur = mysql.connection.cursor()

        query = """
            SELECT 
                apiary.id,
                apiary.name,
                apiary.location,
                COUNT(DISTINCT hive.id) as hive_count,
                apiary.description
            FROM apiary 
            INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
            LEFT JOIN hive ON hive.apiary_id_fk = apiary.id
            WHERE relations_user_apiary.user_id_fk = %(user_id)s 
            AND apiary.id = %(apiary_id)s
            GROUP BY apiary.id, apiary.name, apiary.location
        """

        cur.execute(query, {
            'user_id': user_id,
            'apiary_id': apiary_id
        })

        result = cur.fetchone()
        cur.close()

        if not result:
            return jsonify({
                'error': 'Rucher non trouvé ou accès non autorisé'
            }), 404

        return jsonify({
            'id': result[0],
            'name': result[1],
            'location': result[2],
            'hiveCount': result[3],
            'description': result[4]
        }), 200

    except Exception as e:
        print(f"Erreur lors de la récupération des informations du rucher: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la récupération des informations du rucher'
        }), 500


@hives_bp.route('/get_apiary_data', methods=['POST'])
@token_required
def get_apiary_data():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('apiaryId'):
            return jsonify({'error': 'ID de rucher non fourni'}), 400

        apiary_id = data.get('apiaryId')
        sort_by = data.get('sort', 'name')
        search = data.get('search', '')

        # Mapping des paramètres de tri
        sort_mapping = {
            'name': 'hive.name',
            'date': 'hive.created_at'
        }

        sort_column = sort_mapping.get(sort_by, 'hive.name')
        search_term = f"%{search}%" if search else "%"

        cur = mysql.connection.cursor()

        # Une seule requête qui vérifie à la fois l'accès et récupère les ruches
        query = """
            SELECT 
                hive.id,
                hive.name,
                hive.created_at,
                hive.apiary_id_fk,
                apiary.name as apiary_name,
                apiary.location,
                apiary.description
            FROM hive 
            INNER JOIN apiary ON apiary.id = hive.apiary_id_fk
            INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
            WHERE hive.apiary_id_fk = %(apiary_id)s 
            AND relations_user_apiary.user_id_fk = %(user_id)s
            AND hive.name LIKE %(search)s
            ORDER BY """ + sort_column + """ ASC
        """

        cur.execute(query, {
            'apiary_id': apiary_id,
            'user_id': user_id,
            'search': search_term
        })

        hives = cur.fetchall()
        cur.close()

        # Si aucune ruche n'est trouvée, vérifions si c'est parce que l'utilisateur n'a pas accès
        if not hives:
            # Vérifie si le rucher existe et appartient à l'utilisateur
            cur = mysql.connection.cursor()
            access_query = """
                SELECT name FROM apiary 
                INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
                WHERE apiary.id = %(apiary_id)s AND relations_user_apiary.user_id_fk = %(user_id)s
            """
            cur.execute(access_query, {
                'apiary_id': apiary_id,
                'user_id': user_id
            })
            apiary_data = cur.fetchone()
            cur.close()

            if not apiary_data:
                return jsonify({'error': 'Accès non autorisé à ce rucher'}), 403

            # Si on arrive ici, le rucher existe mais est vide
            return jsonify({
                'apiary_id': apiary_id,
                'apiary_name': apiary_data[0],
                'hives': []
            }), 200

        formatted_response = {
            'apiary_id': apiary_id,
            'apiary_name': hives[0][4],
            'apiary_location': hives[0][5],
            'apiary_description': hives[0][6],
            'hives': [{
                'id': hive[0],
                'name': hive[1],
                'createdAt': hive[2].isoformat() if hive[2] else None,
                'apiaryId': hive[3]
            } for hive in hives]
        }

        return jsonify(formatted_response), 200

    except Exception as e:
        print("Erreur dans la récupération des ruches: ", str(e))
        return jsonify({'error': 'Erreur dans la récupération des ruches'}), 500


@hives_bp.route('/get_hive_data', methods=['POST'])
@token_required
def get_hive_data():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not user_id:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        if not data or not data.get('hiveId'):
            return jsonify({'error': 'ID de ruche non fourni'}), 400

        hive_id = data.get('hiveId')

        cur = mysql.connection.cursor()

        query = """
            SELECT 
                hive.id,
                hive.name, 
                hive.created_at, 
                hive.description,
                apiary.id as apiary_id, 
                apiary.name as apiary_name,
                analysis.id as analysis_id,
                analysis.created_at as analysis_date,
                analysis.varroa_count,
                analysis.picture_path
            FROM hive
            INNER JOIN apiary ON apiary.id = hive.apiary_id_fk
            INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
            LEFT JOIN analysis ON hive.id = analysis.hive_id_fk
            WHERE hive.id = %(hive_id)s AND relations_user_apiary.user_id_fk = %(user_id)s
            ORDER BY analysis.created_at DESC
        """

        cur.execute(query, {
            'hive_id': hive_id,
            'user_id': user_id
        })

        results = cur.fetchall()  # On récupère tous les résultats, pas juste le premier
        cur.close()

        if not results:
            return jsonify({
                'error': 'Ruche non trouvée ou accès non autorisé'
            }), 404

        # Les informations de base de la ruche sont les mêmes pour toutes les lignes
        hive_data = {
            'id': results[0][0],
            'name': results[0][1],
            'createdAt': results[0][2].isoformat() if results[0][2] else None,
            'description': results[0][3],
            'apiaryId': results[0][4],
            'apiaryName': results[0][5],
            'analyses': []
        }

        # On ajoute chaque analyse si elle existe
        for row in results:
            if row[6]:  # Si l'ID de l'analyse n'est pas null
                analysis = {
                    'id': row[6],
                    'createdAt': row[7].isoformat() if row[7] else None,
                    'varroaCount': row[8],
                    'picturePath': row[9]
                }
                hive_data['analyses'].append(analysis)

        return jsonify(hive_data), 200

    except Exception as e:
        print(f"Erreur lors de la récupération des informations de la ruche: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la récupération des informations de la ruche'
        }), 500


@hives_bp.route('/get_hive_info', methods=['POST'])
@token_required
def get_hive_info():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('hiveId'):
            return jsonify({'error': 'ID de ruche non fourni'}), 400

        hive_id = data.get('hiveId')

        cur = mysql.connection.cursor()

        query = """
            SELECT
                hive.id,
                hive.name,
                hive.created_at,
                hive.description,
                apiary.id as apiary_id,
                apiary.name as apiary_name
            FROM hive
            INNER JOIN apiary ON apiary.id = hive.apiary_id_fk
            INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
            WHERE hive.id = %(hive_id)s AND relations_user_apiary.user_id_fk = %(user_id)s
        """

        cur.execute(query, {
            'hive_id': hive_id,
            'user_id': user_id
        })

        result = cur.fetchone()
        cur.close()

        if not result:
            return jsonify({
                'error': 'Ruche non trouvée ou accès non autorisé'
            }), 404

        return jsonify({
            'id': result[0],
            'name': result[1],
            'createdAt': result[2].isoformat() if result[2] else None,
            'description': result[3],
            'apiaryId': result[4],
            'apiaryName': result[5]
        }), 200

    except Exception as e:
        print(f"Erreur lors de la récupération des informations de la ruche: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la récupération des informations de la ruche'
        }), 500


@hives_bp.route('/create_apiary', methods=['POST'])
@token_required
def create_apiary():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not user_id:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        if not data:
            return jsonify({'error': 'Données non fournies'}), 400

        name = data.get('name', '').strip()
        location = data.get('location', '').strip()
        description = data.get('description', '').strip()

        # Validation des données
        if not name or len(name) < 2:
            return jsonify({'error': 'Le nom du rucher doit faire au moins 2 caractères'}), 400

        if not location or len(location) < 2:
            return jsonify({'error': 'La localisation doit faire au moins 2 caractères'}), 400

        if len(name) > 100:  # Ajustez selon vos besoins
            return jsonify({'error': 'Le nom du rucher est trop long (max 100 caractères)'}), 400

        if len(location) > 200:  # Ajustez selon vos besoins
            return jsonify({'error': 'La localisation est trop longue (max 200 caractères)'}), 400

        cur = mysql.connection.cursor()

        # Vérification si un rucher avec le même nom existe déjà pour cet utilisateur
        check_query = """
            SELECT 1 FROM apiary a
            INNER JOIN relations_user_apiary rua ON rua.apiary_id_fk = a.id
            WHERE rua.user_id_fk = %(user_id)s AND a.name = %(name)s
        """

        cur.execute(check_query, {
            'user_id': user_id,
            'name': name
        })

        if cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Un rucher avec ce nom existe déjà'
            }), 409

        try:
            # Insertion du rucher avec RETURNING si votre version de MySQL le supporte
            insert_query = """
                INSERT INTO apiary (name, location, created_at, description) 
                VALUES (%(name)s, %(location)s, NOW(), %(description)s)
            """

            cur.execute(insert_query, {
                'name': name,
                'location': location,
                'description': description
            })

            apiary_id = cur.lastrowid

            # Création de la relation utilisateur-rucher
            relation_query = """
                INSERT INTO relations_user_apiary (user_id_fk, apiary_id_fk) 
                VALUES (%(user_id)s, %(apiary_id)s)
            """

            cur.execute(relation_query, {
                'user_id': user_id,
                'apiary_id': apiary_id
            })

            mysql.connection.commit()

            return jsonify({
                'message': 'Rucher créé avec succès',
                'apiary': {
                    'id': apiary_id,
                    'name': name,
                    'location': location,
                    'description': description
                }
            }), 201

        except Exception as e:
            mysql.connection.rollback()
            raise e

        finally:
            cur.close()

    except Exception as e:
        print(f"Erreur lors de la création du rucher: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la création du rucher'
        }), 500


@hives_bp.route('/create_hive', methods=['POST'])
@token_required
def create_hive():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not user_id:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        if not data:
            return jsonify({'error': 'Données non fournies'}), 400

        name = data.get('name', '').strip()
        apiary_id = data.get('apiaryId')

        # Validation des données
        if not name or len(name) < 2:
            return jsonify({'error': 'Le nom de la ruche doit faire au moins 2 caractères'}), 400

        if len(name) > 100:
            return jsonify({'error': 'Le nom de la ruche est trop long (max 100 caractères)'}), 400

        if not apiary_id:
            return jsonify({'error': 'ID du rucher non fourni'}), 400

        cur = mysql.connection.cursor()

        # Vérifier que l'utilisateur a accès au rucher
        check_query = """
            SELECT 1 FROM relations_user_apiary
            WHERE user_id_fk = %(user_id)s AND apiary_id_fk = %(apiary_id)s
        """

        cur.execute(check_query, {
            'user_id': user_id,
            'apiary_id': apiary_id
        })

        if not cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Accès non autorisé à ce rucher'
            }), 403

        # Vérifier si une ruche avec ce nom existe déjà dans ce rucher
        check_name_query = """
            SELECT 1 FROM hive
            WHERE apiary_id_fk = %(apiary_id)s AND name = %(name)s
        """

        cur.execute(check_name_query, {
            'apiary_id': apiary_id,
            'name': name
        })

        if cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Une ruche avec ce nom existe déjà dans ce rucher'
            }), 409

        try:
            # Création de la ruche
            insert_query = """
                INSERT INTO hive (name, apiary_id_fk, created_at) 
                VALUES (%(name)s, %(apiary_id)s, NOW())
            """

            cur.execute(insert_query, {
                'name': name,
                'apiary_id': apiary_id
            })

            hive_id = cur.lastrowid
            mysql.connection.commit()

            return jsonify({
                'message': 'Ruche créée avec succès',
                'hive': {
                    'id': hive_id,
                    'name': name,
                    'apiaryId': apiary_id
                }
            }), 201

        except Exception as e:
            mysql.connection.rollback()
            raise e

        finally:
            cur.close()

    except Exception as e:
        print(f"Erreur lors de la création de la ruche: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la création de la ruche'
        }), 500


@hives_bp.route('/update_apiary', methods=['POST'])
@token_required
def update_apiary():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('apiaryId'):
            return jsonify({'error': 'ID de rucher non fourni'}), 400

        apiary_id = data.get('apiaryId')
        name = data.get('name')
        location = data.get('location')
        description = data.get('description')

        # Vérifier que l'utilisateur a accès à ce rucher
        cur = mysql.connection.cursor()
        check_query = """
            SELECT 1 FROM relations_user_apiary
            WHERE user_id_fk = %(user_id)s AND apiary_id_fk = %(apiary_id)s
        """

        cur.execute(check_query, {
            'user_id': user_id,
            'apiary_id': apiary_id
        })

        if not cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Rucher non trouvé ou accès non autorisé'
            }), 403

        # Mise à jour du rucher
        update_query = """
            UPDATE apiary
            SET name = %(name)s, location = %(location)s, description = %(description)s
            WHERE id = %(apiary_id)s
        """

        cur.execute(update_query, {
            'name': name,
            'location': location,
            'description': description,
            'apiary_id': apiary_id
        })
        mysql.connection.commit()

        return jsonify({
            'message': 'Rucher mis à jour avec succès'
        }), 200

    except Exception as e:
        print(f"Erreur lors de la mise à jour du rucher: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la mise à jour du rucher'
        }), 500


@hives_bp.route('/update_hive', methods=['POST'])
@token_required
def update_hive():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('hiveId'):
            return jsonify({'error': 'ID de ruche non fourni'}), 400

        hive_id = data.get('hiveId')
        name = data.get('name')
        description = data.get('description')

        # Vérifier que l'utilisateur a accès à cette ruche
        cur = mysql.connection.cursor()
        check_query = """
            SELECT 1 FROM hive h
            INNER JOIN apiary a ON a.id = h.apiary_id_fk
            INNER JOIN relations_user_apiary rua ON rua.apiary_id_fk = a.id
            WHERE h.id = %(hive_id)s AND rua.user_id_fk = %(user_id)s
        """

        cur.execute(check_query, {
            'hive_id': hive_id,
            'user_id': user_id
        })

        if not cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Ruche non trouvée ou accès non autorisé'
            }), 403

        # Mise à jour de la ruche
        update_query = """
            UPDATE hive 
            SET name = %(name)s, description = %(description)s
            WHERE id = %(hive_id)s
        """

        cur.execute(update_query, {
            'name': name,
            'description': description,
            'hive_id': hive_id
        })

        mysql.connection.commit()
        cur.close()

        return jsonify({
            'message': 'Ruche mise à jour avec succès'
        }), 200

    except Exception as e:
        print(f"Erreur lors de la mise à jour de la ruche: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la mise à jour de la ruche'
        }), 500


@hives_bp.route('/delete_apiary', methods=['POST'])
@token_required
def delete_apiary():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('apiaryId'):
            return jsonify({'error': 'ID de rucher non fourni'}), 400

        apiary_id = data.get('apiaryId')

        cur = mysql.connection.cursor()

        # Vérifier que l'utilisateur a accès au rucher
        check_query = """
            SELECT 1 FROM relations_user_apiary
            WHERE user_id_fk = %(user_id)s AND apiary_id_fk = %(apiary_id)s
        """

        cur.execute(check_query, {
            'user_id': user_id,
            'apiary_id': apiary_id
        })

        if not cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Accès non autorisé à ce rucher'
            }), 403

        try:
            # Supprimer la relation utilisateur-rucher
            delete_relation_query = """
                DELETE FROM relations_user_apiary 
                WHERE apiary_id_fk = %(apiary_id)s 
                AND user_id_fk = %(user_id)s
            """
            cur.execute(delete_relation_query, {
                'apiary_id': apiary_id,
                'user_id': user_id
            })

            # Vérifier s'il reste des relations pour ce rucher
            check_relations_query = """
                SELECT COUNT(*) FROM relations_user_apiary
                WHERE apiary_id_fk = %(apiary_id)s
            """
            cur.execute(check_relations_query, {'apiary_id': apiary_id})
            remaining_relations = cur.fetchone()[0]

            # Si c'était le dernier utilisateur, supprimer le rucher et ses ruches
            if remaining_relations == 0:
                delete_hives_query = "DELETE FROM hive WHERE apiary_id_fk = %(apiary_id)s"
                cur.execute(delete_hives_query, {'apiary_id': apiary_id})

                delete_apiary_query = "DELETE FROM apiary WHERE id = %(apiary_id)s"
                cur.execute(delete_apiary_query, {'apiary_id': apiary_id})

            mysql.connection.commit()

            return jsonify({
                'message': 'Rucher supprimé avec succès'
            }), 200

        except Exception as e:
            mysql.connection.rollback()
            raise e

        finally:
            cur.close()

    except Exception as e:
        print(f"Erreur lors de la suppression du rucher: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la suppression du rucher'
        }), 500


@hives_bp.route('/delete_hive', methods=['POST'])
@token_required
def delete_hive():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not data or not data.get('hiveId'):
            return jsonify({'error': 'ID de ruche non fourni'}), 400

        hive_id = data.get('hiveId')

        cur = mysql.connection.cursor()

        # Vérifier que l'utilisateur a accès à la ruche via le rucher
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
            cur.close()
            return jsonify({
                'error': 'Accès non autorisé à cette ruche'
            }), 403

        try:
            # Supprimer la ruche
            delete_query = "DELETE FROM hive WHERE id = %(hive_id)s"
            cur.execute(delete_query, {'hive_id': hive_id})

            mysql.connection.commit()

            return jsonify({
                'message': 'Ruche supprimée avec succès'
            }), 200

        except Exception as e:
            mysql.connection.rollback()
            raise e

        finally:
            cur.close()

    except Exception as e:
        print(f"Erreur lors de la suppression de la ruche: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la suppression de la ruche'
        }), 500


@hives_bp.route('/delete_analysis', methods=['POST'])
@token_required
def delete_analysis():
    try:
        user_id = request.user_id
        data = request.get_json()

        if not user_id:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        if not data:
            return jsonify({'error': 'Données non fournies'}), 400

        analysis_id = data.get('analysisId')

        cur = mysql.connection.cursor()

        # Vérifier que l'utilisateur a accès à cette analyse
        check_query = """
            SELECT 1 FROM analysis
            INNER JOIN hive ON hive.id = analysis.hive_id_fk
            INNER JOIN apiary ON apiary.id = hive.apiary_id_fk
            INNER JOIN relations_user_apiary rua ON rua.apiary_id_fk = apiary.id
            WHERE analysis.id = %(analysis_id)s AND rua.user_id_fk = %(user_id)s
        """

        cur.execute(check_query, {
            'analysis_id': analysis_id,
            'user_id': user_id
        })

        if not cur.fetchone():
            cur.close()
            return jsonify({
                'error': 'Analyse non trouvée ou accès non autorisé'
            }), 403

        try:
            # Supprimer l'analyse
            delete_query = "DELETE FROM analysis WHERE id = %(analysis_id)s"
            cur.execute(delete_query, {'analysis_id': analysis_id})

            mysql.connection.commit()

            return jsonify({
                'message': 'Analyse supprimée avec succès'
            }), 200

        except Exception as e:
            mysql.connection.rollback()
            raise e

        finally:
            cur.close()

    except Exception as e:
        print(f"Erreur lors de la suppression de l'analyse: {str(e)}")
        return jsonify({
            'error': 'Une erreur est survenue lors de la suppression de l\'analyse'
        }), 500
