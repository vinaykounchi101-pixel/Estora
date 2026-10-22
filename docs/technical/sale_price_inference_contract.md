# Estora — Sale-Price ML Inference API Contract & Integration Specification

**Phase:** Phase 7 — ML Inference Integration  
**Protocol:** REST / JSON  
**Base Path:** `/api/v1/predictions/sale-price`  
**Target:** Pune Residential Property Valuation (Sale Price)

---

## 1. Overview

The `POST /api/v1/predictions/sale-price` endpoint provides stateless, production-ready machine learning valuation inference for residential properties across the Pune metropolitan area. It directly wraps the verified `pune_sale_v1` model pipeline (`HistGradientBoostingRegressor` with `log1p` target transformation) and returns real-time estimates without requiring database sessions, user authentication, or persistent storage.

---

## 2. API Contract Specification

### Endpoint Definition
- **Method:** `POST`
- **Route:** `/api/v1/predictions/sale-price`
- **Content-Type:** `application/json`
- **Authentication:** None required (stateless public decision-support endpoint)
- **Status Codes:**
  - `200 OK`: Successful inference with structured valuation response.
  - `422 Unprocessable Entity`: Schema violation, missing field, or out-of-bounds geographic/physical feature.
  - `503 Service Unavailable`: ML model artifact is missing, unreadable, or inference engine failed.

### Request Schema (`SalePriceInferenceRequest`)

The endpoint requires exactly nine features matching the trained model pipeline's feature schema:

| Field | Type | Bounds / Allowed Values | Description |
| :--- | :--- | :--- | :--- |
| `square_ft` | `float` | `[150.0, 8000.0]` | Built-up or carpet area in square feet |
| `bhk_no` | `int` | `[1, 10]` | Bedroom count (BHK) |
| `latitude` | `float` | `[17.90, 19.30]` | Latitude within Pune metropolitan scope |
| `longitude` | `float` | `[73.20, 75.30]` | Longitude within Pune metropolitan scope |
| `posted_by` | `str` | `["Owner", "Dealer", "Builder"]` | Entity listing the property |
| `address` | `str` | Length `1` to `200` chars | Locality or micro-market identifier (e.g. `"Wakad,Pune"`) |
| `rera` | `int` | `0` or `1` | RERA registration flag (`1 = RERA approved`, `0 = Non-RERA`) |
| `ready_to_move` | `int` | `0` or `1` | Construction readiness (`1 = Ready to move`, `0 = Under construction`) |
| `resale` | `int` | `0` or `1` | Transaction channel (`1 = Resale`, `0 = New project booking`) |

#### Example Request Payload
```json
{
  "square_ft": 1050.0,
  "bhk_no": 2,
  "latitude": 18.598,
  "longitude": 73.763,
  "posted_by": "Dealer",
  "address": "Wakad,Pune",
  "rera": 1,
  "ready_to_move": 1,
  "resale": 1
}
```

---

### Response Schema (`SalePriceInferenceResponse`)

| Field | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `estimated_price_lakhs` | `float` | `75.50` | Estimated residential sale price in INR Lakhs |
| `estimated_price_inr` | `int` | `7550000` | Derived exact integer valuation in Indian Rupees (INR) |
| `currency` | `str` | `"INR"` | Three-letter ISO currency code |
| `currency_unit` | `str` | `"INR Lakhs"` | Primary monetary display unit |
| `model_name` | `str` | `"estora_pune_residential_sale_price"` | Registered model identifier |
| `model_version` | `str` | `"1.0.0"` | Frozen model artifact release version |
| `prediction_type` | `str` | `"sale_price"` | Target category (distinguished from `monthly_rent`) |
| `supported_geography` | `str` | `"Pune, Maharashtra"` | Geographic operational bounds |
| `disclaimer` | `str` | *See below* | Decision-support disclaimer on historical asking prices |

#### Example Response Body (200 OK)
```json
{
  "estimated_price_lakhs": 75.50,
  "estimated_price_inr": 7550000,
  "currency": "INR",
  "currency_unit": "INR Lakhs",
  "model_name": "estora_pune_residential_sale_price",
  "model_version": "1.0.0",
  "prediction_type": "sale_price",
  "supported_geography": "Pune, Maharashtra",
  "disclaimer": "Estora Decision Support Disclaimer: This model was trained on historical circa-2020 portal listing asking prices and serves as an engineering baseline for platform development. Predictions reflect asking rates rather than verified registered transaction deed values, and substantial Pune market appreciation has occurred since 2020. Commercial licensing for the underlying portal dataset remains unresolved. Predictions should not be used as legal appraisal or financial investment advice."
}
```

#### Example Error Response (422 Unprocessable Entity)
```json
{
  "error": {
    "code": 422,
    "message": "Request validation failed.",
    "details": [
      {
        "field": "body -> square_ft",
        "message": "Input should be greater than or equal to 150",
        "type": "greater_than_equal"
      }
    ],
    "request_id": "c6218ad2-1bf6-4db0-bca8-f40a14df97b7"
  },
  "detail": [
    {
      "field": "body -> square_ft",
      "message": "Input should be greater than or equal to 150",
      "type": "greater_than_equal"
    }
  ]
}
```

---

## 3. Artifact Lifecycle & Dependency Architecture

1. **Lifespan Startup Loading:**
   The artifact `ml/artifacts/sale_price/pune_sale_v1.joblib` and its companion manifest `pune_sale_v1_metadata.json` are loaded once into memory during the FastAPI `lifespan` context manager on application startup.
2. **Environment Variable Configuration (`ESTORA_ARTIFACTS_DIR`):**
   - If `ESTORA_ARTIFACTS_DIR` is set in the environment, the backend resolves models from `Path(os.environ["ESTORA_ARTIFACTS_DIR"]) / "sale_price"`.
   - If not set, it automatically resolves to `ml/artifacts` relative to the repository root.
3. **Health & Readiness Decoupling:**
   - **Liveness (`GET /api/v1/health/live`):** Returns `200 OK` confirming the FastAPI process is alive, regardless of model artifact state.
   - **Readiness (`GET /api/v1/health/ready`):** Validates database connectivity and active ML model availability. If the artifact is missing or fails to load, readiness returns `503 Service Unavailable` with `dependencies.model_artifacts: "unavailable"`.
4. **Dependency Injection & Test Isolation:**
   Route handlers consume the predictor via `predictor: SalePricePredictor = Depends(get_sale_predictor_dependency)`. In automated test environments, unit tests can override this dependency using `app.dependency_overrides[get_sale_predictor_dependency]` with a deterministic fake predictor to guarantee network and disk isolation.

---

## 4. Local Execution & Verification

### Running the API Server Locally
```bash
# Activate virtual environment
.venv\Scripts\activate

# Launch FastAPI development server with hot-reload
uvicorn backend.app.main:app --reload --port 8000
```

### Running Test Suites
```bash
# Run complete test suite (111 tests)
.venv\Scripts\pytest.exe -v

# Run dedicated sale-price inference tests (28 tests)
.venv\Scripts\pytest.exe -v backend/tests/integration/api/test_sale_price_inference_api.py
```

---

## 5. Model & Data Governance Limitations

1. **Historical Listing Price Basis:**
   The training data reflects circa-2020 real estate portal asking prices. Substantial Pune property market appreciation and inflation have taken place between 2020 and 2026. The platform does not claim to predict current registered transaction values.
2. **Asking Rates vs. Registered Deed Values:**
   Asking prices include developer/owner negotiation margins and do not reflect government stamp-duty registration values.
3. **Data Licensing:**
   Commercial redistribution terms for the underlying historical portal dataset remain unresolved; the model serves as an engineering decision-support prototype.
4. **Target Separation:**
   Rental valuation is handled as a separate target and is not supported by this endpoint.
