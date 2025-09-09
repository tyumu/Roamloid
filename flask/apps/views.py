from flask import Blueprint, jsonify


api = Blueprint("api", __name__)


@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})
