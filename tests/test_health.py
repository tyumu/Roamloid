def test_health(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['ok'] is True
    assert data['data']['status'] == 'ok'
