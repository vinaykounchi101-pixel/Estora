# Estora — Pune Residential Sale Price Baseline Modeling Report

- **Document Version**: `1.0.0`
- **Execution Date**: `2026-10-22`
- **Pipeline Script**: [`ml/training/scripts/train_sale_price.py`](file:///e:/Projects/Estora/ml/training/scripts/train_sale_price.py)
- **Machine-Readable Report**: [`ml/training/reports/pune_sales_baseline_metrics.json`](file:///e:/Projects/Estora/ml/training/reports/pune_sales_baseline_metrics.json)
- **Dataset Evaluated**: `ml/training/data/processed/pune_sale_prices.csv` (1,833 total rows)
- **Target Variable**: `target_price_lakhs` (Sale Price in **INR Lakhs**)

---

## 1. Executive Summary & Baseline Results

A defensible initial sale-price regression baseline was established by comparing a heuristic anchor (`DummyRegressor(median)`), a regularized linear model (`Ridge` with log1p target transformation), and two tree-based ensemble estimators (`RandomForestRegressor`, `HistGradientBoostingRegressor`).

All models were evaluated using a **leakage-resistant grouped split** (grouped on `(address, square_ft)` to prevent identical/near-identical floorplans from crossing partition boundaries).

### Comparative Evaluation Metrics Table

| Estimator / Pipeline | Train MAE | Held-out MAE | Train RMSE | Held-out RMSE | Train $R^2$ | Held-out $R^2$ | Held-out MedAE | Overfitting Gap ($\Delta$ MAE) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **DummyRegressor (Median)** | ₹42.14L | **₹51.21L** | ₹81.01L | **₹97.67L** | -0.072 | **-0.113** | ₹29.50L | +₹9.07L |
| **Ridge Regression ($\ln(1+y)$)** | ₹16.05L | **₹19.08L** | ₹47.24L | **₹40.38L** | 0.635 | **0.810** | ₹9.33L | **+₹3.03L** |
| **Random Forest (100 trees)** | ₹7.54L | **₹18.31L** | ₹13.28L | **₹44.09L** | 0.971 | **0.773** | ₹9.12L | +₹10.77L |
| **HistGradientBoosting** | ₹11.36L | **₹18.26L** | ₹21.84L | **₹41.03L** | 0.922 | **0.803** | **₹9.19L** | +₹6.90L |

*Note: All monetary values are reported strictly in native units (INR Lakhs) in accordance with Estora Model Governance (AGENTS.md). No arbitrary percentage accuracy is advertised.*

---

## 2. Evaluation Partitioning & Leakage Prevention

### 2.1 Partition Strategy: Grouped Shuffle Split
In real-estate portals, identical or near-identical listings (same apartment complex/address with identical square footage posted by different dealers) create significant evaluation leakage if partitioned with uniform random splitting.

To guarantee partition independence:
- **Grouping Key**: `address` + `_` + `square_ft.round(1)`
- **Total Dataset Size**: 1,833 records
- **Total Unique Groups**: 1,788 groups
- **Split Parameters**: `GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)`
- **Training Set**: **1,468 records** (80.09%) across 1,430 unique groups
- **Held-out Evaluation Set**: **365 records** (19.91%) across 358 unique groups
- **Overlapping Groups**: **Strictly 0 (Zero Leakage)**

### 2.2 Target Partition Characteristics
- **Training Partition**: Median = INR 65.00L, Mean = INR 86.00L
- **Held-out Evaluation Partition**: Median = INR 70.00L, Mean = INR 96.20L
- The held-out set includes high-value properties (reflecting real-world testing conditions) while maintaining representative distributions across mid-range inventory.

---

## 3. Modeling Architecture & Preprocessing

### 3.1 Feature Schema
- **Numerical Features (4)**: `square_ft`, `bhk_no`, `latitude`, `longitude`
  - *Preprocessing*: `StandardScaler()`
- **Categorical Features (2)**: `posted_by`, `address`
  - *Preprocessing*: `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`
- **Binary Flags (3)**: `rera`, `ready_to_move`, `resale`
  - *Preprocessing*: `passthrough`
- **Excluded Features**:
  - `under_construction`: Excluded due to perfect collinearity (`under_construction == 1 - ready_to_move`).
  - `bhk_or_rk`: Excluded due to zero variance (100% of Pune records are 'BHK').
  - `price_per_sqft`: Excluded as target-derived data leakage.

### 3.2 Pipeline Isolation & Encapsulation
In strict adherence to project guidelines, all transformers (scalers, encoders) are bundled into unified `sklearn.pipeline.Pipeline` objects and fitted exclusively on `X_train`. Unseen addresses or categories in the held-out split are handled gracefully via `handle_unknown='ignore'`, producing zero runtime crashes or NaNs.

---

## 4. In-Depth Baseline Model Analysis

### 4.1 DummyRegressor (Median Heuristic)
- Predicts the training median (INR 65.0 Lakhs) unconditionally.
- Held-out MAE: **INR 51.21 Lakhs** | RMSE: **INR 97.67 Lakhs** | $R^2$: **-0.113**.
- Provides the zero-intelligence performance floor that all statistical and ML models must decisively beat.

### 4.2 Ridge Regression with Log-Transformed Target
- Uses `TransformedTargetRegressor` with $f(y) = \ln(1 + y)$ and $f^{-1}(\hat{y}) = \exp(\hat{y}) - 1$.
- Held-out MAE: **INR 19.08 Lakhs** | RMSE: **INR 40.38 Lakhs** | $R^2$: **0.810**.
- **Key Advantage**: Strongest generalization with the smallest overfitting gap ($\Delta \text{MAE} = \text{INR } 3.03\text{L}$). Because target log-transformation compresses the long right tail (reducing skew from 4.09 to 0.59), linear regularization avoids severe penalization from extreme luxury listing errors.

### 4.3 Random Forest Regressor (100 Trees, Max Depth = 15)
- Held-out MAE: **INR 18.31 Lakhs** | RMSE: **INR 44.09 Lakhs** | $R^2$: **0.773**.
- Achieves lower held-out MAE than Ridge (capturing local micro-market non-linearities), but exhibits higher RMSE (₹44.09L) because decision trees cannot extrapolate beyond the maximum training split price boundaries. Notice the train-to-test gap ($R^2$ of 0.971 vs 0.773).

### 4.4 HistGradientBoosting Regressor (150 Iterations, Max Depth = 8)
- Held-out MAE: **INR 18.26 Lakhs** | RMSE: **INR 41.03 Lakhs** | $R^2$: **0.803**.
- **Top Performer**: Delivers the lowest held-out Mean Absolute Error (INR 18.26L) and a low Median Absolute Error (INR 9.19L), while maintaining a high held-out $R^2$ (0.803).

---

## 5. Limitations & Data Governance Notice

1. **Listing Period (~2020)**:
   The underlying dataset originates from approximately 2020 portal aggregate listings. Pune residential property prices have appreciated significantly between 2020 and 2026. Therefore, these predictions serve as an **engineering baseline for platform development and algorithmic validation**, not current 2026 transaction valuation.

2. **Asking vs. Registered Prices**:
   Portal listings represent seller asking/asking rates rather than verified registered sale deeds from the Inspector General of Registration (IGR) Maharashtra. True transaction prices typically close 5–15% below initial portal asking prices.

3. **Commercial Licensing**:
   The source dataset was collected from an open data challenge without explicit commercial licensing terms. It is conditionally approved strictly for internal engineering development and baseline benchmarking.
