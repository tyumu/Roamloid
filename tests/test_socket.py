def test_socket_connect(socketio, app):
    test_client = socketio.test_client(app)
    received = test_client.get_received()
    system_events = [e for e in received if e['name'] == 'system']
    assert system_events, 'system event not emitted'
    assert system_events[0]['args'][0]['message'] == 'connected'
