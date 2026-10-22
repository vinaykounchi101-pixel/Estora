# Estora — Phase 1: Pune Residential Sale Data Preparation Pipeline

**Document Status:** Formal Implementation & Governance Documentation  
**Module:** `real_estate_ml.data`  
**Execution Script:** [`ml/training/scripts/prepare_data.py`](file:///e:/Projects/Estora/ml/training/scripts/prepare_data.py)  
**Processed Output:** `ml/training/data/processed/pune_sale_prices.csv` (Gitignored)  
**Audit Report Artifact:** [`ml/training/reports/pune_sales_data_prep_summary.json`](file:///e:/Projects/Estora/ml/training/reports/pune_sales_data_prep_summary.json)  
**Test Suite:** [`ml/tests/test_data_preparation.py`](file:///e:/Projects/Estora/ml/tests/test_data_preparation.py)  
**Date:** 2026-10-22  

---

## 1. Overview & Objectives

Phase 1 establishes a **reproducible, deterministic, and non-destructive data preparation pipeline** for Estora's residential sale price estimation model in Pune, Maharashtra.

The pipeline ingests the conditionally approved dataset [`ml/training/data/raw/real_estate_dataset_cleaned (1).zip`](file:///e:/Projects/Estora/ml/training/data/raw/real_estate_dataset_cleaned%20(1).zip), isolates genuine Pune metropolitan properties, strips out severe geocoding errors, applies verified physical and economic boundary constraints, and exports an audit-ready dataset for exploratory data analysis (EDA) and feature engineering.

---

## 2. Source, Provenance & Licensing Governance

### 2.1 Provenance & Collection History
- **Source Platform**: MachineHack / Analytics India Magazine (AIM) — *House Price Prediction Challenge* (August–September 2020).
- **Data Origin**: Aggregated from real-estate listing portals (e.g., MagicBricks, 99acres) across Indian metropolitan areas circa mid-2020.
- **Price Semantics**: **Advertised listing asking prices**, NOT certified government registration transaction records (IGR Maharashtra stamp duty data).
- **Temporal Horizon**: Reflects residential asking prices from approximately 2019–2020. Market price inflation and post-2020 appreciation are not represented.

### 2.2 Unresolved Licensing Restrictions
- **Licensing Status**: **UNRESOLVED / RESTRICTED HACKATHON COMPETITION TERMS**.
- **Commercial Usage Grant**: The original competition rules do not confer a permissive open-source license (such as MIT, Apache 2.0, or CC-BY-4.0).
- **Governance Mandate**:
  - This dataset is restricted to **internal development, pipeline benchmarking, and prototype decision support**.
  - It must **NEVER be represented to end-users as real-time, official government-certified valuation data**.
  - All predictions served using this baseline must carry an explanatory disclaimer.

---

## 3. Inclusion & Exclusion Rules

The pipeline enforces deterministic sequential filtering with full accounting at each stage:

```text
Raw Records in Archive (processed/train_cleaned.csv)
  [29,050 records]
        │
        ▼  Stage 1: Address Selection (Ends with ',Pune' or ', Pune')
  [1,980 records retained / 27,070 excluded]
        │
        ▼  Stage 2: Geographic Coordinate Validation
  [1,846 records retained / 134 excluded: 6 blank, 53 out-of-state, 75 out-of-district]
        │
        ▼  Stage 3: Target Price Validation (0 < Price <= 1,500 Lakhs)
  [1,836 records retained / 10 excluded > 1500 Lakhs]
        │
        ▼  Stage 4: Physical Area Boundary Validation (150 <= SqFt <= 8,000)
  [1,833 records retained / 3 excluded: 1 < 150 SqFt, 2 > 8,000 SqFt]
        │
        ▼  Stage 5: Deduplication Check
  [1,833 records retained / 0 duplicate records]
        │
        ▼
Final Processed Dataset: pune_sale_prices.csv
  [1,833 clean property records]
```

### 3.1 Geographic Bounding Box Definitions
- **Accepted Pune Metropolitan Scope**:
  - Latitude: **17.80° N to 19.30° N**
  - Longitude: **73.20° E to 75.20° E**
  - Encompasses Pune Municipal Corporation (PMC), Pimpri-Chinchwad Municipal Corporation (PCMC), Pune Metropolitan Region Development Authority (PMRDA), and contiguous peri-urban corridors (Talegaon, Chakan, Shirur, Saswad).
- **Severe Out-of-State Geocoding Error Rule**:
  - Properties labeled `,Pune` with coordinates falling outside Maharashtra (Lat < 15.60° or > 22.10°; Lon < 72.60° or > 80.90°) are flagged as automated scraper geocoding failures (e.g., Jaipur coords at Lat 27.16° N) and excluded (53 records).
- **Out-of-District Coordinates**:
  - Properties with coordinates in Nashik (Lat ~20.0°), Amravati (Lat ~21.0°), or Mumbai/Konkan are excluded (75 records).
- **Blank Coordinates**:
  - Properties with missing or non-finite coordinates are excluded (6 records).

### 3.2 Physical & Economic Boundary Constraints
- **Area Constraint**: Properties must have `150.0 <= SQUARE_FT <= 8000.0`.
  - Properties `< 150 sq. ft.` (e.g. tiny 80 sq. ft. storage spaces or input errors) are excluded (1 record).
  - Properties `> 8,000 sq. ft.` (e.g. 10,000+ sq. ft. commercial plots or extreme outliers) are excluded (2 records).
- **Target Price Cap**: Properties must have `0.0 < TARGET <= 1500.0` INR Lakhs (INR 15 Crores).
  - High-end ultra-luxury outliers (`> 1500 Lakhs`, up to INR 9,910 Lakhs) are excluded from the core regression training baseline to prevent high-leverage gradient distortion (10 records).
- **Target-Derived Input Prohibition**: No model features are derived from the target variable. Zero price-per-square-foot features are added to prevent evaluation leakage.

---

## 4. Exact Row Accounting & Audit Breakdown

| Pipeline Stage | Input Records | Excluded Count | Exclusion Reason | Retained Records |
| :--- | :---: | :---: | :--- | :---: |
| **0. Initial Load** | 29,050 | 0 | N/A (Read from `train_cleaned.csv`) | 29,050 |
| **1. Address Selection** | 29,050 | 27,070 | Non-Pune municipal address | 1,980 |
| **2. Geographic Validation** | 1,980 | 134 | 6 blank coords; 53 out-of-state; 75 out-of-district | 1,846 |
| **3. Target Price Validation** | 1,846 | 10 | Target price > INR 1,500 Lakhs | 1,836 |
| **4. Area Validation** | 1,836 | 3 | 1 record < 150 sq ft; 2 records > 8,000 sq ft | 1,833 |
| **5. Deduplication Check** | 1,833 | 0 | No remaining duplicate records | **1,833** |

---

## 5. Schema of Processed Dataset (`pune_sale_prices.csv`)

| Column Name | Data Type | Description & Domain |
| :--- | :---: | :--- |
| `posted_by` | String | Listing creator: `Dealer`, `Owner`, or `Builder` |
| `under_construction` | Integer | Binary flag: `0` = Ready / Completed, `1` = Under Construction |
| `rera` | Integer | Binary flag: `0` = Non-RERA, `1` = RERA Approved statutory compliance |
| `bhk_no` | Integer | Bedroom count: 1, 2, 3, 4, 5, etc. |
| `bhk_or_rk` | String | Unit category: `BHK` (Bedroom-Hall-Kitchen) or `RK` (Room-Kitchen) |
| `square_ft` | Float | Usable / super built-up area in square feet [150.0 to 8000.0] |
| `ready_to_move` | Integer | Binary flag: `0` = Future possession, `1` = Immediate possession |
| `resale` | Integer | Binary flag: `0` = New developer sale, `1` = Resale property |
| `address` | String | Full raw address string (e.g., `Wakad,Pune`, `Baner,Pune`) |
| `locality` | String | Parsed micro-market locality name (e.g., `Wakad`, `Baner`, `Kharadi`) |
| `longitude` | Float | Verified Easting GPS coordinate [73.20 to 75.20] |
| `latitude` | Float | Verified Northing GPS coordinate [17.80 to 19.30] |
| `target_price_lakhs` | Float | **Target**: Sale price in INR Lakhs (1 Lakh = 100,000 INR) |

---

## 6. How to Rerun the Pipeline & Verification Suite

### 6.1 Execute Data Preparation Pipeline
```bash
# Run pipeline from project root
python ml/training/scripts/prepare_data.py
```

### 6.2 Execute Unit Test Suite
```bash
# Run isolated synthetic test suite
python -m pytest ml/tests/test_data_preparation.py -v
```
All 8 test cases verify boundary behaviors, missing column rejection, out-of-scope exclusions, and row accounting using isolated synthetic fixtures.
