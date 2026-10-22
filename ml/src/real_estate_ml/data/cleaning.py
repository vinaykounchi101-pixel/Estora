"""
Data cleaning and preparation pipeline for Pune residential sale prices.

Implements deterministic filtering, boundary validation, and audit tracking
per Estora machine-learning data governance rules.
"""

from __future__ import annotations

import logging
import math
import re
from typing import Any, Dict, List, Optional, Tuple

from real_estate_ml.data.validation import PreparationConfig, StageAccounting

logger = logging.getLogger(__name__)


def extract_locality(address: str) -> str:
    """
    Extract the micro-market locality name from an address string formatted as 'Locality, City'.
    Example: 'Wakad,Pune' -> 'Wakad'
    """
    parts = address.split(",")
    if len(parts) > 1:
        locality = parts[0].strip()
        # Clean any leading/trailing special characters
        return re.sub(r"^[^\w]+|[^\w]+$", "", locality)
    return address.strip()


def prepare_pune_sales_dataset(
    raw_rows: List[Dict[str, str]],
    config: Optional[PreparationConfig] = None,
) -> Tuple[List[Dict[str, Any]], StageAccounting]:
    """
    Execute the Phase 1 non-destructive data preparation pipeline on raw property records.

    Pipeline Stages:
        1. Required schema verification.
        2. City address filtering (records ending in ',Pune' or ', Pune').
        3. Geographic coordinate boundary validation (filtering severe out-of-state/district outliers).
        4. Target price validation (retaining valid positive floats <= max_price_lakhs).
        5. Area boundary validation (retaining area between min_area_sqft and max_area_sqft).
        6. Duplicate removal and locality extraction.

    Returns:
        Tuple of (prepared_records, stage_accounting)
    """
    if config is None:
        config = PreparationConfig()

    accounting = StageAccounting(initial_rows=len(raw_rows))

    if not raw_rows:
        return [], accounting

    # Stage 0: Schema Verification
    first_row = raw_rows[0]
    missing_cols = [c for c in config.required_columns if c not in first_row]
    if missing_cols:
        raise ValueError(f"Input records missing required columns: {missing_cols}")

    # Stage 1: Address Selection
    pune_addressed: List[Dict[str, str]] = []
    target_suffix = f",{config.target_city.lower()}"
    target_suffix_spaced = f", {config.target_city.lower()}"

    for row in raw_rows:
        addr = row.get(config.address_column, "").strip().lower()
        if addr.endswith(target_suffix) or addr.endswith(target_suffix_spaced):
            pune_addressed.append(row)
        else:
            accounting.excluded_non_pune_address += 1

    accounting.retained_pune_address = len(pune_addressed)

    # Stage 2: Geographic Coordinate Validation
    geo_retained: List[Dict[str, str]] = []
    bounds = config.geo_bounds

    for row in pune_addressed:
        lat_str = row.get(config.latitude_column, "").strip()
        lon_str = row.get(config.longitude_column, "").strip()

        if not lat_str or not lon_str:
            accounting.excluded_blank_coords += 1
            continue

        try:
            lat = float(lat_str)
            lon = float(lon_str)
            if math.isnan(lat) or math.isnan(lon) or math.isinf(lat) or math.isinf(lon):
                accounting.excluded_blank_coords += 1
                continue
        except ValueError:
            accounting.excluded_blank_coords += 1
            continue

        # Check out-of-state geocoding errors (e.g. Jaipur, Rajasthan)
        in_state = (
            bounds.state_min_latitude <= lat <= bounds.state_max_latitude
            and bounds.state_min_longitude <= lon <= bounds.state_max_longitude
        )
        if not in_state:
            accounting.excluded_out_of_state_coords += 1
            continue

        # Check accepted regional Pune district boundaries
        in_pune_region = (
            bounds.min_latitude <= lat <= bounds.max_latitude
            and bounds.min_longitude <= lon <= bounds.max_longitude
        )
        if not in_pune_region:
            accounting.excluded_out_of_district_coords += 1
            continue

        geo_retained.append(row)

    accounting.retained_geo_valid = len(geo_retained)

    # Stage 3: Target Validation (Sale price in INR Lakhs)
    target_retained: List[Dict[str, str]] = []

    for row in geo_retained:
        target_str = row.get(config.target_column, "").strip()
        try:
            price = float(target_str)
            if math.isnan(price) or math.isinf(price) or price <= 0.0:
                accounting.excluded_invalid_target += 1
            elif price > config.max_price_lakhs:
                accounting.excluded_target_above_threshold += 1
            else:
                target_retained.append(row)
        except ValueError:
            accounting.excluded_invalid_target += 1

    accounting.retained_target_valid = len(target_retained)

    # Stage 4: Area Validation (SQUARE_FT)
    area_retained: List[Dict[str, str]] = []

    for row in target_retained:
        sqft_str = row.get(config.area_column, "").strip()
        try:
            sqft = float(sqft_str)
            if math.isnan(sqft) or math.isinf(sqft) or sqft < config.min_area_sqft:
                accounting.excluded_area_below_min += 1
            elif sqft > config.max_area_sqft:
                accounting.excluded_area_above_max += 1
            else:
                area_retained.append(row)
        except ValueError:
            accounting.excluded_area_below_min += 1

    accounting.retained_area_valid = len(area_retained)

    # Stage 5: Deduplication and Feature Normalization
    seen_hashes = set()
    cleaned_records: List[Dict[str, Any]] = []

    for row in area_retained:
        # Standardize typed values for export
        record: Dict[str, Any] = {
            "posted_by": row["POSTED_BY"].strip(),
            "under_construction": int(row["UNDER_CONSTRUCTION"]),
            "rera": int(row["RERA"]),
            "bhk_no": int(row["BHK_NO."]),
            "bhk_or_rk": row["BHK_OR_RK"].strip(),
            "square_ft": round(float(row["SQUARE_FT"]), 2),
            "ready_to_move": int(row["READY_TO_MOVE"]),
            "resale": int(row["RESALE"]),
            "address": row["ADDRESS"].strip(),
            "locality": extract_locality(row["ADDRESS"]),
            "longitude": round(float(row["LONGITUDE"]), 6),
            "latitude": round(float(row["LATITUDE"]), 6),
            "target_price_lakhs": round(float(row["TARGET(PRICE_IN_LACS)"]), 2),
        }

        row_tuple = (
            record["posted_by"],
            record["under_construction"],
            record["rera"],
            record["bhk_no"],
            record["bhk_or_rk"],
            record["square_ft"],
            record["ready_to_move"],
            record["resale"],
            record["address"],
            record["longitude"],
            record["latitude"],
            record["target_price_lakhs"],
        )

        if row_tuple in seen_hashes:
            accounting.excluded_duplicates += 1
        else:
            seen_hashes.add(row_tuple)
            cleaned_records.append(record)

    accounting.final_retained_rows = len(cleaned_records)

    return cleaned_records, accounting
