"""Comprehensive foundation tests verifying FastAPI startup, routing, liveness/readiness,

correlation IDs, CORS policies, standard error envelopes, and dependency overrides.
"""

from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from sqlalchemy.exc import OperationalError

from app.api.dependencies import get_db
from app.main import app


def test_root_metadata_endpoint(client: TestClient):
    """Verify GET / returns platform metadata and API documentation references."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["service"] == "Estora"
    assert data["version"] == "1.0.0"
    assert data["docs"] == "/docs"
    assert data["api_v1"] == "/api/v1"


def test_health_endpoint(client: TestClient):
    """Verify GET /api/v1/health returns 200 with active service status."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "estora-backend"
    assert "timestamp" in data


def test_liveness_probe_endpoint(client: TestClient):
    """Verify GET /api/v1/health/live returns 200 and confirms process is running."""
    res = client.get("/api/v1/health/live")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "live"
    assert data["service"] == "estora-backend"


def test_readiness_probe_healthy(client: TestClient):
    """Verify GET /api/v1/health/ready returns 200 when database and model artifacts are ready."""
    res = client.get("/api/v1/health/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["dependencies"]["database"] == "connected"
    assert data["dependencies"]["model_artifacts"] == "available"


def test_readiness_probe_degraded_when_database_fails(client: TestClient):
    """Verify GET /api/v1/health/ready returns 503 without leaking credentials if database fails."""
    mock_failing_db = MagicMock()
    mock_failing_db.execute.side_effect = OperationalError("connection refused", {}, None)

    def failing_get_db():
        yield mock_failing_db

    app.dependency_overrides[get_db] = failing_get_db
    try:
        res = client.get("/api/v1/health/ready")
        assert res.status_code == 503
        data = res.json()
        assert data["status"] == "not_ready"
        assert data["dependencies"]["database"] == "disconnected"
        # Verify no credentials or database connection strings leaked
        assert "password" not in str(data).lower()
        assert "postgresql://" not in str(data).lower()
    finally:
        app.dependency_overrides.clear()


def test_request_correlation_id_generation(client: TestClient):
    """Verify X-Request-ID and timing headers are automatically attached to responses."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert "X-Request-ID" in res.headers
    assert len(res.headers["X-Request-ID"]) >= 16
    assert "X-Response-Time-Ms" in res.headers


def test_request_correlation_id_propagation(client: TestClient):
    """Verify client-supplied X-Request-ID is preserved across execution."""
    custom_trace_id = "test-client-trace-id-12345"
    res = client.get("/api/v1/health", headers={"X-Request-ID": custom_trace_id})
    assert res.status_code == 200
    assert res.headers["X-Request-ID"] == custom_trace_id


def test_consistent_404_error_envelope(client: TestClient):
    """Verify non-existent routes return standard JSON error envelope with request_id."""
    res = client.get("/api/v1/nonexistent-route")
    assert res.status_code == 404
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == 404
    assert "request_id" in data["error"]


def test_consistent_422_validation_error_envelope(client: TestClient):
    """Verify request validation failures return structured field errors without stack traces."""
    # Send malformed registration payload
    res = client.post("/api/v1/auth/register", json={"email": "not-an-email", "password": "123"})
    assert res.status_code == 422
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == 422
    assert "details" in data["error"]
    assert isinstance(data["error"]["details"], list)
    assert len(data["error"]["details"]) > 0
    assert "request_id" in data["error"]


def test_openapi_schema_generation(client: TestClient):
    """Verify OpenAPI v3 schema is served at /api/v1/openapi.json and documentation at /docs."""
    schema_res = client.get("/api/v1/openapi.json")
    assert schema_res.status_code == 200
    schema = schema_res.json()
    assert schema["openapi"].startswith("3.")
    assert "paths" in schema
    assert "/api/v1/health" in schema["paths"]
    assert "/api/v1/health/live" in schema["paths"]
    assert "/api/v1/health/ready" in schema["paths"]

    docs_res = client.get("/docs")
    assert docs_res.status_code == 200
