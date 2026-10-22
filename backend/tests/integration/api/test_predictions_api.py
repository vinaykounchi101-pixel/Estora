"""Integration tests for Property Valuation and Prediction API endpoints (/api/v1/predictions)."""

from uuid import uuid4
from fastapi.testclient import TestClient


SAMPLE_PROPERTY = {
    "square_ft": 1150.0,
    "bhk_no": 2,
    "latitude": 18.59,
    "longitude": 73.76,
    "posted_by": "Owner",
    "address": "Wakad,Pune",
    "rera": 1,
    "ready_to_move": 1,
    "resale": 1,
}


def test_create_prediction_as_visitor(client: TestClient):
    """Verify anonymous visitors can obtain an estimate without authentication."""
    payload = {
        "prediction_type": "sale_price",
        "property_inputs": SAMPLE_PROPERTY,
    }
    res = client.post("/api/v1/predictions", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["user_id"] is None
    assert data["prediction_type"] == "sale_price"
    assert data["estimated_price_lakhs"] > 0
    assert data["estimated_price_inr"] > 0
    assert data["currency"] == "INR"
    assert "pune_sale_v1" in data["model_version"] or "1.0.0" in data["model_version"]
    assert "Pune, Maharashtra" in data["supported_geography"]
    assert "Disclaimer" in data["disclaimer"]


def test_create_prediction_as_authenticated_user(client: TestClient, auth_headers: dict):
    """Verify authenticated users can submit predictions and have them linked to their account."""
    payload = {
        "prediction_type": "sale_price",
        "property_inputs": SAMPLE_PROPERTY,
    }
    res = client.post("/api/v1/predictions", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["user_id"] is not None
    assert data["estimated_price_lakhs"] > 0

    # Verify prediction appears in user history
    history_res = client.get("/api/v1/predictions", headers=auth_headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1
    assert any(h["id"] == data["id"] for h in history)


def test_create_prediction_unsupported_monthly_rent_target(client: TestClient):
    """Verify monthly rent target returns structured 400 Bad Request explaining Phase 6 scope."""
    payload = {
        "prediction_type": "monthly_rent",
        "property_inputs": SAMPLE_PROPERTY,
    }
    res = client.post("/api/v1/predictions", json=payload)
    assert res.status_code == 400
    assert "currently unavailable" in res.json()["detail"]


def test_create_prediction_out_of_bounds_area(client: TestClient):
    """Verify extreme property area (e.g. 20,000 sq ft) fails validation with 422."""
    bad_property = {**SAMPLE_PROPERTY, "square_ft": 20000.0}
    payload = {"prediction_type": "sale_price", "property_inputs": bad_property}
    res = client.post("/api/v1/predictions", json=payload)
    assert res.status_code == 422


def test_create_prediction_out_of_bounds_geography(client: TestClient):
    """Verify coordinates outside Pune metropolitan bounds fail validation with 422."""
    # Mumbai coordinates
    bad_property = {**SAMPLE_PROPERTY, "latitude": 19.07, "longitude": 72.87}
    payload = {"prediction_type": "sale_price", "property_inputs": bad_property}
    res = client.post("/api/v1/predictions", json=payload)
    assert res.status_code == 422


def test_get_prediction_detail_owned(client: TestClient, auth_headers: dict):
    """Verify user can fetch detail of their own prediction record."""
    create_res = client.post(
        "/api/v1/predictions",
        json={"prediction_type": "sale_price", "property_inputs": SAMPLE_PROPERTY},
        headers=auth_headers,
    )
    pred_id = create_res.json()["id"]

    detail_res = client.get(f"/api/v1/predictions/{pred_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == pred_id


def test_get_prediction_detail_unauthorized_user(client: TestClient, auth_headers: dict):
    """Verify users cannot access predictions authored by another user."""
    # Create prediction under a different user
    client.post(
        "/api/v1/auth/register",
        json={"email": "other@estora.internal", "password": "Password123!"},
    )
    other_login = client.post(
        "/api/v1/auth/login",
        json={"email": "other@estora.internal", "password": "Password123!"},
    )
    other_token = other_login.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    create_res = client.post(
        "/api/v1/predictions",
        json={"prediction_type": "sale_price", "property_inputs": SAMPLE_PROPERTY},
        headers=other_headers,
    )
    other_pred_id = create_res.json()["id"]

    # Attempt access using the first user's token
    access_res = client.get(f"/api/v1/predictions/{other_pred_id}", headers=auth_headers)
    assert access_res.status_code == 403


def test_get_prediction_not_found(client: TestClient, auth_headers: dict):
    """Verify non-existent UUID returns 404 Not Found."""
    random_id = uuid4()
    res = client.get(f"/api/v1/predictions/{random_id}", headers=auth_headers)
    assert res.status_code == 404
