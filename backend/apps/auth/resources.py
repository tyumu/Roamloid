from flask import request, jsonify, make_response
from flask_restful import Resource
from flask_login import login_user, logout_user, login_required, current_user
from ..models import db, User
from .validators import SignupValidator, LoginValidator, ChangePasswordValidator


def json_response(obj: dict, status: int = 200):
    """Return a Flask Response with JSON and Content-Length set."""
    resp = make_response(jsonify(obj), status)
    # ensure Content-Type and Content-Length are present
    resp.headers['Content-Type'] = 'application/json'
    return resp


class SignupResource(Resource):
    """User signup resource."""

    validator = SignupValidator()

    def post(self):
        data = request.get_json()
        # Validation
        is_valid, message = self.validator.validate(data)
        if not is_valid:
            return json_response({"error_message": message}, 400)
        # Create new user
        username = data["username"]
        password = data["password"]
        new_user = User(username=username)
        new_user.password = password
        db.session.add(new_user)
        db.session.commit()
        return json_response({"message": "ユーザー登録が成功しました。"}, 201)


class LoginResource(Resource):
    """User login resource."""

    validator = LoginValidator()

    def post(self):
        data = request.get_json()
        # Validation
        is_valid, message = self.validator.validate(data)
        if not is_valid:
            return json_response({"error_message": message}, 400)
        # Authenticate user
        username = data["username"]
        password = data["password"]
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return json_response({"message": "ログインに成功しました。"}, 200)
        return json_response({"error_message": "ユーザー名またはパスワードが正しくありません。"}, 401)


class ChangePasswordResource(Resource):
    """Change user password resource."""

    validator = ChangePasswordValidator()

    @login_required
    def post(self):
        data = request.get_json()
        # Validation
        is_valid, message = self.validator.validate(data)
        if not is_valid:
            return json_response({"error_message": message}, 400)
        # Change password
        old_password = data["old_password"]
        new_password = data["new_password"]
        if current_user and current_user.check_password(old_password):
            current_user.password = new_password
            db.session.commit()
            return json_response({"message": "パスワードが正常に変更されました。"}, 200)
        return json_response({"error_message": "古いパスワードが正しくありません。"}, 401)


class LogoutResource(Resource):
    """User logout resource."""

    @login_required
    def post(self):
        logout_user()
        return json_response({"message": "ログアウトに成功しました。"}, 200)


class UserDetailResource(Resource):
    """Get user details resource."""

    @login_required
    def get(self):
        if current_user:
            return json_response({"id": current_user.id, "username": current_user.username}, 200)
        return json_response({"error_message": "ユーザーが見つかりません。"}, 404)


class DeleteUserResource(Resource):
    """Delete user resource."""

    @login_required
    def delete(self):
        user = current_user
        if user:
            db.session.delete(user)
            db.session.commit()
            logout_user()
            return json_response({"message": "ユーザーが正常に削除されました。"}, 200)
        return json_response({"error_message": "ユーザーが見つかりません。"}, 404)


# helper defined above
