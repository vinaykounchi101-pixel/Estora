# Estora — Pune Sale Dataset Validation Report: `real_estate_dataset_cleaned (1).zip`

**Document Status:** Formal Validation Audit  
**Target Workflow:** Residential Sale Price Estimation (P0 MVP)  
**Target Geography:** Pune & Pimpri-Chinchwad (PCMC), Maharashtra, India  
**Auditor:** Antigravity Autonomous Agent (Estora ML Governance Team)  
**Dataset Under Validation:** [`ml/training/data/raw/real_estate_dataset_cleaned (1).zip`](file:///e:/Projects/Estora/ml/training/data/raw/real_estate_dataset_cleaned%20(1).zip)  
**Date:** 2026-10-22  
**Final Recommendation:** **CONDITIONALLY APPROVED**  

---

## 1. Executive Summary & Verdict

An independent, reproducible audit was conducted on `real_estate_dataset_cleaned (1).zip` to determine whether it meets the data governance, provenance, and architectural standards required by Estora (per `AGENTS.md` and SRS Section 5).

### Final Recommendation: **CONDITIONALLY APPROVED**
The dataset contains **1,980 labeled residential properties in Pune** with authentic micro-market locality names (Baner, Wakad, Kharadi, Hinjewadi, Hadapsar, etc.), real GPS coordinates, statutory indicators (`RERA`), and pricing that closely aligns with genuine market conditions (median: INR 67.0 Lakhs).

However, full unconditional approval is withheld due to three structural constraints:
1. **License & Provenance**: Originates from the 2020 MachineHack *House Price Prediction Challenge*. Commercial licensing is unresolved / restricted under hackathon terms.
2. **Price Semantics**: Values represent **portal listing asking prices**, not officially registered government transaction deeds (IGR Maharashtra).
3. **Geocoding & Boundary Anomalies**: 305 Pune-labeled rows have coordinates outside the municipal bounding box or blanked entries, while 105 properties located in Pune by GPS coordinates are mislabeled as `Lalitpur` or `Maharashtra` due to automated scraping artifacts.

---

## 2. Provenance & Authenticity Analysis

| Attribute | Findings & Evidence | Governance Assessment |
| :--- | :--- | :--- |
| **Original Publisher** | MachineHack / Analytics India Magazine (AIM) | Verified competition host |
| **Origin Platform** | MachineHack ("House Price Prediction Challenge", Aug–Sept 2020), mirrored on Kaggle | Verified community mirror |
| **Collection Date** | Circa mid-2020 | Listings reflect 2019–2020 market conditions |
| **Data Gathering Method** | Automated scraping from Indian property listing portals (MagicBricks / 99acres) | Aggregator asking listings |
| **Price Semantics** | **Asking / Listing Advertised Prices** | **NOT stamped/registered transactions** |
| **License Status** | **UNRESOLVED / RESTRICTED COMPETITION TERMS** | No permissive OSS license (MIT/CC-BY) |
| **Authenticity Claim** | Reflects authentic 2020 listing records, but **cannot be certified as current 2026 market truth** | Mandatory disclaimer required |

---

## 3. Reproducibility & Cleaning Audit

The archive contains `CLEANING_REPORT.txt`, original uncleaned files in `original/`, and cleaned files in `processed/`. An independent programmatic verification was executed against all files.

### 3.1 Verification of Reported Cleaning Actions
1. **Exact Duplicate Removal (Verified)**:
   - `original/train.csv`: 29,451 rows.
   - Programmatic search identified exactly **401 exact duplicate rows across all 12 columns**.
   - `processed/train_cleaned.csv`: Exactly 29,050 rows (29,451 − 401 = 29,050). Remaining duplicates: **0**.
2. **Coordinate Swapping (Verified)**:
   - In `original/train.csv`, `LONGITUDE` contained latitude values (~12.96 in Bangalore) and `LATITUDE` contained longitude values (~77.59 in Bangalore).
   - In `processed/train_cleaned.csv`, columns were correctly unswapped (`LONGITUDE` = 77.59796, `LATITUDE` = 12.96991).
3. **Invalid Bounding Box Coordinate Blanking (Verified)**:
   - India Bounding Box: Latitude 6.5° to 37.5° N, Longitude 68.0° to 97.5° E.
   - On the non-deduplicated `original/train.csv`, exactly **258 rows** had coordinates outside this box (matching `CLEANING_REPORT.txt`).
   - In `processed/train_cleaned.csv` (post-deduplication), exactly **255 rows** have blank coordinates.
   - In `processed/test_cleaned.csv`, exactly **540 rows** have blank coordinates (exact match).
4. **Preservation of Raw Files (Verified)**:
   - Files in `original/` remain byte-intact and unmutated.

### 3.2 Data Quality & Distribution Risks
- **Extreme Price Outliers**: 298 training rows across India have `TARGET > 1000 Lacs` (max = INR 30,000 Lakhs / 300 Crores). In Pune, the maximum is INR 9,910 Lakhs (99.1 Crores).
- **Extreme Area Outliers**: 72 training rows have `SQUARE_FT > 100,000` (e.g. agricultural parcels or input errors).
- **Inconsistent Units**: `SQUARE_FT` is numeric float throughout; no string units detected in this cleaned version.

---

## 4. Pune Subset Validation & Boundary Analysis

### 4.1 Reproducible Pune Counts
| Partition | File | Total Rows | Total Pune Records | Percentage |
| :--- | :--- | :---: | :---: | :---: |
| **Labeled Training** | `processed/train_cleaned.csv` | 29,050 | **1,980** | 6.82% |
| **Unlabeled Test** | `processed/test_cleaned.csv` | 68,720 | **4,604** | 6.70% |
| **Combined Total** | Both splits | 97,770 | **6,584** | 6.73% |

### 4.2 Locality Distribution (Top Pune Micro-Markets in Train)
| Micro-Market Locality | Train Count | Test Count | Combined Count | Municipal Jurisdiction |
| :--- | :---: | :---: | :---: | :--- |
| **Baner** | 101 | 221 | 322 | PMC (West Pune) |
| **Wakad** | 71 | 187 | 258 | PCMC (West Hub) |
| **Kharadi** | 76 | 183 | 259 | PMC (East IT Hub) |
| **Wagholi** | 79 | 168 | 247 | PMC (East Corridor) |
| **Hadapsar** | 69 | 169 | 238 | PMC (East Corridor) |
| **NIBM** | 71 | 146 | 217 | PMC (South Pune) |
| **Hinjewadi** | 51 | 140 | 191 | PMRDA / PCMC (IT Park) |
| **Undri** | 55 | 121 | 176 | PMC (South-East) |
| **Ravet** | 55 | 119 | 174 | PCMC (North-West) |
| **Balewadi** | 56 | 113 | 169 | PMC (West Corridor) |
| **Moshi** | 58 | 112 | 170 | PCMC (North Pune) |
| **Punawale** | 39 | 99 | 138 | PCMC (West Hub) |
| **Pimple Saudagar** | 40 | 88 | 128 | PCMC (Central West) |

### 4.3 Coordinate & Boundary Integrity Audit
Filtering on Pune Municipal Box (Latitude 18.25°–18.75° N, Longitude 73.65°–74.05° E):
- **Consistent Records**: **1,675 rows** in train match both `ADDRESS` ending in `,Pune` AND valid coordinates inside the Pune metropolitan box.
- **Ambiguous Records (Name Match, Outside Box or Blank)**: **305 rows**
  - *6 rows*: Blank coordinates (valid Pune address, coordinates excised by bounding-box filter).
  - *268 rows*: Peri-urban and rural Pune district coordinates (Daund, Baramati, Uruli Kanchan, Saswad, Shirur, Indapur).
  - *31 rows*: Geocoding service scraping errors where a Pune listing was erroneously assigned coordinates in Jaipur (Lat 27.16), Amravati (Lat 21.0), or Nashik (Lat 20.0).
- **Unclassified / Mislabeled Records (Pune Coords, Non-Pune Address)**: **105 rows**
  - 105 rows with coordinates clearly inside Wakad/Hinjewadi/Kharadi have address labels such as `Hinjewadi,Lalitpur`, `Kharadi,Lalitpur`, or `Kharadi,Maharashtra` due to reverse-geocoding fallback bugs in the 2020 scraping pipeline.

---

## 5. Train / Test Split Validity & Leakage Analysis

### 5.1 Schema Comparison
- `Train columns`: 12 columns (including `TARGET(PRICE_IN_LACS)`).
- `Test columns`: 11 columns (identical feature schema, missing only target).
- **Result**: **No schema discrepancy**.

### 5.2 Split Origin & Evaluation Feasibility
- **Original Split Ratio**: ~30% train (29,451) / ~70% test (68,720). Created for the MachineHack hackathon with a private test leaderboard.
- **Unlabeled Test Set Status**: `test_cleaned.csv` **DOES NOT CONTAIN GROUND-TRUTH TARGET PRICES**.
- **Governance Mandate**:
  - `test_cleaned.csv` **CANNOT be used to evaluate model generalization**.
  - `test_cleaned.csv` **MUST NEVER be used for model training or preprocessing fit**.
  - All model evaluation must occur via an **internal held-out test split (e.g. 80/20 train/test split or GroupKFold by Locality)** carved strictly from `train_cleaned.csv`.

### 5.3 Cross-Split Feature Twin Leakage
Because real estate listing portals contain duplicate advertisements from multiple brokers for identical builder floorplans:
- **Global Leakage**: 2,286 test rows (3.33%) share identical feature tuples with training rows.
- **Pune Leakage**: 88 Pune test rows (1.91%) share identical feature tuples with Pune training rows.
- **Mitigation**: Internal train/validation splits must implement grouping by `(ADDRESS, SQUARE_FT)` or locality to prevent optimistic evaluation leakage.

---

## 6. Conditions for Approval (Implementation Contract)

To proceed safely with this dataset for Estora's P0 sale-price model, the engineering team must satisfy the following 5 conditions:

1. **Explicit Data Semantics Disclaimer**:
   - The frontend and API response schema must document:  
     `"Predictions are estimated based on calibrated 2020 residential listing asking prices, not certified government registration deeds (IGR Maharashtra)."`
2. **Deterministic Pune Extraction Protocol**:
   - When extracting Pune training data into `ml/training/data/interim/pune_sales_train.csv`:
     - Select rows where `ADDRESS` ends with `,Pune` (case-insensitive).
     - Filter out rows with coordinates outside Maharashtra (Lat < 17.5 or > 20.5; Lon < 72.5 or > 75.5) to discard geocoding errors (e.g., Jaipur coords).
     - Retain valid micro-markets while imputing or handling missing coordinates via locality centroids.
3. **Outlier Mitigation Strategy**:
   - Apply domain-informed trimming or robust scaling:
     - Area filter: Truncate `SQUARE_FT < 150` or `> 8,000` sq. ft.
     - Price filter: Truncate `TARGET > 1,500` Lakhs (15 Crores) or model extreme luxury via a separate tail estimator.
4. **Leakage-Free Validation Split**:
   - Carve an internal, held-out evaluation partition (e.g. 20% test split, $N \approx 396$ Pune properties) *before* fitting any scaler, encoder, or imputer.
   - Do not touch `processed/test_cleaned.csv` during model evaluation.
5. **Licensing Isolation**:
   - Keep this dataset categorized as an educational / research benchmark. Prior to any commercial release, replace or supplement with an officially licensed transaction repository.

---

## 7. Audit Verification Summary

| Check Item | Status | Verification Detail |
| :--- | :---: | :--- |
| **Original Archive Unchanged** | **PASS** | Read-only inspection; MD5 hashes preserved |
| **401 Deduplication Verified** | **PASS** | Exactly 401 duplicates identified and removed |
| **Coordinate Swap Verified** | **PASS** | Lat/Lon inversion corrected |
| **Pune Row Counts Reproduced** | **PASS** | 1,980 train / 4,604 test exact match |
| **Leakage Across Splits Measured** | **PASS** | 1.91% Pune feature-twin rate documented |
| **Target Currency Verified** | **PASS** | INR Lakhs (Continuous positive float) |
| **Final Recommendation** | **CONDITIONALLY APPROVED** | Ready for preprocessing under Section 6 rules |
