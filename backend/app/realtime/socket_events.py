from __future__ import annotations
from flask_socketio import emit
from .. import socketio

# Basic connection events (placeholder for presence / conversation logic)

@socketio.on('connect')
def on_connect():
    emit('system', {'message': 'connected'})

@socketio.on('disconnect')
def on_disconnect():
    # No emit needed; just placeholder
    pass
