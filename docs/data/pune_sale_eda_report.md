# Estora — Pune Residential Sale Price Exploratory Data Analysis (EDA)

- **Document Version**: `1.0.0`
- **Execution Date**: `2026-10-22`
- **Dataset Evaluated**: `ml/training/data/processed/pune_sale_prices.csv` (1,833 records, 13 features)
- **Source Provenance**: Aggregated asking-price listings from approximately 2020 (`real_estate_dataset_cleaned (1).zip`).
- **Data Governance Notice**: This exploratory analysis represents historical listing asking prices, not verified 2026 completed transactions. Commercial licensing terms remain unresolved; this dataset serves strictly as an initial engineering development and baseline benchmark.

---

## 1. Executive Summary & Key Statistical Insights

1. **Target Distribution (`target_price_lakhs`)**:
   - **Median**: **INR 66.0 Lakhs** | **Mean**: **INR 88.05 Lakhs** | **Standard Deviation**: **INR 81.41 Lakhs**
   - **Interquartile Range (IQR)**: **INR 55.90 Lakhs** ($Q_1$ = INR 44.00L, $Q_3$ = INR 99.90L).
   - **Range**: Minimum INR 12.00 Lakhs, Maximum INR 1,000.00 Lakhs.
   - **Skewness & Kurtosis**: Raw skewness is **4.09** with a heavy right tail (kurtosis = 25.85). Applying a natural logarithmic transformation $\ln(1 + \text{price})$ reduces skewness to **0.59** (kurtosis = 0.70), demonstrating that log-target transformation is essential for regularized linear regression.

2. **Primary Explanatory Feature (`square_ft`)**:
   - Area demonstrates an exceptionally strong linear relationship with price: Pearson $r = 0.877$, Spearman $\rho = 0.872$.
   - **Median Area**: 1,050.02 sq. ft. | **Mean Area**: 1,206.83 sq. ft. (Min: 220.01 sq. ft., Max: 6,005.61 sq. ft.).

3. **BHK Configurations (`bhk_no`)**:
   - **2 BHK** properties dominate the Pune market at **51.1%** ($n = 937$), followed by **3 BHK** at **24.9%** ($n = 456$) and **1 BHK** at **18.8%** ($n = 345$).
   - High-end inventory ($\ge 4$ BHK) constitutes 5.2% ($n = 95$).

4. **Collinearity & Redundancy Findings**:
   - `under_construction` is perfectly collinear with `ready_to_move` (`under_construction == 1 - ready_to_move`). One must be excluded from feature matrices.
   - `bhk_or_rk` has zero variance in Pune ($100\%$ classified as 'BHK').

---

## 2. Target Variable Analysis: Sale Price (INR Lakhs)

| Metric | Raw Target (`target_price_lakhs`) | Log-Transformed ($\ln(1 + y)$) |
| :--- | :---: | :---: |
| **Count** | 1,833 | 1,833 |
| **Mean** | 88.05 | 4.31 |
| **Std Dev** | 81.41 | 0.58 |
| **Min** | 12.00 | 2.56 |
| **25th Percentile ($Q_1$)** | 44.00 | 3.81 |
| **50th Percentile (Median)**| **66.00** | **4.20** |
| **75th Percentile ($Q_3$)** | 99.90 | 4.61 |
| **90th Percentile** | 160.00 | 5.08 |
| **95th Percentile** | 225.00 | 5.42 |
| **99th Percentile** | 450.00 | 6.11 |
| **Max** | 1,000.00 | 6.91 |
| **Skewness** | **+4.09** | **+0.59** |
| **Kurtosis** | **25.85** | **0.70** |

![Price Distribution](file:///e:/Projects/Estora/ml/training/reports/figures/price_distribution.svg)

### Observations:
- 75% of properties are priced under INR 1.00 Crore (INR 100 Lakhs), representing Pune's mid-income residential heartland.
- The high skewness in raw prices will cause standard Ordinary Least Squares (OLS) to over-penalize high-value residual errors. Target transformation (`TransformedTargetRegressor` with `np.log1p`) stabilizes the variance and normalizes residuals.

---

## 3. Physical Attributes & Price Relationships

### 3.1 Built-up Area (`square_ft`)
- Correlation with Sale Price: **Pearson $r = 0.877$**, **Spearman $\rho = 0.872$**.
- Built-up area is the primary price driver. The median price per square foot across Pune in this dataset is approximately **INR 6,100 / sq. ft.** (IQR: INR 4,800 to INR 7,900 / sq. ft.).

![Price vs Square Feet](file:///e:/Projects/Estora/ml/training/reports/figures/price_vs_square_ft.svg)

### 3.2 BHK Configuration Breakdown

| Configuration | Listing Count | Percentage | Median Price (Lakhs) | Mean Price (Lakhs) | Median Area (sq. ft.) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1 BHK** | 345 | 18.8% | ₹35.0L | ₹38.7L | 620 sq. ft. |
| **2 BHK** | 937 | 51.1% | ₹60.0L | ₹68.6L | 1,000 sq. ft. |
| **3 BHK** | 456 | 24.9% | ₹110.0L | ₹127.8L | 1,510 sq. ft. |
| **4 BHK** | 83 | 4.5% | ₹230.0L | ₹248.9L | 2,450 sq. ft. |
| **5+ BHK** | 12 | 0.7% | ₹325.0L | ₹376.7L | 3,365 sq. ft. |

![Price by BHK](file:///e:/Projects/Estora/ml/training/reports/figures/price_by_bhk.svg)

---

## 4. Property Status, Market Demographics & Binary Flags

| Feature | Category / State | Listing Count | Percentage | Median Price (Lakhs) |
| :--- | :--- | :---: | :---: | :---: |
| **`posted_by`** | Dealer | 1,402 | 76.5% | ₹70.0L |
| | Owner | 408 | 22.3% | ₹52.0L |
| | Builder | 23 | 1.3% | ₹75.0L |
| **`ready_to_move`** | 1 (Ready) | 1,475 | 80.5% | ₹64.0L |
| | 0 (Under Construction)| 358 | 19.5% | ₹74.0L |
| **`rera`** | 0 (Non-RERA / Pre-RERA)| 1,069 | 58.3% | ₹60.0L |
| | 1 (RERA Approved) | 764 | 41.7% | ₹75.0L |
| **`resale`** | 1 (Resale Property) | 1,749 | 95.4% | ₹65.0L |
| | 0 (New Booking) | 84 | 4.6% | ₹80.0L |

### Observations:
- **Dealer Dominance**: 76.5% of listings are posted by real estate dealers, with a higher median price (₹70L) than owner-direct listings (₹52L).
- **RERA Premium**: RERA-approved properties exhibit a higher median price (₹75L vs ₹60L), reflecting newer construction and compliance in emerging suburban corridors.
- **Resale Share**: Resale accounts for over 95% of listings in this portal extract.

---

## 5. Locality Analysis & Micro-Market Density

There are **284 distinct address entries** in the cleaned dataset. However, listing density is concentrated in well-known suburban IT and residential hubs:

| Micro-Market (`address`) | Listings ($n$) | Market Share | Median Price | Mean Price | Median Area (sq. ft.) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Baner, Pune** | 98 | 5.3% | ₹110.0L | ₹132.8L | 1,300 |
| **Wagholi, Pune** | 79 | 4.3% | ₹43.0L | ₹49.7L | 900 |
| **Kharadi, Pune** | 75 | 4.1% | ₹93.5L | ₹108.6L | 1,220 |
| **Wakad, Pune** | 71 | 3.9% | ₹76.5L | ₹86.4L | 1,065 |
| **NIBM, Pune** | 71 | 3.9% | ₹78.0L | ₹95.1L | 1,250 |
| **Hadapsar, Pune** | 69 | 3.8% | ₹85.0L | ₹91.3L | 1,180 |
| **Moshi, Pune** | 58 | 3.2% | ₹43.0L | ₹44.5L | 850 |
| **Balewadi, Pune** | 56 | 3.1% | ₹95.0L | ₹118.7L | 1,200 |
| **Undri, Pune** | 55 | 3.0% | ₹52.0L | ₹64.0L | 1,020 |
| **Ravet, Pune** | 55 | 3.0% | ₹57.0L | ₹61.6L | 975 |
| **Other (274 Localities)** | 1,147 | 62.6% | ₹65.0L | ₹85.2L | 1,050 |

![Top Localities](file:///e:/Projects/Estora/ml/training/reports/figures/top_localities_price.svg)

### High-Cardinality Sparsity:
- Over 210 localities possess fewer than 5 listings each.
- In modeling, rare localities must either be grouped into an `'Other'` category or modeled using spatial coordinates (`latitude`, `longitude`) to prevent high variance and test-time unknown category failures.

---

## 6. Data Leakage & Feature Availability Assessment

### 6.1 Features Available at Prediction Time
When a user requests a price estimation on the Estora frontend, the following inputs will be supplied:
1. `square_ft`: Continuous positive float (built-up area).
2. `bhk_no`: Integer bedroom count.
3. `locality` / `address`: Dropdown selection of Pune micro-markets.
4. `posted_by`: User role (Owner, Dealer, Builder).
5. `ready_to_move`: Property readiness binary flag.
6. `rera`: RERA approval status.
7. `resale`: Resale vs new property.
8. `latitude`, `longitude`: Optional spatial geocoordinates mapped from locality centroid.

### 6.2 Target-Derived & Leakage Variables Excluded
- `price_per_sqft` is **excluded** from training features because it is directly derived from the target variable (`price / square_ft`).
- No post-transaction or settlement information exists in this dataset.

### 6.3 Near-Duplicate Grouping Requirement
In Indian property portals, multiple brokerages frequently list the exact same unit or identical floorplan within the same society (e.g. 1,050 sq. ft. in Wakad).
- To prevent optimistic data leakage where near-identical listings appear in both train and validation splits, evaluation splits must be **grouped by `(address, square_ft)`**.
- Across the 1,833 records, there are **1,788 distinct `(address, square_ft)` groups**. An 80/20 grouped shuffle split ensures zero group crossover between training and evaluation partitions.
