"""Predictor class serving validated single and batch inferences."""

from pathlib import Path
from typing import Any
import numpy as np

from real_estate_ml.inference.input_validation import (
    prepare_inference_dataframe,
    validate_sale_prediction_input,
)
from real_estate_ml.inference.model_loader import ModelLoader


class SalePricePredictor:
    """Production-ready inference service for Pune residential property valuation."""

    def __init__(self, model_loader: ModelLoader | None = None, model_path: Path | None = None):
        self.loader = model_loader or ModelLoader(model_path=model_path)

    def predict(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Generate structured price prediction for a single property.

        Args:
            input_data: Raw input dictionary containing property features.

        Returns:
            Structured prediction dictionary matching SRS Section 13 contract.
        """
        # 1. Validate inputs strictly
        validated_dict = validate_sale_prediction_input(input_data)
        df_single = prepare_inference_dataframe(validated_dict)

        # 2. Execute inference pipeline
        pipeline = self.loader.pipeline
        raw_pred = pipeline.predict(df_single)[0]

        # 3. Post-prediction integrity guarantees
        if not np.isfinite(raw_pred) or raw_pred < 0:
            raise RuntimeError(
                f"Prediction integrity error: model returned non-finite or negative value: {raw_pred}"
            )

        price_lakhs = round(float(raw_pred), 2)
        metadata = self.loader.metadata

        return {
            "estimated_price_lakhs": price_lakhs,
            "estimated_price_inr": int(round(price_lakhs * 100000)),
            "currency": "INR",
            "currency_unit": metadata.target_currency_unit,
            "model_name": metadata.model_name,
            "model_version": metadata.model_version,
            "supported_geography": metadata.supported_geography["city"] + ", " + metadata.supported_geography["state"],
            "disclaimer": metadata.limitations_and_disclaimer,
        }

    def predict_batch(self, inputs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Generate structured price predictions for a batch of properties."""
        return [self.predict(item) for item in inputs]
