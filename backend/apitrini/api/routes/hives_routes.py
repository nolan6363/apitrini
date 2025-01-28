from flask import Blueprint, request, jsonify
from apitrini.api.routes.auth_routes import token_required
from apitrini.core.infrastructure.db import mysql

hives_bp = Blueprint('hives', __name__)


@hives_bp.route('/get_apiary_list', methods=['POST'])
@token_required
def get_apiary_list():
    try:
        user_id = request.user_id

        if not user_id:
            return jsonify({'error': 'Identifiant utilisateur requis'}), 400

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT apiary.id, apiary.name, apiary.location, (SELECT COUNT(*) FROM hive WHERE apiary_id_fk = apiary.id) as hive_count
            FROM apiary 
            INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
            WHERE relations_user_apiary.user_id_fk = %s
        """, (user_id,))

        apiaries = cur.fetchall()
        cur.close()

        # Formatage des données pour le frontend
        formatted_apiaries = [{
            'id': apiary[0],
            'name': apiary[1],
            'localisation': apiary[2],
            'hiveNumber': apiary[3]
        } for apiary in apiaries]

        return jsonify(formatted_apiaries), 200

    except Exception as e:
        print("Erreur dans la récupération des ruchers: ", str(e))
        return jsonify({'error': 'Erreur dans la récupération des ruchers'}), 500


@hives_bp.route('/get_hive_list', methods=['POST'])
@token_required
def get_hive_list():
    try:
        user_id = request.user_id

        if not user_id:
            return jsonify({'error': 'Identifiant utilisateur requis'}), 400

        apiary_id = request.json.get('apiaryId')

        if not apiary_id:
            return jsonify({'error': 'Identifiant rucher requis'}), 400

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT hive.id, hive.name, apiary.name, hive.created_at 
            FROM hive
            INNER JOIN (
                SELECT apiary.id, apiary.name
                FROM apiary
                INNER JOIN relations_user_apiary ON relations_user_apiary.apiary_id_fk = apiary.id
                WHERE relations_user_apiary.user_id_fk = %s AND apiary.id = %s
            ) apiary ON hive.apiary_id_fk = apiary.id
        """, (user_id, apiary_id))

        hives = cur.fetchall()
        cur.close()

        # Formatage des données pour le frontend
        formatted_hives = {
            'apiary': {
                'id': apiary_id,
                'name': hives[0][2] if hives else None
            },
            'hives': [{
                'id': hive[0],
                'name': hive[1],
                'createdAt': hive[3].isoformat() if hive[3] else None
            } for hive in hives]
        }

        return jsonify(formatted_hives), 200

    except Exception as e:
        return jsonify({'error': 'Erreur dans la récupération des ruches'}), 500
