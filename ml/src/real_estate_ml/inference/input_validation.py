"""Input validation and schema verification for model inference requests."""

from typing import Any
import pandas as pd

# Required features matching training schema
REQUIRED_PREDICTOR_FIELDS = [
    "square_ft",
    "bhk_no",
    "latitude",
    "longitude",
    "posted_by",
    "address",
    "rera",
    "ready_to_move",
    "resale",
]

# Physical and geographic domain boundaries for Pune
MIN_AREA_SQFT = 150.0
MAX_AREA_SQFT = 8000.0
MIN_BHK = 1
MAX_BHK = 10

PUNE_MIN_LAT = 17.90
PUNE_MAX_LAT = 19.30
PUNE_MIN_LON = 73.20
PUNE_MAX_LON = 75.30

VALID_POSTED_BY = {"Owner", "Dealer", "Builder"}


class InferenceValidationError(ValueError):
    """Raised when an inference input fails schema, range, or geographic constraints."""

    pass


def validate_sale_prediction_input(data: dict[str, Any]) -> dict[str, Any]:
    """Validate a single property input dictionary before passing to the pipeline.

    Args:
        data: Raw dictionary from API request or client.

    Returns:
        Cleaned, typed dictionary ready for inference DataFrame conversion.

    Raises:
        InferenceValidationError: If required fields are missing or out of valid bounds.
    """
    if not isinstance(data, dict):
        raise InferenceValidationError(f"Expected input as dictionary, received: {type(data).__name__}")

    # 1. Check for missing required fields
    missing_fields = [f for f in REQUIRED_PREDICTOR_FIELDS if f not in data or data[f] is None]
    if missing_fields:
        raise InferenceValidationError(
            f"Missing required prediction fields: {missing_fields}. "
            f"All fields {REQUIRED_PREDICTOR_FIELDS} must be provided."
        )

    cleaned: dict[str, Any] = {}

    # 2. Validate square_ft
    try:
        sqft = float(data["square_ft"])
    except (ValueError, TypeError):
        raise InferenceValidationError(f"Invalid square_ft '{data['square_ft']}'; must be a positive number.")

    if sqft < MIN_AREA_SQFT or sqft > MAX_AREA_SQFT:
        raise InferenceValidationError(
            f"square_ft {sqft} is outside supported Pune domain limits [{MIN_AREA_SQFT}, {MAX_AREA_SQFT}]."
        )
    cleaned["square_ft"] = sqft

    # 3. Validate bhk_no
    try:
        bhk = int(data["bhk_no"])
    except (ValueError, TypeError):
        raise InferenceValidationError(f"Invalid bhk_no '{data['bhk_no']}'; must be an integer.")

    if bhk < MIN_BHK or bhk > MAX_BHK:
        raise InferenceValidationError(f"bhk_no {bhk} is outside accepted range [{MIN_BHK}, {MAX_BHK}].")
    cleaned["bhk_no"] = bhk

    # 4. Validate coordinates
    try:
        lat = float(data["latitude"])
        lon = float(data["longitude"])
    except (ValueError, TypeError):
        raise InferenceValidationError("latitude and longitude must be valid floating-point numbers.")

    if lat < PUNE_MIN_LAT or lat > PUNE_MAX_LAT:
        raise InferenceValidationError(
            f"latitude {lat} is outside accepted Pune metropolitan bounds [{PUNE_MIN_LAT}, {PUNE_MAX_LAT}]."
        )
    if lon < PUNE_MIN_LON or lon > PUNE_MAX_LON:
        raise InferenceValidationError(
            f"longitude {lon} is outside accepted Pune metropolitan bounds [{PUNE_MIN_LON}, {PUNE_MAX_LON}]."
        )
    cleaned["latitude"] = lat
    cleaned["longitude"] = lon

    # 5. Validate posted_by
    posted_by = str(data["posted_by"]).strip()
    if posted_by not in VALID_POSTED_BY:
        # Default or fallback with warning rather than silent crash, but reject arbitrary strings
        raise InferenceValidationError(
            f"Invalid posted_by '{posted_by}'; must be one of {sorted(VALID_POSTED_BY)}."
        )
    cleaned["posted_by"] = posted_by

    # 6. Validate address
    address = str(data["address"]).strip()
    if not address:
        raise InferenceValidationError("address cannot be empty.")
    cleaned["address"] = address

    # 7. Validate binary flags
    for flag in ["rera", "ready_to_move", "resale"]:
        try:
            val = int(data[flag])
        except (ValueError, TypeError):
            raise InferenceValidationError(f"Field '{flag}' must be binary 0 or 1.")
        if val not in (0, 1):
            raise InferenceValidationError(f"Field '{flag}' must be 0 or 1, got {val}.")
        cleaned[flag] = val

    return cleaned


def prepare_inference_dataframe(inputs: list[dict[str, Any]] | dict[str, Any]) -> pd.DataFrame:
    """Validate and convert raw input dictionary or list of dicts to inference DataFrame."""
    if isinstance(inputs, dict):
        inputs = [inputs]

    validated_rows = [validate_sale_prediction_input(item) for item in inputs]
    return pd.DataFrame(validated_rows)[REQUIRED_PREDICTOR_FIELDS]
