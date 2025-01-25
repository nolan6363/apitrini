from flask import Flask
from flask_cors import CORS
from apitrini.api.routes.image_routes import image_bp


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    # Enregistrement des blueprints
    app.register_blueprint(image_bp, url_prefix='/api/images')

    return app
