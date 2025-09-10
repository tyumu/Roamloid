from __future__ import annotations
from flask_socketio import emit

# Import will be resolved when this module is imported
socketio = None

def init_socket_events(socketio_instance):
    """Initialize socket events with the socketio instance."""
    global socketio
    socketio = socketio_instance
    
    # Register event handlers
    @socketio.on('connect')
    def on_connect():
        emit('system', {'message': 'connected'})

    @socketio.on('disconnect')
    def on_disconnect():
        # No emit needed; just placeholder
        pass
