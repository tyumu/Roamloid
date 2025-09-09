import pytest
from backend.app import create_app, socketio as _socketio


@pytest.fixture(scope="session")
def app():
    return create_app()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def socketio(app):
    return _socketio
