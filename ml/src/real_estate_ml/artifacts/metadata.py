"""Artifact metadata definition, serialization, and validation."""

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any
import joblib
import numpy as np
import pandas as pd
import sklearn


@dataclass
class ModelArtifactMetadata:
    """Structured manifest recording provenance, schema, metrics, and environment."""

    model_name: str
    model_version: str
    target_variable: str
    target_currency_unit: str
    supported_geography: dict[str, Any]
    feature_schema: dict[str, str]
    training_summary: dict[str, Any]
    validation_metrics: dict[str, Any]
    system_environment: dict[str, str]
    limitations_and_disclaimer: str
    created_at_utc: str

    def to_dict(self) -> dict[str, Any]:
        """Convert metadata to JSON-serializable dictionary."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ModelArtifactMetadata":
        """Reconstruct ModelArtifactMetadata instance from dictionary."""
        return cls(**data)


def build_sale_price_metadata(
    model_version: str = "1.0.0",
    training_rows: int = 1833,
    validation_metrics: dict[str, Any] | None = None,
) -> ModelArtifactMetadata:
    """Construct standard metadata manifest for the Pune sale price model."""
    feature_schema = {
        "square_ft": "float (built-up area in sq. ft., range: [150.0, 8000.0])",
        "bhk_no": "int (bedroom count, range: [1, 10])",
        "latitude": "float (decimal degrees, Pune scope: [17.9, 19.3])",
        "longitude": "float (decimal degrees, Pune scope: [73.2, 75.3])",
        "posted_by": "str (category: ['Owner', 'Dealer', 'Builder'])",
        "address": "str (micro-market identifier, e.g., 'Baner,Pune', 'Wakad,Pune')",
        "rera": "int (binary flag: 0 = non-RERA, 1 = RERA approved)",
        "ready_to_move": "int (binary flag: 0 = under construction, 1 = ready)",
        "resale": "int (binary flag: 0 = new booking, 1 = resale)",
    }

    supported_geography = {
        "city": "Pune",
        "district": "Pune District",
        "state": "Maharashtra",
        "country": "India",
        "accepted_latitude_bounds": [17.9, 19.3],
        "accepted_longitude_bounds": [73.2, 75.3],
    }

    training_summary = {
        "dataset_name": "pune_sale_prices.csv",
        "source_archive": "real_estate_dataset_cleaned (1).zip",
        "total_training_records": training_rows,
        "feature_count": len(feature_schema),
        "target_column": "target_price_lakhs",
        "price_basis": "Listing asking prices (historical circa-2020)",
    }

    metrics = validation_metrics or {
        "cv_mae_lakhs": 16.07,
        "cv_mae_std_lakhs": 0.98,
        "cv_rmse_lakhs": 31.71,
        "cv_r2": 0.834,
        "holdout_mae_lakhs": 17.35,
        "holdout_medae_lakhs": 8.41,
        "holdout_rmse_lakhs": 40.71,
        "holdout_r2": 0.8066,
    }

    import sys

    system_environment = {
        "python_version": sys.version.split()[0],
        "scikit_learn_version": sklearn.__version__,
        "joblib_version": joblib.__version__,
        "numpy_version": np.__version__,
        "pandas_version": pd.__version__,
    }

    disclaimer = (
        "Estora Decision Support Disclaimer: This model was trained on historical circa-2020 "
        "portal listing asking prices and serves as an engineering baseline for platform development. "
        "Predictions reflect asking rates rather than verified registered transaction deed values, "
        "and substantial Pune market appreciation has occurred since 2020. Commercial licensing "
        "for the underlying portal dataset remains unresolved. Predictions should not be used as "
        "legal appraisal or financial investment advice."
    )

    return ModelArtifactMetadata(
        model_name="estora_pune_residential_sale_price",
        model_version=model_version,
        target_variable="target_price_lakhs",
        target_currency_unit="INR Lakhs",
        supported_geography=supported_geography,
        feature_schema=feature_schema,
        training_summary=training_summary,
        validation_metrics=metrics,
        system_environment=system_environment,
        limitations_and_disclaimer=disclaimer,
        created_at_utc=datetime.now(timezone.utc).isoformat(),
    )


def save_metadata(metadata: ModelArtifactMetadata, output_path: Path) -> Path:
    """Save ModelArtifactMetadata instance to a JSON file."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metadata.to_dict(), f, indent=2)
    return output_path


def load_metadata(metadata_path: Path) -> ModelArtifactMetadata:
    """Load and parse ModelArtifactMetadata from a JSON file."""
    metadata_path = Path(metadata_path)
    if not metadata_path.exists():
        raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
    with open(metadata_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return ModelArtifactMetadata.from_dict(data)
