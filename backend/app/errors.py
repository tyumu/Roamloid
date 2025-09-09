"""Central error handling and response helpers."""
from __future__ import annotations
from flask import jsonify, Flask
from werkzeug.exceptions import HTTPException
import traceback
import os


def ok(data=None, **extra):  # success wrapper
    payload = {"ok": True}
    if data is not None:
        payload["data"] = data
    if extra:
        payload.update(extra)
    return jsonify(payload)


def error(message: str, status: int = 400, **extra):
    payload = {"ok": False, "error": {"message": message}}
    if extra:
        payload["error"].update(extra)  # type: ignore
    return jsonify(payload), status


def register_error_handlers(app: Flask):
    @app.errorhandler(HTTPException)
    def handle_http(exc: HTTPException):
        return error(exc.description, exc.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected(exc: Exception):
        debug = app.debug or os.getenv("DEBUG", "0") == "1"
        tb = traceback.format_exc() if debug else None
        return error("internal_error", 500, traceback=tb)

__all__ = ["ok", "error", "register_error_handlers"]
