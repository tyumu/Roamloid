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
    # Allow routes without strict trailing slash enforcement to avoid
    # automatic 308 redirects when tests call endpoints without a trailing slash.
    app.url_map.strict_slashes = False

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})

    # Load configuration
    app.config.from_pyfile("settings.py")

    # Login manager setup
    login_manager.init_app(app)

    # Initialize SocketIO for both runtime and tests so socketio.test_client
    # can be used. The socketio instance lives in apps.room.socketio.
    from .room.socketio import socketio
    socketio.init_app(app, cors_allowed_origins="*")

    # API setup
    health_api.init_app(app)
    auth_api.init_app(app)

    # Database setup
    db.init_app(app)
    Migrate(app, db)

    return app
