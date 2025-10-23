from flask_restful import Resource
from ..auth.resources import json_response


class HealthCheckResource(Resource):
    """Health check resource returning the standard response shape."""

    def get(self):
        return json_response({"ok": True, "data": {"status": "ok"}}, 200)
