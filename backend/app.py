"""Compatibility shim: expose create_app and socketio at backend.app

Some tests import `backend.app.create_app`; the real application factory
lives in `backend/apps/__init__.py`. This module re-exports the factory and
the socketio instance so tests and other callers can import from
`backend.app`.
"""
from apps import create_app
from apps.room.socketio import socketio

__all__ = ["create_app", "socketio"]
