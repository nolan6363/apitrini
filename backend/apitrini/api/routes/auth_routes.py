from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
import re
import os
from apitrini.core.infrastructure.db import mysql

auth_bp = Blueprint('auth', __name__)

# Configuration depuis les variables d'environnement
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_secret_key')  # À changer en production
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
PASSWORD_MIN_LENGTH = int(os.environ.get('PASSWORD_MIN_LENGTH', 8))


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        try:
            token = token.split(" ")[1]  # Retirer "Bearer "
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except Exception as e:
            print(f"Erreur de validation du token: {str(e)}")
            return jsonify({'error': f'Token invalide: {str(e)}'}), 401
        return f(*args, **kwargs)

    return decorated


def validate_email(email):
    return bool(EMAIL_REGEX.match(email))


def validate_password(password):
    return len(password) >= PASSWORD_MIN_LENGTH


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email et mot de passe requis'}), 400

        email = data['email'].lower()
        password = data['password']
        first_name = data['first_name']
        last_name = data['last_name']

        if not data.get('first_name') or not data.get('last_name'):
            return jsonify({'error': 'Prénom et nom requis'}), 400

        if not validate_email(email):
            return jsonify({'error': 'Format d\'email invalide'}), 400

        if not validate_password(password):
            return jsonify({'error': f'Le mot de passe doit contenir au moins {PASSWORD_MIN_LENGTH} caractères'}), 400

        cur = mysql.connection.cursor()

        # Vérifier si l'email existe déjà
        cur.execute("SELECT id FROM user WHERE email = %s", (email,))
        user = cur.fetchone()

        if user:
            cur.close()
            return jsonify({'error': 'Cet email est déjà utilisé'}), 409

        # Créer le nouvel utilisateur
        hashed_password = generate_password_hash(password)
        cur.execute(
            "INSERT INTO user (email, password_hash, created_at, first_name, last_name) VALUES (%s, %s, %s, %s, %s)",
            (email, hashed_password, datetime.utcnow(), first_name, last_name)
        )
        mysql.connection.commit()
        new_user_id = cur.lastrowid
        cur.close()

        return jsonify({
            'message': 'Inscription réussie',
            'user': {
                'id': new_user_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        }), 201

    except Exception as e:
        print(f"Erreur lors de l'inscription: {str(e)}")
        return jsonify({'error': f'Erreur lors de l\'inscription: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email et mot de passe requis'}), 400

        email = data['email'].lower()
        password = data['password']

        cur = mysql.connection.cursor()
        cur.execute("SELECT id, email, password_hash FROM user WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()

        if user and check_password_hash(user[2], password):
            token = jwt.encode({
                'user_id': user[0],
                'email': user[1],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, SECRET_KEY)

            return jsonify({
                'token': token,
                'user': {
                    'id': user[0],
                    'email': user[1]
                }
            })

        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

    except Exception as e:
        print(f"Erreur lors de la connexion: {str(e)}")
        return jsonify({'error': f'Erreur lors de la connexion: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_user():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT id, email, created_at 
            FROM user 
            WHERE id = %s
        """, (request.user_id,))
        user = cur.fetchone()
        cur.close()

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        return jsonify({
            'user': {
                'id': user[0],
                'email': user[1],
                'created_at': user[2].isoformat() if user[2] else None
            }
        })

    except Exception as e:
        print(f"Erreur lors de la récupération du profil: {str(e)}")
        return jsonify({'error': f'Erreur lors de la récupération du profil: {str(e)}'}), 500