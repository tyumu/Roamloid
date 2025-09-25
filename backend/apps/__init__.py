from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .settings import CORS_ORIGINS
from .models import db, login_manager
from .health.urls import health_api
from .auth.urls import auth_api


def create_app():

    # Initialize Flask app
    app = Flask(__name__)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})

    # Load configuration
    app.config.from_pyfile("settings.py")

    # Login manager setup
    login_manager.init_app(app)

    # API setup
    health_api.init_app(app)
    auth_api.init_app(app)

    # Database setup
    db.init_app(app)
    Migrate(app, db)

    return app
