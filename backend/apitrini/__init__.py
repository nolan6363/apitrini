from flask import Flask
from flask_cors import CORS

from apitrini.core.infrastructure.db import mysql
from apitrini.api.routes.image_routes import image_bp
from apitrini.api.routes.auth_routes import auth_bp
from apitrini.api.routes.hives_routes import hives_bp

import os


def create_app():
    app = Flask(__name__)
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://frontend:5173", r"https?://(?:(?:[^.]+\.)?apitrini\.fr|apitrini\.fr)"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
    app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'apitrini')
    app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', '#GetTheBeesToWork/667')
    app.config['MYSQL_DB'] = os.environ.get('MYSQL_DATABASE', 'apitrini_db')

    print("MySQL Config:", {
        'host': app.config['MYSQL_HOST'],
        'user': app.config['MYSQL_USER'],
        'database': app.config['MYSQL_DB']
    })

    mysql.init_app(app)

    # Enregistrement des blueprints
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(hives_bp, url_prefix='/api/hives')

    return app
