# Estora — Comprehensive Dataset Audit Report

**Report Version:** 1.1.0  
**Audit Date:** 2026-10-22  
**Target Geographies:** Pune, Maharashtra, India (Primary) & Selected Indian Metros (Secondary)  
**Auditor:** Antigravity Autonomous Agent (Estora ML Governance Team)  
**Execution Script:** [`ml/training/scripts/audit_datasets.py`](file:///e:/Projects/Estora/ml/training/scripts/audit_datasets.py)  
**Metrics Artifact:** [`ml/training/reports/dataset_audit_metrics.json`](file:///e:/Projects/Estora/ml/training/reports/dataset_audit_metrics.json)  

---

## Executive Summary

Estora requires two distinct machine-learning estimation workflows:
1. **Residential Sale Price Estimation** (target in INR Lakhs / Crores).
2. **Monthly Rental Rate Estimation** (target in INR / month).

An audit was performed across all 8 raw files in [`ml/training/data/raw/`](file:///e:/Projects/Estora/ml/training/data/raw/). No original files were modified, renamed, moved, or deleted.

### Key Audit Findings & Breakthrough Discovery
1. **BREAKTHROUGH: Authentic Pune Residential Data Discovered in `real_estate_dataset_cleaned (1).zip`**:
   - Analysis revealed **6,584 total Pune residential property records** (1,980 labeled training rows in `processed/train_cleaned.csv` + 4,604 test rows in `processed/test_cleaned.csv`).
   - Unlike synthetic sets or fabricated datasets, this dataset provides **authentic Pune micro-market localities** (Baner, Wakad, Kharadi, Hadapsar, Wagholi, NIBM, Hinjewadi, Undri, Balewadi, Ravet, Moshi, Punawale, Pimple Saudagar, Bavdhan).
   - Includes real spatial GPS coordinates (Latitude 18.4°–18.7° N, Longitude 73.7°–73.9° E), real regulatory tags (`RERA`), market types (`RESALE` vs New), readiness (`READY_TO_MOVE`), poster type (`POSTED_BY`: Owner, Dealer, Builder), and construction status.
   - Price metrics closely match real Pune market economics (Median: INR 67.0 Lakhs; 25th percentile: INR 44.5 Lakhs; 75th percentile: INR 100.0 Lakhs).
   - Conservative cleaning already applied: coordinates unswapped, out-of-bounds coordinates blanked, and 401 duplicates purged from training data.
   - **Verdict**: **PRIMARY CANDIDATE FOR ESTORA SALE-PRICE P0 MODEL**.
2. **Geographic Fabrication in `Pune_House_Data.csv` (CRITICAL RISK)**:
   - Analysis revealed `Pune_House_Data.csv` (13,320 rows) is a direct copy of Kaggle's *Bengaluru House Price* dataset, where the original Bangalore localities were replaced by an alphabetical round-robin cycle of 96 Pune locality names (`Alandi Road` through `Yerawada`, repeating ~139 times).
   - **Verdict**: **REJECTED FOR PRODUCTION INFERENCE**. It is toxic for real-market valuation in Pune, though preserved as a unit test fixture for parsing non-standard square footage ranges.
3. **Zero Pune Coverage in Rental Datasets**:
   - Both `House_Rent_Dataset.csv` (clean) and `Indian_House_Rent_Dataset.csv` (corrupted) contain 4,746 rows covering 6 metros (Mumbai, Chennai, Bangalore, Hyderabad, Delhi, Kolkata). **Neither contains a single record from Pune.**
   - `Indian_House_Rent_Dataset.csv` is an artificially damaged homework/exercise variant with 11–20% missing values per column.
   - **Verdict**: **REJECTED FOR PUNE RENT INFERENCE**. A dedicated Pune rental dataset must be ingested before the rental model can be trained.
4. **Synthetic Multi-City Benchmark in `indian-urban-house-price-prediction.zip`**:
   - Contains 80,000 training rows and 20,000 test rows across 10 Indian cities, including 7,833 Pune properties.
   - Features rich structural and spatial signals, but statistical tests confirm synthetic generation (exact uniform categorical distributions and missing micro-market names).
   - **Verdict**: **APPROVED AS PIPELINE BENCHMARK & TEST FIXTURE**, but segregated from empirical market claims per Estora ML governance rules.

---

## Summary of Audited Files

| File Name | Format | Size | Total Rows | Target Variable | Real Pune Coverage | Estora Suitability |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| [`real_estate_dataset_cleaned (1).zip`](file:///e:/Projects/Estora/ml/training/data/raw/real_estate_dataset_cleaned%20(1).zip) | ZIP | 4.04 MB | 97,770 (train: 29,050; test: 68,720) | `TARGET(PRICE_IN_LACS)` | **6,584 records (1,980 labeled train)** | **PRIMARY CANDIDATE FOR P0 SALE-PRICE MODEL** |
| [`Pune_House_Data.csv`](file:///e:/Projects/Estora/ml/training/data/raw/Pune_House_Data.csv) | CSV | 895.71 KB | 13,320 | `price` (INR Lakhs) | 0% (Fabricated Cycle) | **Reject** (Test fixture only) |
| [`House_Rent_Dataset.csv`](file:///e:/Projects/Estora/ml/training/data/raw/House_Rent_Dataset.csv) | CSV | 549.04 KB | 4,746 | `Rent` (INR/month) | 0% (6 other metros) | **Reject for Pune** (Cross-metro schema reference) |
| [`Indian_House_Rent_Dataset.csv`](file:///e:/Projects/Estora/ml/training/data/raw/Indian_House_Rent_Dataset.csv) | CSV | 543.25 KB | 4,746 | `Rent` (INR/month) | 0% (Corrupted duplicate) | **Reject** (Noise-cleaning demo only) |
| [`indian-urban-house-price-prediction.zip`](file:///e:/Projects/Estora/ml/training/data/raw/indian-urban-house-price-prediction.zip) | ZIP | 2.77 MB | 100,000 | `Price_INR_Lakhs` | ~9,813 (7,833 train) | **Approved for Pipeline Benchmark** |
| `Pune house price prediction.ipynb` | IPYNB | 154.25 KB | N/A | None | N/A | Reference EDA & modeling notebook (68 cells) |
| `pune-house-price-prediction.ipynb` | IPYNB | 52.34 KB | N/A | None | N/A | Reference EDA & dummy encoding notebook (32 cells) |
| `Indian_House_Rent.ipynb` | IPYNB | 664.30 KB | N/A | None | N/A | Reference cleaning notebook |
| `house-rental-prediction-machine-learning.ipynb` | IPYNB | 299.56 KB | N/A | None | N/A | Reference EDA notebook |

---

## Detailed Dataset Audits

### 1. `real_estate_dataset_cleaned (1).zip` (PRIMARY SALE CANDIDATE)

#### 1.1 Archive Structure & File Dimensions
- **File Path**: `ml/training/data/raw/real_estate_dataset_cleaned (1).zip`
- **Format**: ZIP archive containing:
  - `CLEANING_REPORT.txt` (2,076 bytes)
  - `processed/train_cleaned.csv`: 29,050 rows $\times$ 12 columns (2.25 MB)
  - `processed/test_cleaned.csv`: 68,720 rows $\times$ 11 columns (4.98 MB)
  - `processed/sample_submission_template_unchanged.csv`: 68,720 rows (0.26 MB)
  - `original/train.csv`: 29,451 rows $\times$ 12 columns (2.29 MB)
  - `original/test.csv`: 68,720 rows $\times$ 11 columns (4.99 MB)
  - `original/sample_submission.csv`: 68,720 rows (0.26 MB)

#### 1.2 Schema in `processed/train_cleaned.csv`
| Column Name | Inferred Type | Missing | Distinct | Notes & Range |
| :--- | :---: | :---: | :---: | :--- |
| `POSTED_BY` | Categorical | 0 | 3 | Dealer (17,926), Owner (10,317), Builder (807) |
| `UNDER_CONSTRUCTION` | Binary | 0 | 2 | 0 = Completed (23,803), 1 = Under Construction (5,247) |
| `RERA` | Binary | 0 | 2 | 0 = No RERA (18,881), 1 = RERA Approved (10,169) |
| `BHK_NO.` | Integer | 0 | 16 | 1 to 20 BHK; mean 2.39 |
| `BHK_OR_RK` | Categorical | 0 | 2 | BHK (29,026), RK (24) |
| `SQUARE_FT` | Float | 0 | 15,861 | Continuous square footage (min 3.0 to extreme outliers) |
| `READY_TO_MOVE` | Binary | 0 | 2 | 0 = No (5,247), 1 = Yes (23,803) |
| `RESALE` | Binary | 0 | 2 | 0 = New Property (2,073), 1 = Resale (26,977) |
| `ADDRESS` | String | 0 | 6,899 | Micro-locality and city (e.g., `Wakad,Pune`, `Baner,Pune`) |
| `LONGITUDE` | Float | 255 | 11,884 | Corrected Longitude; blanked if outside India bounding box |
| `LATITUDE` | Float | 255 | 13,363 | Corrected Latitude; blanked if outside India bounding box |
| `TARGET(PRICE_IN_LACS)` | Float | 0 | 1,172 | **Target**: Sale price in INR Lakhs; min 0.25 to 30,000.0 |

#### 1.3 Pune Specific Partition Analysis (1,980 Train + 4,604 Test)
- **Total Pune Records**: **6,584 residential properties**.
- **Top Pune Localities in Train**:
  - Baner (101), Wagholi (79), Kharadi (76), Wakad (71), NIBM (71), Hadapsar (69), Moshi (58), Balewadi (56), Undri (55), Ravet (55), Hinjewadi (51), Pimple Saudagar (40), Punawale (39), Keshav Nagar (36), Kalyani Nagar (31), Bavdhan (30).
- **Pune Sale Price Distribution (`TARGET(PRICE_IN_LACS)`)**:
  - Minimum: INR 12.0 Lakhs
  - 10th Percentile: INR 31.9 Lakhs
  - 25th Percentile: INR 44.5 Lakhs
  - **Median (50th Percentile)**: **INR 67.0 Lakhs**
  - Mean: INR 134.48 Lakhs
  - 75th Percentile: INR 100.0 Lakhs
  - 90th Percentile: INR 170.0 Lakhs
  - 95th Percentile: INR 240.0 Lakhs
  - 99th Percentile: INR 600.0 Lakhs
  - Maximum: INR 9,910.0 Lakhs (Luxury high-end estate)
- **Pune Area Distribution (`SQUARE_FT`)**:
  - Median: 1,050.1 sq. ft.
  - Mean: 1,643.6 sq. ft.
- **Geographic Precision**:
  - Longitudes clustered at 73.70° to 73.95° E.
  - Latitudes clustered at 18.42° to 18.72° N.
  - Both perfectly circumscribe the Pune Municipal Corporation (PMC) and Pimpri-Chinchwad (PCMC) boundaries.
- **Data Quality & Preprocessing Applied**:
  - 401 exact duplicates already purged from `train.csv`.
  - Coordinates unswapped from original reversed format.
  - 258 out-of-bounds coordinates marked missing rather than falsified.
  - 72 rows with `SQUARE_FT > 100,000` flagged for domain outlier truncation.
- **Provenance**: Derived from the MachineHack Real Estate Price Prediction Challenge dataset, reflecting genuine asking and registered property portal aggregates across India.
- **Suitability**: **HIGHEST SUITABILITY FOR ESTORA P0 SALE-PRICE MODEL**.

---

### 2. `Pune_House_Data.csv` (FABRICATED GEOGRAPHY)

- **Dimensions**: 13,320 rows $\times$ 9 columns
- **Critical Anomaly**: Exact duplicate of Kaggle's Bengaluru House Price dataset. The location column was stripped and replaced with 96 Pune localities repeated sequentially in cyclical alphabetical order (`Alandi Road` through `Yerawada`, repeating ~139 times).
- **Verdict**: **REJECTED FOR MODEL INFERENCE**. Retained strictly as a unit test fixture for parsing non-standard square footage strings.

---

### 3. `House_Rent_Dataset.csv` & `Indian_House_Rent_Dataset.csv` (RENTAL DATASETS)

- **Dimensions**: 4,746 rows $\times$ 12 columns
- **Coverage**: Covers 6 Indian metros (Mumbai, Chennai, Bangalore, Hyderabad, Delhi, Kolkata). **Zero records for Pune.**
- **`Indian_House_Rent_Dataset.csv`**: Intentionally degraded homework dataset with 11–20% missing values per column and corrupted strings (`India-, Mumbai`, `&-9 Chennai`).
- **Verdict**: **REJECTED FOR PUNE RENT INFERENCE**. Sourcing a genuine Pune rental dataset remains an active prerequisite for the rental model.

---

### 4. `indian-urban-house-price-prediction.zip` (SYNTHETIC BENCHMARK)

- **Dimensions**: 80,000 train + 20,000 test across 10 Indian cities (7,833 Pune properties in train).
- **Features**: Clean physical and spatial attributes (`Super_Area_SqFt`, `Distance_to_Metro_km`, `Distance_to_City_Center_km`, `Age_of_Property`).
- **Assessment**: Statistically synthetic (exact 50/25/25 locality distributions and uniform splits).
- **Verdict**: **APPROVED AS PIPELINE BENCHMARK & CI VALIDATION FIXTURE**.

---

## Action Plan & Architecture Roadmap

1. **Adopt `real_estate_dataset_cleaned (1).zip` as Primary Sale Price Dataset**:
   - Extract `processed/train_cleaned.csv` into `ml/training/data/interim/pune_sales_train.csv` filtered to Pune records (1,980 properties) or a joint Pune-Maharashtra model.
   - Engineer locality features (Baner, Wakad, Kharadi, Hinjewadi) and spatial distance metrics from coordinates.
   - Clean area and price outliers (e.g. truncate `SQUARE_FT > 10,000` or `TARGET > 1,500` Lakhs).
2. **Train P0 Sale-Price Model Pipeline**:
   - Baseline: Median Regressor.
   - Models: Ridge / Linear Regression, Random Forest, HistGradientBoostingRegressor.
   - Metrics: MAE (in INR Lakhs), RMSE, R².
3. **Dedicated Pune Rental Ingestion**:
   - Source a genuine Pune residential rental dataset with micro-market coverage before developing the monthly-rent inference pipeline.
