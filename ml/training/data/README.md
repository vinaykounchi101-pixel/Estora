# Estora Machine Learning Data Directory

This directory organizes datasets across strict lifecycle partitions according to Estora ML data governance rules (PRD Section 4 & SRS Section 5).

---

## Directory Partition Structure

```text
ml/training/data/
├── README.md               # Directory governance, provenance protocol, and audit runbook
├── raw/                    # Untouched original datasets as acquired (gitignored)
├── interim/                # Intermediate, cleaned, or normalized datasets (gitignored)
├── processed/              # Feature-engineered, train/test split datasets (gitignored)
└── external/               # Public benchmarks, geographic reference shapefiles, or postal lookup tables
```

### Partition Principles
1. **`raw/` (Immutable Source of Truth)**:
   - Contains raw, unaltered source files (`.csv`, `.zip`, `.xlsx`).
   - Files placed here are never manually modified, renamed, deleted, or overwritten.
   - Completely gitignored (except `.gitkeep`).
2. **`interim/` (Standardized & Sanitized)**:
   - Output of automated cleaning routines (e.g., standardizing locality spellings, unit conversions from sq. yards to sq. ft.).
   - Completely gitignored (except `.gitkeep`).
3. **`processed/` (Model-Ready Partitions)**:
   - Train and held-out test splits generated *before* fitting data-dependent transformers.
   - Separate splits for sale price and rental rate models.
   - Completely gitignored (except `.gitkeep`).
4. **`external/` (Third-Party Context)**:
   - Census data, GIS coordinates, Pune ward maps, or metro station coordinates.

---

## Provenance & Governance Protocol

Before any dataset is admitted into the training pipeline, it must be recorded with:
1. **Source Identification**: Origin URL, publishing platform, or organization.
2. **Licensing**: Verify license terms (e.g., CC0, MIT, ODbL) and usage restrictions.
3. **Price Semantics**: Clearly label whether values reflect **asking/listing prices** or **actual registered transaction prices**.
4. **Target Segregation**: Sale price datasets and rental rate datasets are strictly segregated; never conflate sale prices with rental rates.
5. **Synthetic Data Isolation**: Synthetic benchmarks are strictly segregated and may only be used for pipeline unit testing, baseline comparisons, and CI validation.

---

## How to Rerun the Dataset Audit

The reproducible audit script inspects all files present in `raw/` and updates the structured audit report:

```bash
# Run audit and output console summary
python ml/training/scripts/audit_datasets.py

# Run audit and export detailed JSON metrics report
python ml/training/scripts/audit_datasets.py --output-json ml/training/reports/dataset_audit_metrics.json
```

### Supported Formats & Optional Dependencies
- **CSV & ZIP**: Audited out of the box using Python's standard library.
- **JSON**: Audited out of the box.
- **Excel (XLSX/XLS)**: Requires `openpyxl` (for `.xlsx`) or `xlrd` (for `.xls`). If missing, the script gracefully reports missing dependencies and continues.
- **Pandas**: Optional; script operates with zero required third-party packages for pure standard library portability.

---

## How to Run the Phase 1 Data Preparation Pipeline

To prepare the clean, validated Pune residential sale price development dataset:

```bash
# Execute Phase 1 non-destructive data preparation pipeline
python ml/training/scripts/prepare_data.py
```

This ingests `ml/training/data/raw/real_estate_dataset_cleaned (1).zip`, applies Pune geographic bounding box constraints, filters area [150, 8000] and price [<= 1500 Lakhs], and outputs:
- **Processed Dataset**: `ml/training/data/processed/pune_sale_prices.csv` (1,833 records, Gitignored)
- **Preparation Report**: `ml/training/reports/pune_sales_data_prep_summary.json`

