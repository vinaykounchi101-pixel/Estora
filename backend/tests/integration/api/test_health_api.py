"""Integration tests for Health check endpoint."""

from fastapi.testclient import TestClient


def test_health_check_endpoint(client: TestClient):
    """Verify /api/v1/health returns 200 OK with database connectivity status."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "estora-backend"
    assert data["database"] == "connected"
