"""ML inference adapter integrating FastAPI request lifecycle with real_estate_ml package.

Provides environment-driven artifact resolution, eager startup loading and validation,
resilient health probing, and singleton predictor lifecycle management.
"""

import os
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


def resolve_artifacts_dir() -> Path:
    """Resolve artifacts directory root respecting ESTORA_ARTIFACTS_DIR or defaulting to repository artifacts."""
    env_root = os.getenv("ESTORA_ARTIFACTS_DIR")
    if env_root:
        return Path(env_root)
    default_dir = REPO_ROOT / "ml" / "artifacts"
    if default_dir.exists():
        return default_dir
    return Path("ml/artifacts")


def get_model_and_metadata_paths() -> tuple[Path, Path]:
    """Retrieve verified file paths for the Pune residential sale-price model and metadata."""
    artifacts_root = resolve_artifacts_dir()
    model_path = artifacts_root / "sale_price" / "pune_sale_v1.joblib"
    metadata_path = artifacts_root / "sale_price" / "pune_sale_v1_metadata.json"
    return model_path, metadata_path


def load_sale_predictor() -> SalePricePredictor:
    """Load, validate, and cache the singleton SalePricePredictor eagerly from the configured artifact path."""
    global _SALE_PREDICTOR
    model_path, metadata_path = get_model_and_metadata_paths()

    if not model_path.exists():
        _SALE_PREDICTOR = None
        raise FileNotFoundError(
            f"Approved sale price model artifact not found at {model_path}. "
            "Ensure training pipeline has exported pune_sale_v1."
        )

    try:
        loader = ModelLoader(model_path=model_path, metadata_path=metadata_path)
        # Eagerly deserialize pipeline and manifest metadata using public ModelLoader API
        pipeline, metadata = loader.load()

        if pipeline is None or not hasattr(pipeline, "predict") or not callable(getattr(pipeline, "predict")):
            raise ValueError(
                f"Loaded model artifact from {model_path} is incompatible or non-executable (missing callable predict)."
            )

        if metadata is None or not getattr(metadata, "model_version", None):
            raise ValueError(
                f"Loaded model metadata from {metadata_path} is missing required version tracking attributes."
            )

        _SALE_PREDICTOR = SalePricePredictor(model_loader=loader)
        return _SALE_PREDICTOR
    except Exception:
        _SALE_PREDICTOR = None
        raise


def get_sale_predictor() -> SalePricePredictor:
    """Retrieve the cached singleton SalePricePredictor or initialize it if not loaded."""
    global _SALE_PREDICTOR
    if _SALE_PREDICTOR is None:
        _SALE_PREDICTOR = load_sale_predictor()
    return _SALE_PREDICTOR


def is_sale_predictor_available() -> bool:
    """Check if the sale price predictor is loaded and its pipeline is executable."""
    global _SALE_PREDICTOR
    if _SALE_PREDICTOR is not None:
        try:
            return (
                _SALE_PREDICTOR.loader.pipeline is not None
                and hasattr(_SALE_PREDICTOR.loader.pipeline, "predict")
                and callable(_SALE_PREDICTOR.loader.pipeline.predict)
            )
        except Exception:
            return False
    try:
        predictor = get_sale_predictor()
        return (
            predictor is not None
            and predictor.loader.pipeline is not None
            and hasattr(predictor.loader.pipeline, "predict")
            and callable(predictor.loader.pipeline.predict)
        )
    except Exception:
        return False


def set_sale_predictor(predictor: Optional[SalePricePredictor]) -> None:
    """Explicitly set or mock the singleton predictor (primarily used for test fixtures)."""
    global _SALE_PREDICTOR
    _SALE_PREDICTOR = predictor


def reset_sale_predictor() -> None:
    """Reset the singleton predictor cache."""
    global _SALE_PREDICTOR
    _SALE_PREDICTOR = None


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
