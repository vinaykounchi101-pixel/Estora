"""
Validation schemas, boundary configurations, and geometric constraints
for Estora residential real estate data preparation pipelines.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


@dataclass(frozen=True)
class GeographicBounds:
    """Geographic bounding box constraints for Pune metropolitan region."""
    min_latitude: float = 17.80
    max_latitude: float = 19.30
    min_longitude: float = 73.20
    max_longitude: float = 75.20

    # Broad Maharashtra boundary to identify severe out-of-state geocoding errors
    state_min_latitude: float = 15.60
    state_max_latitude: float = 22.10
    state_min_longitude: float = 72.60
    state_max_longitude: float = 80.90


@dataclass(frozen=True)
class PreparationConfig:
    """Configurable thresholds and rules for Pune sale price data preparation."""
    target_city: str = "pune"
    min_area_sqft: float = 150.0
    max_area_sqft: float = 8000.0
    max_price_lakhs: float = 1500.0
    geo_bounds: GeographicBounds = field(default_factory=GeographicBounds)
    target_column: str = "TARGET(PRICE_IN_LACS)"
    address_column: str = "ADDRESS"
    area_column: str = "SQUARE_FT"
    latitude_column: str = "LATITUDE"
    longitude_column: str = "LONGITUDE"

    required_columns: Tuple[str, ...] = (
        "POSTED_BY",
        "UNDER_CONSTRUCTION",
        "RERA",
        "BHK_NO.",
        "BHK_OR_RK",
        "SQUARE_FT",
        "READY_TO_MOVE",
        "RESALE",
        "ADDRESS",
        "LONGITUDE",
        "LATITUDE",
        "TARGET(PRICE_IN_LACS)",
    )


@dataclass
class StageAccounting:
    """Detailed row count tracking for each transformation step."""
    initial_rows: int = 0
    missing_required_columns: int = 0
    excluded_non_pune_address: int = 0
    retained_pune_address: int = 0
    excluded_blank_coords: int = 0
    excluded_out_of_state_coords: int = 0
    excluded_out_of_district_coords: int = 0
    retained_geo_valid: int = 0
    excluded_invalid_target: int = 0
    excluded_target_above_threshold: int = 0
    retained_target_valid: int = 0
    excluded_area_below_min: int = 0
    excluded_area_above_max: int = 0
    retained_area_valid: int = 0
    excluded_duplicates: int = 0
    final_retained_rows: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "initial_rows": self.initial_rows,
            "missing_required_columns": self.missing_required_columns,
            "stage_1_address_selection": {
                "retained": self.retained_pune_address,
                "excluded_non_pune": self.excluded_non_pune_address,
            },
            "stage_2_geographic_validation": {
                "retained": self.retained_geo_valid,
                "excluded_blank_coordinates": self.excluded_blank_coords,
                "excluded_out_of_state": self.excluded_out_of_state_coords,
                "excluded_out_of_district": self.excluded_out_of_district_coords,
                "total_excluded_geo": (
                    self.excluded_blank_coords
                    + self.excluded_out_of_state_coords
                    + self.excluded_out_of_district_coords
                ),
            },
            "stage_3_target_validation": {
                "retained": self.retained_target_valid,
                "excluded_invalid_or_non_positive": self.excluded_invalid_target,
                "excluded_above_1500_lakhs": self.excluded_target_above_threshold,
            },
            "stage_4_area_validation": {
                "retained": self.retained_area_valid,
                "excluded_below_150_sqft": self.excluded_area_below_min,
                "excluded_above_8000_sqft": self.excluded_area_above_max,
            },
            "stage_5_deduplication": {
                "retained": self.final_retained_rows,
                "excluded_duplicates": self.excluded_duplicates,
            },
            "final_processed_rows": self.final_retained_rows,
            "total_records_filtered_out": self.initial_rows - self.final_retained_rows,
        }
