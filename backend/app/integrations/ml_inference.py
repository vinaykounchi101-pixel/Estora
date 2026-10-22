"""ML inference adapter integrating FastAPI request lifecycle with real_estate_ml package.

Ensures safe artifact loading, bounds checking, and structured response mapping.
"""

from pathlib import Path
import sys
from typing import Any, Optional

# Ensure ml/src is importable
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ML_SRC = REPO_ROOT / "ml" / "src"
if str(ML_SRC) not in sys.path:
    sys.path.insert(0, str(ML_SRC))

from real_estate_ml.inference.model_loader import ModelLoader
from real_estate_ml.inference.predictor import SalePricePredictor
from real_estate_ml.inference.input_validation import InferenceValidationError

_SALE_PREDICTOR: Optional[SalePricePredictor] = None


def get_sale_predictor() -> SalePricePredictor:
    """Retrieve or lazily initialize the singleton SalePricePredictor."""
    global _SALE_PREDICTOR
    if _SALE_PREDICTOR is None:
        model_path = REPO_ROOT / "ml" / "artifacts" / "sale_price" / "pune_sale_v1.joblib"
        metadata_path = REPO_ROOT / "ml" / "artifacts" / "sale_price" / "pune_sale_v1_metadata.json"

        if not model_path.exists():
            raise FileNotFoundError(
                f"Approved sale price model artifact not found at {model_path}. "
                "Ensure training pipeline has exported pune_sale_v1."
            )

        loader = ModelLoader(model_path=model_path, metadata_path=metadata_path)
        _SALE_PREDICTOR = SalePricePredictor(model_loader=loader)
    return _SALE_PREDICTOR


def run_sale_inference(inputs: dict[str, Any]) -> dict[str, Any]:
    """Execute validated inference against the approved Pune sale model.

    Args:
        inputs: Dictionary of property attributes matching schema.

    Returns:
        Structured prediction output containing estimated_price_lakhs, currency, disclaimer, etc.

    Raises:
        InferenceValidationError: If inputs violate geographic bounds or categorical constraints.
    """
    predictor = get_sale_predictor()
    return predictor.predict(inputs)
