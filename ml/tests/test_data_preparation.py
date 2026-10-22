"""
Unit tests for Estora Pune residential sale data preparation pipeline.

NOTE: All test cases in this file utilize synthetic, dummy mock fixtures
created exclusively to verify boundary conditions, error handling, and
filtering logic. They do NOT represent real-market property records.
"""

from __future__ import annotations

import pytest
from real_estate_ml.data import (
    GeographicBounds,
    PreparationConfig,
    StageAccounting,
    extract_locality,
    prepare_pune_sales_dataset,
)


def _create_synthetic_row(
    posted_by: str = "Owner",
    under_construction: str = "0",
    rera: str = "1",
    bhk_no: str = "2",
    bhk_or_rk: str = "BHK",
    square_ft: str = "1050.0",
    ready_to_move: str = "1",
    resale: str = "1",
    address: str = "Wakad,Pune",
    longitude: str = "73.7625",
    latitude: str = "18.5993",
    target: str = "65.0",
) -> dict[str, str]:
    """Helper to generate a mock synthetic row for pipeline testing."""
    return {
        "POSTED_BY": posted_by,
        "UNDER_CONSTRUCTION": under_construction,
        "RERA": rera,
        "BHK_NO.": bhk_no,
        "BHK_OR_RK": bhk_or_rk,
        "SQUARE_FT": square_ft,
        "READY_TO_MOVE": ready_to_move,
        "RESALE": resale,
        "ADDRESS": address,
        "LONGITUDE": longitude,
        "LATITUDE": latitude,
        "TARGET(PRICE_IN_LACS)": target,
    }


def test_schema_validation_missing_columns() -> None:
    """Ensure pipeline raises ValueError when required columns are absent."""
    malformed_row = {"ADDRESS": "Wakad,Pune", "SQUARE_FT": "1000"}
    with pytest.raises(ValueError, match="missing required columns"):
        prepare_pune_sales_dataset([malformed_row])


def test_pune_address_inclusion_and_exclusion() -> None:
    """Verify address parsing retains only Pune records and excludes other cities."""
    synthetic_batch = [
        _create_synthetic_row(address="Wakad,Pune"),
        _create_synthetic_row(address="Kharadi, Pune"),
        _create_synthetic_row(address="Baner,PUNE"),
        _create_synthetic_row(address="Ksfc Layout,Bangalore"),
        _create_synthetic_row(address="Bandra West,Mumbai"),
        _create_synthetic_row(address="Undri,Maharashtra"),  # Lacks explicit city
    ]

    cleaned, accounting = prepare_pune_sales_dataset(synthetic_batch)

    assert accounting.initial_rows == 6
    assert accounting.retained_pune_address == 3
    assert accounting.excluded_non_pune_address == 3
    assert len(cleaned) == 3


def test_geographic_coordinate_filtering() -> None:
    """Verify that severe out-of-state, out-of-district, and blank coordinates are excluded."""
    synthetic_batch = [
        # 1. Valid Pune coordinate (PMC/PCMC region)
        _create_synthetic_row(address="Wakad,Pune", latitude="18.5993", longitude="73.7625"),
        # 2. Severe out-of-state error (Jaipur coordinates)
        _create_synthetic_row(address="Keshav Nagar,Pune", latitude="27.16726", longitude="75.7095"),
        # 3. Out-of-district error (Amravati coordinates in northern Maharashtra)
        _create_synthetic_row(address="ZAGADE WASTI,Pune", latitude="21.0000", longitude="77.0000"),
        # 4. Blank latitude
        _create_synthetic_row(address="Hadapsar,Pune", latitude="", longitude="73.9438"),
        # 5. Non-numeric / NaN longitude
        _create_synthetic_row(address="Baner,Pune", latitude="18.5500", longitude="NaN"),
    ]

    cleaned, accounting = prepare_pune_sales_dataset(synthetic_batch)

    assert accounting.retained_pune_address == 5
    assert accounting.retained_geo_valid == 1
    assert accounting.excluded_out_of_state_coords == 1
    assert accounting.excluded_out_of_district_coords == 1
    assert accounting.excluded_blank_coords == 2
    assert len(cleaned) == 1


def test_area_boundary_filtering() -> None:
    """Test inclusive boundaries and exclusion of area outside [150, 8000] sq. ft."""
    synthetic_batch = [
        _create_synthetic_row(square_ft="149.9"),   # Below min
        _create_synthetic_row(square_ft="150.0"),   # Lower boundary
        _create_synthetic_row(square_ft="1250.0"),  # Valid
        _create_synthetic_row(square_ft="8000.0"),  # Upper boundary
        _create_synthetic_row(square_ft="8000.1"),  # Above max
        _create_synthetic_row(square_ft="-10.0"),   # Invalid negative
    ]

    cleaned, accounting = prepare_pune_sales_dataset(synthetic_batch)

    assert accounting.excluded_area_below_min == 2  # 149.9 and -10.0
    assert accounting.excluded_area_above_max == 1  # 8000.1
    assert accounting.retained_area_valid == 3      # 150.0, 1250.0, 8000.0
    assert len(cleaned) == 3


def test_price_target_validation() -> None:
    """Test target price boundaries, non-finite values, and cap at 1,500 Lakhs."""
    synthetic_batch = [
        _create_synthetic_row(target="0.0"),      # Zero
        _create_synthetic_row(target="-25.0"),    # Negative
        _create_synthetic_row(target="invalid"),  # Non-numeric string
        _create_synthetic_row(target="50.0"),     # Valid
        _create_synthetic_row(target="1500.0"),   # Exact upper boundary
        _create_synthetic_row(target="1500.01"),  # Exceeds cap
        _create_synthetic_row(target="3000.0"),   # Extreme luxury outlier
    ]

    cleaned, accounting = prepare_pune_sales_dataset(synthetic_batch)

    assert accounting.excluded_invalid_target == 3         # 0.0, -25.0, invalid
    assert accounting.excluded_target_above_threshold == 2  # 1500.01, 3000.0
    assert accounting.retained_target_valid == 2           # 50.0, 1500.0
    assert len(cleaned) == 2


def test_duplicate_record_handling() -> None:
    """Ensure exact duplicate property rows are removed deterministically."""
    row_a = _create_synthetic_row(address="Wakad,Pune", square_ft="1000.0", target="60.0")
    row_b = _create_synthetic_row(address="Wakad,Pune", square_ft="1000.0", target="60.0")  # Exact twin
    row_c = _create_synthetic_row(address="Baner,Pune", square_ft="1200.0", target="90.0")  # Distinct

    cleaned, accounting = prepare_pune_sales_dataset([row_a, row_b, row_c])

    assert accounting.initial_rows == 3
    assert accounting.excluded_duplicates == 1
    assert accounting.final_retained_rows == 2
    assert len(cleaned) == 2


def test_deterministic_row_count_accounting() -> None:
    """Ensure accounting dictionary mathematically balances across all filter stages."""
    synthetic_batch = [
        _create_synthetic_row(address="Wakad,Pune", square_ft="1000.0", target="50.0"),
        _create_synthetic_row(address="Delhi,Delhi"),                                    # Non-pune
        _create_synthetic_row(address="Aundh,Pune", latitude="28.0", longitude="77.0"), # Out of state
        _create_synthetic_row(address="Baner,Pune", target="-10.0"),                     # Invalid target
        _create_synthetic_row(address="Kharadi,Pune", square_ft="50.0"),                 # Area < 150
        _create_synthetic_row(address="Wakad,Pune", square_ft="1000.0", target="50.0"), # Duplicate of row 0
    ]

    cleaned, accounting = prepare_pune_sales_dataset(synthetic_batch)
    summary = accounting.to_dict()

    assert summary["initial_rows"] == 6
    assert summary["final_processed_rows"] == 1
    assert summary["total_records_filtered_out"] == 5
    assert len(cleaned) == 1


def test_extract_locality_helper() -> None:
    """Verify micro-market extraction from raw address strings."""
    assert extract_locality("Wakad,Pune") == "Wakad"
    assert extract_locality("  Pimple Saudagar  , Pune ") == "Pimple Saudagar"
    assert extract_locality("Bhavani Peth,Pune") == "Bhavani Peth"
    assert extract_locality("StandaloneAddress") == "StandaloneAddress"
