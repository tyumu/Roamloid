from apps import create_app
from apps.room.socketio import socketio
from flask_socketio import SocketIO


app = create_app()
socketio.init_app(app, cors_allowed_origins="*")

if __name__ == "__main__":
    # In development inside WSL we allow the Werkzeug dev server
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
