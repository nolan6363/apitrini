from flask import Flask
from flask_cors import CORS
from apitrini.api.routes.image_routes import image_bp


def create_app():
    app = Flask(__name__)
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://frontend:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Enregistrement des blueprints
    app.register_blueprint(image_bp, url_prefix='/api/images')

    return app
