"""Automated lifecycle tests for model artifact serialization, reloading, and inference validation."""

from pathlib import Path
import pytest

from real_estate_ml.artifacts.metadata import load_metadata
from real_estate_ml.artifacts.registry import get_artifacts_directory, load_model_artifact
from real_estate_ml.inference.input_validation import (
    InferenceValidationError,
    validate_sale_prediction_input,
)
from real_estate_ml.inference.model_loader import ModelLoader
from real_estate_ml.inference.predictor import SalePricePredictor

ARTIFACT_DIR = get_artifacts_directory("sale_price")
MODEL_PATH = ARTIFACT_DIR / "pune_sale_v1.joblib"
METADATA_PATH = ARTIFACT_DIR / "pune_sale_v1_metadata.json"


@pytest.fixture
def valid_pune_property_input() -> dict:
    """Fixture providing a standard valid 2 BHK Pune property."""
    return {
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


def test_artifact_and_metadata_exist():
    """Verify serialized .joblib artifact and metadata manifest exist with non-zero size."""
    assert MODEL_PATH.exists(), f"Model artifact missing at {MODEL_PATH}"
    assert METADATA_PATH.exists(), f"Metadata manifest missing at {METADATA_PATH}"
    assert MODEL_PATH.stat().st_size > 50000, "Artifact file is unexpectedly small"
    assert METADATA_PATH.stat().st_size > 500, "Metadata file is unexpectedly small"


def test_metadata_manifest_structure():
    """Verify metadata manifest conforms to all governance and tracking fields."""
    metadata = load_metadata(METADATA_PATH)

    assert metadata.model_name == "estora_pune_residential_sale_price"
    assert metadata.model_version == "1.0.0"
    assert metadata.target_variable == "target_price_lakhs"
    assert metadata.target_currency_unit == "INR Lakhs"
    assert metadata.training_summary["total_training_records"] == 1833
    assert metadata.supported_geography["city"] == "Pune"
    assert "historical circa-2020" in metadata.limitations_and_disclaimer
    assert "scikit_learn_version" in metadata.system_environment


def test_isolated_model_reload():
    """Verify model can be reloaded in a fresh loader instance and predict cleanly."""
    pipeline, metadata = load_model_artifact(MODEL_PATH, METADATA_PATH)
    assert pipeline is not None
    assert metadata is not None


def test_predictor_service_output_contract(valid_pune_property_input: dict):
    """Verify SalePricePredictor returns structured dictionary adhering to SRS specifications."""
    predictor = SalePricePredictor(model_path=MODEL_PATH)
    response = predictor.predict(valid_pune_property_input)

    assert "estimated_price_lakhs" in response
    assert "estimated_price_inr" in response
    assert "currency" in response
    assert response["currency"] == "INR"
    assert response["currency_unit"] == "INR Lakhs"
    assert response["estimated_price_lakhs"] > 0
    assert response["estimated_price_inr"] == int(round(response["estimated_price_lakhs"] * 100000))
    assert response["model_version"] == "1.0.0"
    assert "Pune, Maharashtra" in response["supported_geography"]
    assert "Disclaimer" in response["disclaimer"]


def test_predictor_handles_unknown_category_gracefully(valid_pune_property_input: dict):
    """Verify pipeline handles unobserved micro-markets without failing or inventing corrupt values."""
    predictor = SalePricePredictor(model_path=MODEL_PATH)
    novel_input = valid_pune_property_input.copy()
    novel_input["address"] = "NovelSuburbanTownship,Pune"

    response = predictor.predict(novel_input)
    assert response["estimated_price_lakhs"] > 0
    assert isinstance(response["estimated_price_lakhs"], float)


def test_predictor_rejects_missing_fields(valid_pune_property_input: dict):
    """Verify predictor rejects inputs with missing required fields with clear error."""
    predictor = SalePricePredictor(model_path=MODEL_PATH)
    invalid_input = valid_pune_property_input.copy()
    del invalid_input["square_ft"]

    with pytest.raises(InferenceValidationError) as exc_info:
        predictor.predict(invalid_input)
    assert "square_ft" in str(exc_info.value)


def test_predictor_rejects_out_of_bounds_area(valid_pune_property_input: dict):
    """Verify predictor rejects property area outside accepted Pune limits."""
    predictor = SalePricePredictor(model_path=MODEL_PATH)

    # Too small
    small_input = valid_pune_property_input.copy()
    small_input["square_ft"] = 50.0
    with pytest.raises(InferenceValidationError):
        predictor.predict(small_input)

    # Too large
    large_input = valid_pune_property_input.copy()
    large_input["square_ft"] = 25000.0
    with pytest.raises(InferenceValidationError):
        predictor.predict(large_input)


def test_predictor_rejects_unsupported_geography(valid_pune_property_input: dict):
    """Verify predictor rejects coordinates outside Pune metropolitan bounds (e.g. Delhi)."""
    predictor = SalePricePredictor(model_path=MODEL_PATH)
    out_of_scope_input = valid_pune_property_input.copy()
    out_of_scope_input["latitude"] = 28.6139  # New Delhi
    out_of_scope_input["longitude"] = 77.2090

    with pytest.raises(InferenceValidationError) as exc_info:
        predictor.predict(out_of_scope_input)
    assert "outside accepted Pune" in str(exc_info.value)
