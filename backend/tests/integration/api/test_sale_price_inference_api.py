"""Integration and API contract tests for stateless sale-price ML inference.

Tests endpoint: POST /api/v1/predictions/sale-price
Covers:
- Valid prediction with full schema verification
- Precise unit conversion (lakhs to INR)
- Rejection of missing fields
- Out-of-bounds geographic coordinates
- Out-of-bounds physical ranges (area, BHK, binary flags)
- Unknown category and micro-market behavior
- Dependency override using deterministic fake predictor
- Model unavailable (503 Service Unavailable) handling
- Readiness probe reflecting model availability while liveness remains 200 OK
- Client-safe error formatting with zero stack trace leakage
- Real-artifact local smoke test
"""

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import pytest

from app.api.dependencies import get_sale_predictor_dependency
from app.integrations.ml_inference import (
    get_sale_predictor,
    reset_sale_predictor,
    set_sale_predictor,
)
from app.main import app

VALID_PROPERTY_PAYLOAD = {
    "square_ft": 1050.0,
    "bhk_no": 2,
    "latitude": 18.598,
    "longitude": 73.763,
    "posted_by": "Dealer",
    "address": "Wakad,Pune",
    "rera": 1,
    "ready_to_move": 1,
    "resale": 1,
}


class FakePredictor:
    """Deterministic fake predictor for unit and contract isolation."""

    def predict(self, inputs: dict) -> dict:
        return {
            "estimated_price_lakhs": 75.50,
            "estimated_price_inr": 7550000,
            "currency": "INR",
            "currency_unit": "INR Lakhs",
            "model_name": "fake_pune_model",
            "model_version": "1.0.0-test",
            "supported_geography": "Pune, Maharashtra",
            "disclaimer": "Test decision support disclaimer",
        }


# =====================================================================
# 1. Valid Prediction & Response Contract Tests
# =====================================================================

def test_sale_price_prediction_valid_contract(client: TestClient):
    """Verify POST /api/v1/predictions/sale-price returns 200 and conforms to schema."""
    res = client.post("/api/v1/predictions/sale-price", json=VALID_PROPERTY_PAYLOAD)
    assert res.status_code == 200, res.text

    data = res.json()
    assert "estimated_price_lakhs" in data
    assert "estimated_price_inr" in data
    assert data["estimated_price_lakhs"] > 0
    assert isinstance(data["estimated_price_lakhs"], float)
    assert isinstance(data["estimated_price_inr"], int)

    # Verify money conversions
    expected_inr = int(round(data["estimated_price_lakhs"] * 100000))
    assert data["estimated_price_inr"] == expected_inr

    assert data["currency"] == "INR"
    assert data["currency_unit"] == "INR Lakhs"
    assert data["prediction_type"] == "sale_price"
    assert data["model_name"] == "estora_pune_residential_sale_price"
    assert data["model_version"] == "1.0.0"
    assert "Pune, Maharashtra" in data["supported_geography"]
    assert "Estora Decision Support Disclaimer" in data["disclaimer"]
    assert "circa-2020" in data["disclaimer"]


def test_sale_price_prediction_dependency_override(client: TestClient):
    """Verify endpoint functions with dependency injection override using FakePredictor."""
    fake = FakePredictor()
    app.dependency_overrides[get_sale_predictor_dependency] = lambda: fake
    try:
        res = client.post("/api/v1/predictions/sale-price", json=VALID_PROPERTY_PAYLOAD)
        assert res.status_code == 200
        data = res.json()
        assert data["estimated_price_lakhs"] == 75.50
        assert data["estimated_price_inr"] == 7550000
        assert data["model_name"] == "fake_pune_model"
        assert data["model_version"] == "1.0.0-test"
    finally:
        app.dependency_overrides.pop(get_sale_predictor_dependency, None)


# =====================================================================
# 2. Missing Fields & Schema Validation (422)
# =====================================================================

@pytest.mark.parametrize("missing_field", [
    "square_ft",
    "bhk_no",
    "latitude",
    "longitude",
    "posted_by",
    "address",
    "rera",
    "ready_to_move",
    "resale",
])
def test_sale_price_prediction_missing_required_fields(client: TestClient, missing_field: str):
    """Verify omitting any of the 9 required fields returns 422 Unprocessable Entity."""
    payload = VALID_PROPERTY_PAYLOAD.copy()
    del payload[missing_field]

    res = client.post("/api/v1/predictions/sale-price", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == 422


# =====================================================================
# 3. Invalid Ranges and Domain Bounds (422)
# =====================================================================

@pytest.mark.parametrize("field,bad_value", [
    ("square_ft", 100.0),    # Below MIN_AREA_SQFT (150.0)
    ("square_ft", 10000.0),  # Above MAX_AREA_SQFT (8000.0)
    ("bhk_no", 0),           # Below MIN_BHK (1)
    ("bhk_no", 15),          # Above MAX_BHK (10)
    ("latitude", 17.50),     # Below Pune min lat (17.90)
    ("latitude", 19.80),     # Above Pune max lat (19.30)
    ("longitude", 72.87),    # Below Pune min lon (Mumbai: 72.87 < 73.20)
    ("longitude", 76.10),    # Above Pune max lon (75.30)
    ("posted_by", "Agent"),  # Invalid category (must be Owner/Dealer/Builder)
    ("rera", 2),             # Binary flag must be 0 or 1
    ("ready_to_move", -1),   # Binary flag must be 0 or 1
    ("resale", 5),           # Binary flag must be 0 or 1
])
def test_sale_price_prediction_invalid_ranges(client: TestClient, field: str, bad_value):
    """Verify values outside defined physical and geographic ranges return 422."""
    payload = VALID_PROPERTY_PAYLOAD.copy()
    payload[field] = bad_value

    res = client.post("/api/v1/predictions/sale-price", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["error"]["code"] == 422


# =====================================================================
# 4. Unknown Category & Micro-market Behavior
# =====================================================================

def test_sale_price_prediction_novel_address_handling(client: TestClient):
    """Verify unobserved micro-market address is gracefully handled by pipeline."""
    payload = VALID_PROPERTY_PAYLOAD.copy()
    payload["address"] = "NovelMicroMarketArea,Pune"

    res = client.post("/api/v1/predictions/sale-price", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_price_lakhs"] > 0
    assert data["estimated_price_inr"] > 0


# =====================================================================
# 5. Model Unavailable & Error Safety Tests (503)
# =====================================================================

def test_sale_price_prediction_model_unavailable(client: TestClient):
    """Verify endpoint returns clean 503 when the model artifact cannot be accessed."""
    def broken_predictor():
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail="ML inference engine is currently unavailable. Model artifact is not loaded.",
        )

    app.dependency_overrides[get_sale_predictor_dependency] = broken_predictor
    try:
        res = client.post("/api/v1/predictions/sale-price", json=VALID_PROPERTY_PAYLOAD)
        assert res.status_code == 503
        data = res.json()
        assert data["error"]["code"] == 503
        assert "unavailable" in data["error"]["message"].lower()
        # Verify no traceback is exposed in client response
        assert "Traceback" not in res.text
        assert "File \"" not in res.text
    finally:
        app.dependency_overrides.pop(get_sale_predictor_dependency, None)


# =====================================================================
# 6. Readiness & Liveness Probe Decoupling
# =====================================================================

def test_readiness_probe_with_inference_available(client: TestClient):
    """Verify readiness returns 200 OK when model and DB are healthy."""
    res = client.get("/api/v1/health/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["dependencies"]["database"] == "connected"
    assert data["dependencies"]["model_artifacts"] == "available"


def test_readiness_probe_degraded_when_model_unavailable(client: TestClient):
    """Verify readiness returns 503 when model is unavailable while liveness remains 200 OK."""
    with patch("app.api.v1.endpoints.health.is_sale_predictor_available", return_value=False):
        ready_res = client.get("/api/v1/health/ready")
        assert ready_res.status_code == 503
        data = ready_res.json()
        assert data["status"] == "not_ready"
        assert data["dependencies"]["model_artifacts"] == "unavailable"

        # Liveness probe must remain 200 OK
        live_res = client.get("/api/v1/health/live")
        assert live_res.status_code == 200
        assert live_res.json()["status"] == "live"


# =====================================================================
# 7. Real Artifact Smoke Test (Distinguished from Fake Tests)
# =====================================================================

def test_real_artifact_inference_smoke_test():
    """Direct standalone smoke test executing against the real on-disk artifact.

    Explicitly verifies real .joblib pipeline reload, feature encoding,
    and mathematical consistency.
    """
    reset_sale_predictor()
    predictor = get_sale_predictor()
    assert predictor is not None
    assert predictor.loader.pipeline is not None

    result = predictor.predict(VALID_PROPERTY_PAYLOAD)
    assert result["estimated_price_lakhs"] > 10.0
    assert result["estimated_price_lakhs"] < 2000.0
    assert result["estimated_price_inr"] == int(round(result["estimated_price_lakhs"] * 100000))
    assert result["currency"] == "INR"
    assert result["model_version"] == "1.0.0"
    assert "historical circa-2020" in result["disclaimer"]


# =====================================================================
# 8. Eager Lifespan Preload & Artifact Resilience Tests
# =====================================================================

def test_lifespan_eager_model_preload(client: TestClient):
    """Verify that during lifespan startup, the model pipeline is eagerly deserialized and validated."""
    predictor = get_sale_predictor()
    assert predictor is not None
    # Pipeline is already in memory and has callable predict
    assert predictor.loader.pipeline is not None
    assert callable(predictor.loader.pipeline.predict)
    assert predictor.loader.metadata.model_version == "1.0.0"


def test_lifespan_startup_with_missing_artifact(tmp_path, db_session):
    """Verify missing artifact is safely caught during startup, leaving readiness 503 while liveness remains 200."""
    reset_sale_predictor()
    missing_joblib = tmp_path / "non_existent.joblib"
    missing_meta = tmp_path / "non_existent.json"

    with patch("app.integrations.ml_inference.get_model_and_metadata_paths", return_value=(missing_joblib, missing_meta)):
        with TestClient(app) as test_client:
            # Liveness must remain healthy
            live_res = test_client.get("/api/v1/health/live")
            assert live_res.status_code == 200
            assert live_res.json()["status"] == "live"

            # Readiness must report degraded
            ready_res = test_client.get("/api/v1/health/ready")
            assert ready_res.status_code == 503
            assert ready_res.json()["dependencies"]["model_artifacts"] == "unavailable"

            # Prediction endpoint must return 503
            pred_res = test_client.post("/api/v1/predictions/sale-price", json=VALID_PROPERTY_PAYLOAD)
            assert pred_res.status_code == 503
            assert pred_res.json()["error"]["code"] == 503

    reset_sale_predictor()


def test_lifespan_startup_with_corrupt_artifact(tmp_path, db_session):
    """Verify corrupt joblib binary is caught during startup, logging error and keeping liveness 200."""
    reset_sale_predictor()
    corrupt_joblib = tmp_path / "corrupt.joblib"
    corrupt_joblib.write_bytes(b"CORRUPT_INVALID_BINARY_DATA_NOT_JOBLIB")

    corrupt_meta = tmp_path / "corrupt_metadata.json"
    corrupt_meta.write_text('{"model_name": "test", "model_version": "1.0.0"}')

    with patch("app.integrations.ml_inference.get_model_and_metadata_paths", return_value=(corrupt_joblib, corrupt_meta)):
        with TestClient(app) as test_client:
            live_res = test_client.get("/api/v1/health/live")
            assert live_res.status_code == 200

            ready_res = test_client.get("/api/v1/health/ready")
            assert ready_res.status_code == 503
            assert ready_res.json()["dependencies"]["model_artifacts"] == "unavailable"

            pred_res = test_client.post("/api/v1/predictions/sale-price", json=VALID_PROPERTY_PAYLOAD)
            assert pred_res.status_code == 503

    reset_sale_predictor()


def test_load_sale_predictor_rejects_non_executable_artifact(tmp_path):
    """Verify that an artifact lacking a callable predict() method is rejected as incompatible."""
    import joblib
    from real_estate_ml.artifacts.metadata import build_sale_price_metadata, save_metadata
    from app.integrations.ml_inference import load_sale_predictor

    reset_sale_predictor()

    non_exec_joblib = tmp_path / "non_exec.joblib"
    joblib.dump({"some": "dict_not_a_model"}, non_exec_joblib)

    valid_meta = tmp_path / "non_exec_metadata.json"
    meta_obj = build_sale_price_metadata(model_version="1.0.0-test")
    save_metadata(meta_obj, valid_meta)

    with patch("app.integrations.ml_inference.get_model_and_metadata_paths", return_value=(non_exec_joblib, valid_meta)):
        with pytest.raises(ValueError) as exc_info:
            load_sale_predictor()
        assert "incompatible or non-executable" in str(exc_info.value)

    reset_sale_predictor()
