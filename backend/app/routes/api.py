from flask import Blueprint
from ..errors import ok

api_bp = Blueprint('api', __name__)

@api_bp.get('/hello')
def hello():
    return ok({'message': 'Hello, World! (moved)'})
