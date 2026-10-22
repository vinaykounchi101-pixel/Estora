"""
Estora CLI: Pune Sale Price Data Preparation Pipeline

Executes the Phase 1 non-destructive data preparation workflow for the
conditionally approved Pune residential sale-price dataset.

Outputs:
  - Cleaned, validated dataset: ml/training/data/processed/pune_sale_prices.csv
  - Audit & accounting summary: ml/training/reports/pune_sales_data_prep_summary.json
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import sys
from pathlib import Path

# Add ml/src to sys.path so real_estate_ml can be imported cleanly
SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from real_estate_ml.data import (
    PreparationConfig,
    load_csv_from_zip,
    prepare_pune_sales_dataset,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("prepare_pune_sales_data")


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare Pune residential sale price dataset.")
    parser.add_argument(
        "--raw-zip",
        default="ml/training/data/raw/real_estate_dataset_cleaned (1).zip",
        help="Path to raw cleaned dataset zip archive",
    )
    parser.add_argument(
        "--internal-file",
        default="processed/train_cleaned.csv",
        help="Internal CSV filename inside the ZIP archive",
    )
    parser.add_argument(
        "--output-csv",
        default="ml/training/data/processed/pune_sale_prices.csv",
        help="Target path for output processed CSV",
    )
    parser.add_argument(
        "--report-json",
        default="ml/training/reports/pune_sales_data_prep_summary.json",
        help="Path to export JSON preparation audit report",
    )

    args = parser.parse_args()

    raw_zip_path = Path(args.raw_zip).resolve()
    output_csv_path = Path(args.output_csv).resolve()
    report_json_path = Path(args.report_json).resolve()

    logger.info("Initializing Pune Sale Price Data Preparation Pipeline")
    logger.info("Source Archive: %s", raw_zip_path)
    logger.info("Internal Target: %s", args.internal_file)

    if not raw_zip_path.exists():
        logger.error("Raw dataset archive does not exist at: %s", raw_zip_path)
        sys.exit(1)

    # 1. Load data safely from zip
    try:
        raw_rows = load_csv_from_zip(raw_zip_path, internal_filename=args.internal_file)
        logger.info("Successfully loaded %d raw records from archive", len(raw_rows))
    except Exception as e:
        logger.error("Failed to load archive: %s", e)
        sys.exit(1)

    # 2. Run deterministic preparation pipeline
    config = PreparationConfig()
    cleaned_records, accounting = prepare_pune_sales_dataset(raw_rows, config=config)

    logger.info("Pipeline processing complete.")
    logger.info("Initial Records:                  %d", accounting.initial_rows)
    logger.info("Excluded Non-Pune Address:        %d", accounting.excluded_non_pune_address)
    logger.info("Retained Pune Address:            %d", accounting.retained_pune_address)
    logger.info("Excluded Blank Coordinates:       %d", accounting.excluded_blank_coords)
    logger.info("Excluded Out-of-State Coords:     %d", accounting.excluded_out_of_state_coords)
    logger.info("Excluded Out-of-District Coords:  %d", accounting.excluded_out_of_district_coords)
    logger.info("Retained Regional Coords:         %d", accounting.retained_geo_valid)
    logger.info("Excluded Target > 1,500 Lakhs:    %d", accounting.excluded_target_above_threshold)
    logger.info("Excluded Area < 150 SqFt:         %d", accounting.excluded_area_below_min)
    logger.info("Excluded Area > 8,000 SqFt:       %d", accounting.excluded_area_above_max)
    logger.info("Excluded Duplicates:              %d", accounting.excluded_duplicates)
    logger.info("FINAL PREPARED RECORDS:           %d", accounting.final_retained_rows)

    # 3. Export prepared dataset to CSV
    output_csv_path.parent.mkdir(parents=True, exist_ok=True)
    if cleaned_records:
        fieldnames = list(cleaned_records[0].keys())
        with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(cleaned_records)
        logger.info("Saved prepared dataset to: %s", output_csv_path)

    # 4. Export machine-readable report
    report_json_path.parent.mkdir(parents=True, exist_ok=True)
    summary_report = {
        "pipeline_name": "pune_residential_sale_data_preparation",
        "version": "1.0.0",
        "source_archive": str(raw_zip_path),
        "source_internal_entry": args.internal_file,
        "output_dataset": str(output_csv_path),
        "target_variable": "target_price_lakhs",
        "target_currency_units": "INR Lakhs",
        "geographic_scope": {
            "target_city": "Pune",
            "accepted_latitude_bounds": [config.geo_bounds.min_latitude, config.geo_bounds.max_latitude],
            "accepted_longitude_bounds": [config.geo_bounds.min_longitude, config.geo_bounds.max_longitude],
        },
        "filters_applied": {
            "min_area_sqft": config.min_area_sqft,
            "max_area_sqft": config.max_area_sqft,
            "max_price_lakhs": config.max_price_lakhs,
        },
        "accounting": accounting.to_dict(),
    }

    report_json_path.write_text(json.dumps(summary_report, indent=2), encoding="utf-8")
    logger.info("Saved preparation audit summary to: %s", report_json_path)


if __name__ == "__main__":
    main()
