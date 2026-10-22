"""Integration tests for Administrative API endpoints (/api/v1/admin)."""

from fastapi.testclient import TestClient


def test_admin_list_users_as_admin(client: TestClient, admin_headers: dict):
    """Verify administrator can retrieve user list."""
    res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 1
    assert any(u["role"] == "admin" for u in users)


def test_admin_list_users_forbidden_for_standard_user(client: TestClient, auth_headers: dict):
    """Verify standard authenticated user receives 403 Forbidden on admin routes."""
    res = client.get("/api/v1/admin/users", headers=auth_headers)
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]


def test_admin_list_predictions(client: TestClient, admin_headers: dict):
    """Verify administrator can review all submitted prediction records."""
    res = client.get("/api/v1/admin/predictions", headers=admin_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_admin_list_models(client: TestClient, admin_headers: dict):
    """Verify administrator can inspect registered model metadata."""
    res = client.get("/api/v1/admin/models", headers=admin_headers)
    assert res.status_code == 200
    models = res.json()
    assert isinstance(models, list)


def test_admin_system_analytics(client: TestClient, admin_headers: dict):
    """Verify administrator can retrieve operational system-wide totals."""
    res = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "total_predictions" in data
    assert "active_models_count" in data
    assert data["system_status"] == "operational"


def test_admin_routes_unauthenticated(client: TestClient):
    """Verify unauthenticated requests return 401 Unauthorized."""
    assert client.get("/api/v1/admin/users").status_code == 401
    assert client.get("/api/v1/admin/predictions").status_code == 401
    assert client.get("/api/v1/admin/models").status_code == 401
    assert client.get("/api/v1/admin/analytics").status_code == 401
