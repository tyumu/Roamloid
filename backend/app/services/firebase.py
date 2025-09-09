from __future__ import annotations
from typing import Any

_initialized = False


def init_firebase(settings: Any):  # settings: Settings (avoid circular import for simplicity)
    global _initialized
    if _initialized:
        return
    # Lazy import so environments without firebase_admin installed (yet) don't break immediately.
    try:
        import firebase_admin  # type: ignore
        from firebase_admin import credentials  # type: ignore
    except ImportError:
        # Optional until feature implemented
        return

    if settings.firebase_credentials:
        import json, os, tempfile
        data = settings.firebase_credentials
        # Expect raw JSON or a file path; detect by leading '{'
        if data.strip().startswith('{'):
            with tempfile.NamedTemporaryFile('w', delete=False, suffix='.json') as f:
                f.write(data)
                cred_path = f.name
        else:
            cred_path = data
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        if not firebase_admin._apps:  # type: ignore
            firebase_admin.initialize_app()
    _initialized = True
