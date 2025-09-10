from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from .routes.api import api_bp
from .routes.health import health_bp
from .config.settings import load_settings
from .services.firebase import init_firebase
from .errors import register_error_handlers

socketio = SocketIO(cors_allowed_origins="*")


def create_app() -> Flask:
    app = Flask(__name__)

    # Load configuration
    settings = load_settings()
    app.config.update(settings.as_flask_config())

    # Extensions
    CORS(app, resources={r"/api/*": {"origins": settings.cors_origins}})
    socketio.init_app(app)

    # Initialize socket events after socketio is configured
    from .realtime.socket_events import init_socket_events
    init_socket_events(socketio)

    # Services initialization (lazy where possible)
    init_firebase(settings)

    # Blueprints
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(api_bp, url_prefix="/api")

    # Error handlers & logging
    register_error_handlers(app)

    _configure_logging(settings)

    return app


def _configure_logging(settings):
    import logging, os
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format='%(asctime)s %(levelname)s %(name)s %(message)s'
    )


app = create_app()
