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
                apiary.created_at
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
            'createdAt': apiary[4].isoformat() if apiary[4] else None
        } for apiary in apiaries]

        return jsonify(formatted_apiaries), 200

    except Exception as e:
        print("Erreur dans la récupération des ruchers: ", str(e))
        return jsonify({'error': 'Erreur dans la récupération des ruchers'}), 500