# Estora — Pune Residential Sale Price Artifact Manifest & Deployment Guide

- **Document Version**: `1.0.0`
- **Execution Date**: `2026-10-22`
- **Model Version**: `1.0.0`
- **Model Identifier**: `estora_pune_residential_sale_price`
- **Training Script**: [`ml/training/scripts/train_final_sale_model.py`](file:///e:/Projects/Estora/ml/training/scripts/train_final_sale_model.py)
- **Artifact Binary**: [`ml/artifacts/sale_price/pune_sale_v1.joblib`](file:///e:/Projects/Estora/ml/artifacts/sale_price/pune_sale_v1.joblib) (161,726 bytes)
- **Metadata Manifest**: [`ml/artifacts/sale_price/pune_sale_v1_metadata.json`](file:///e:/Projects/Estora/ml/artifacts/sale_price/pune_sale_v1_metadata.json) (2,474 bytes)
- **Dataset Used**: [`ml/training/data/processed/pune_sale_prices.csv`](file:///e:/Projects/Estora/ml/training/data/processed/pune_sale_prices.csv) (**1,833 clean records**)
- **Target Variable**: `target_price_lakhs` (Sale Price in **INR Lakhs**)

---

## 1. Reproducible Training Command

To re-train and re-serialize the final production artifact from scratch:

```bash
# Ensure virtual environment is activated with dependencies
.venv/Scripts/python ml/training/scripts/train_final_sale_model.py
```

---

## 2. Model Architecture & Pipeline Composition

The serialized artifact is a single, self-contained `TransformedTargetRegressor` object containing both preprocessing transformers and the gradient boosting estimator:

```text
TransformedTargetRegressor(
    regressor=Pipeline(steps=[
        ('preprocessor', ColumnTransformer(transformers=[
            ('num', StandardScaler(), ['square_ft', 'bhk_no', 'latitude', 'longitude']),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['posted_by', 'address']),
            ('bin', StandardScaler(with_mean=False, with_std=False), ['rera', 'ready_to_move', 'resale'])
        ], remainder='drop')),
        ('regressor', HistGradientBoostingRegressor(
            max_iter=150,
            max_depth=8,
            random_state=42
        ))
    ]),
    func=np.log1p,
    inverse_func=np.expm1,
    check_inverse=False
)
```

### Key Architectural Safeguards:
1. **Target Log-Transformation**: Target prices are modeled in natural log scale $\ln(1 + \text{price})$, compressing the heavy right skew (4.09 $\rightarrow$ 0.59) and preventing negative predictions.
2. **Handling Sparse Categories**: `OneHotEncoder(handle_unknown='ignore')` gracefully maps previously unobserved localities or addresses to all-zero vectors, avoiding runtime failure on novel micro-markets.
3. **No Target Leakage**: `price_per_sqft` is excluded; perfectly collinear `under_construction` is omitted.

---

## 3. Feature Schema & Input Validation

The inference service strictly validates inputs via [`ml/src/real_estate_ml/inference/input_validation.py`](file:///e:/Projects/Estora/ml/src/real_estate_ml/inference/input_validation.py) before evaluating the pipeline:

| Feature Name | Data Type | Permitted Domain / Allowed Values | Description |
| :--- | :---: | :---: | :--- |
| `square_ft` | Float | `[150.0, 8000.0]` | Super built-up area in square feet. |
| `bhk_no` | Integer | `[1, 10]` | Total bedroom count. |
| `latitude` | Float | `[17.90, 19.30]` | WGS84 decimal latitude (Pune metropolitan scope). |
| `longitude` | Float | `[73.20, 75.30]` | WGS84 decimal longitude (Pune metropolitan scope). |
| `posted_by` | String | `{'Owner', 'Dealer', 'Builder'}` | Identity of the listing creator. |
| `address` | String | Non-empty string (e.g. `'Wakad,Pune'`) | Micro-market locality identifier. |
| `rera` | Integer | `{0, 1}` | 1 = RERA registered, 0 = Non-RERA. |
| `ready_to_move`| Integer | `{0, 1}` | 1 = Ready for possession, 0 = Under construction. |
| `resale` | Integer | `{0, 1}` | 1 = Resale property, 0 = New booking. |

---

## 4. Performance & Validation Baseline Summary

Metrics achieved on held-out test and cross-validation partitions:

| Metric | Cross-Validation (5-Fold Mean $\pm$ Std) | Final Held-Out Evaluation Set ($n=365$) |
| :--- | :---: | :---: |
| **Mean Absolute Error (MAE)** | **INR 16.07 Lakhs** ($\pm$ 0.98L) | **INR 17.35 Lakhs** |
| **Median Absolute Error (MedAE)**| **INR 7.39 Lakhs** ($\pm$ 0.50L) | **INR 8.41 Lakhs** |
| **Root Mean Squared Error (RMSE)**| **INR 31.71 Lakhs** ($\pm$ 4.30L) | **INR 40.71 Lakhs** |
| **Coefficient of Determination ($R^2$)**| **0.834** ($\pm$ 0.027) | **0.8066** |

---

## 5. Reload & Verification Results

The serialized pipeline was reloaded via [`SalePricePredictor`](file:///e:/Projects/Estora/ml/src/real_estate_ml/inference/predictor.py) and evaluated across representative test profiles:

| Property Profile | Inputs | Model Prediction | Market Context / Benchmark |
| :--- | :--- | :---: | :--- |
| **Standard 2 BHK (Wakad)** | 1050 sqft, Dealer, RERA, Ready | **₹69.81 Lakhs** (₹69,81,000) | Wakad median listing price: ₹76.5L |
| **3 BHK (Baner)** | 1500 sqft, Owner, RERA, Ready | **₹116.30 Lakhs** (₹1,16,30,000) | Baner median listing price: ₹110.0L |
| **Novel Micro-Market** | 1000 sqft, Unseen Address | **₹75.71 Lakhs** (₹75,71,000) | Handled gracefully with zero NaNs |

---

## 6. Data Governance, Limitations & Disclaimers

1. **Circa-2020 Listing Asking Prices**:
   All 1,833 records originate from historical portal aggregate listings collected approximately in 2020. Pune residential real estate has appreciated significantly between 2020 and 2026. These predictions represent an **engineering baseline for decision-support prototyping**, not verified 2026 ground truth.
2. **Asking vs. Registered Price Delta**:
   Portal listings reflect seller asking rates. Actual registered transaction deeds (IGR Maharashtra) typically settle 5–15% below initial asking rates.
3. **Commercial Licensing**:
   Underlying source terms remain unresolved. The artifact is authorized strictly for internal development and baseline benchmarking.
4. **FastAPI & System Boundary**:
   This artifact is packaged for inference via `real_estate_ml.inference.SalePricePredictor`. It has **not** been exposed through FastAPI HTTP routes or connected to the frontend client yet.
