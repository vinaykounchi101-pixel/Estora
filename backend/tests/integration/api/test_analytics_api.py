"""Integration tests for Analytics API endpoints (/api/v1/analytics)."""

from fastapi.testclient import TestClient


SAMPLE_PROPERTY = {
    "square_ft": 1000.0,
    "bhk_no": 2,
    "latitude": 18.59,
    "longitude": 73.76,
    "posted_by": "Owner",
    "address": "Kothrud,Pune",
    "rera": 1,
    "ready_to_move": 1,
    "resale": 1,
}


def test_user_analytics_summary_empty(client: TestClient, auth_headers: dict):
    """Verify analytics summary for a new user with zero predictions."""
    res = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_predictions"] == 0
    assert data["sale_predictions"] == 0
    assert data["average_sale_estimate_lakhs"] is None
    assert len(data["recent_predictions"]) == 0


def test_user_analytics_summary_with_predictions(client: TestClient, auth_headers: dict):
    """Verify analytics aggregates correctly calculate count and average after predictions."""
    # Submit 2 predictions
    client.post(
        "/api/v1/predictions",
        json={"prediction_type": "sale_price", "property_inputs": SAMPLE_PROPERTY},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/predictions",
        json={"prediction_type": "sale_price", "property_inputs": {**SAMPLE_PROPERTY, "square_ft": 1400.0}},
        headers=auth_headers,
    )

    res = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_predictions"] == 2
    assert data["sale_predictions"] == 2
    assert data["average_sale_estimate_lakhs"] is not None
    assert data["average_sale_estimate_lakhs"] > 0
    assert len(data["recent_predictions"]) == 2


def test_user_analytics_unauthorized(client: TestClient):
    """Verify unauthorized request returns 401."""
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 401
