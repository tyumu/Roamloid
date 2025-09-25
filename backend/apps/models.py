from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager
import uuid


db = SQLAlchemy()
login_manager = LoginManager()


def generate_uuid():
    return str(uuid.uuid4())


class User(db.Model, UserMixin):
    """User model."""

    __tablename__ = "user"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  # Hashed password

    @property
    def password(self):
        raise AttributeError("Password is not a readable attribute.")

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(str(id))


class Room(db.Model):
    """Room model."""

    __tablename__ = "room"
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    owner = db.Column(db.String(36), db.ForeignKey("user.id"), nullable=False)
    in_3d = db.Column(db.Boolean, nullable=False, default=False)
    device = db.Column(db.String(80))
