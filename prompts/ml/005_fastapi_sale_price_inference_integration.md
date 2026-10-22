# Task Prompt: 005 — FastAPI Sale-Price ML Inference Integration

- **Date & Time (Local):** 2026-10-23 02:42:08 +05:30
- **Category:** `ml`
- **Status:** Completed
- **Scope:** ML Inference Integration into FastAPI backend (`POST /api/v1/predictions/sale-price`)

---

## Verbatim Prompt Content

```text
PROJECT: Estora — Real Estate Price Prediction Platform
PHASE 7: ML INFERENCE INTEGRATION

GOAL
Integrate the existing trained Pune residential sale-price model into the existing FastAPI application. Deliver a tested API endpoint that accepts validated property features and returns a prediction. Do not build the frontend in this phase.

MANDATORY INSPECTION
1. Read AGENTS.md, relevant PRD/SRS and architecture docs, database design, existing FastAPI routes/configuration/exception handlers, database sessions/models, health/readiness probes, and all ML artifact/inference modules.
2. Inspect Git branch/status and preserve existing uncommitted changes. Do not reset, stash, commit, or push.
3. Verify the actual feature schema in the saved model metadata and SalePricePredictor implementation. Do not assume frontend-friendly fields match training feature names.
4. Inspect the real artifact-loading configuration and confirm how ESTORA_ARTIFACTS_DIR resolves. Never read, print, or expose .env secrets.

MODEL INTEGRATION
1. Reuse the existing SalePricePredictor and ModelLoader. Do not duplicate model-loading or prediction logic.
2. Load/cache the selected artifact once during FastAPI lifespan/startup, not on every request. Avoid loading the artifact during unrelated unit tests when an override is appropriate.
3. Fail safely if the required artifact is missing, invalid, or incompatible. Readiness must reflect actual inference availability; liveness must only reflect process health.
4. Keep model training offline. Never retrain or modify the trained artifact during startup or inference.
5. Preserve existing configuration patterns and dependency injection. Avoid unnecessary architectural rewrites.

API CONTRACT
1. Add a versioned endpoint following repository conventions, preferably POST /api/v1/predictions/sale-price.
2. Define typed Pydantic request and response schemas. Use the exact required nine model features and types from the artifact schema: square_ft, bhk_no, latitude, longitude, posted_by, address, rera, ready_to_move, resale. Reconcile input validation with the existing SalePricePredictor; do not invent missing fields or silently fill unsupported inputs.
3. Return predicted price in INR lakhs and INR, currency/unit, model name/version, prediction type, and an explicit historical-data/decision-support disclaimer consistent with project docs.
4. Keep money conversions precise and consistent with existing conventions. Ensure INR output is derived correctly from lakhs.
5. Use existing exception handlers to return consistent client-safe errors for invalid input, out-of-scope geography, missing artifacts, and inference failures. Never leak stack traces or secrets.
6. Do not claim the model estimates current 2026 transaction values. Its training data reflects circa-2020 listing asking prices, and dataset licensing remains unresolved.

DATABASE SCOPE
Do not implement user authentication or prediction-history persistence in this phase unless strictly required by already existing contracts. Do not persist anonymous requests or personal data unnecessarily. Leave history APIs for the later application API phase.

TESTING
1. Add API tests for a valid prediction, missing fields, invalid types/ranges, out-of-scope coordinates, unknown address/category behavior, model unavailable/startup failure, response schema, unit conversion, and client-safe errors.
2. Use dependency overrides or a deterministic fake predictor in tests where appropriate; never depend on production credentials or network access.
3. Test readiness with inference available and unavailable. Verify liveness remains separate from readiness.
4. Run the full backend and ML test suites. Report exact commands, results, warnings, and skipped tests. Do not claim passing tests unless they actually ran.
5. If feasible, run a local smoke test against the actual saved artifact and clearly distinguish it from fake-predictor API tests.

DOCUMENTATION AND PROMPT ARCHIVE
1. Document endpoint contract, example request/response, local run instructions, artifact configuration, and known model/data limitations.
2. Save this prompt verbatim under prompts/ml/ or the established prompt convention, e.g. prompts/ml/005_fastapi_sale_price_inference_integration.md. Check existing numbering first; do not overwrite an existing prompt.
3. Do not claim automatic prompt archiving unless its mechanism is tested.

STRICT BOUNDARIES
- Do not modify frontend code.
- Do not alter raw/processed datasets, model training data, validation metrics, or the frozen holdout.
- Do not retrain, replace, or reserialize the approved model artifact.
- Do not change database schema or run destructive database operations.
- Do not implement rent prediction; there is no approved rent model yet.
- Do not commit or push.

FINAL REPORT
List changed files, exact endpoint and request/response schemas, artifact loading/readiness behavior, real-artifact smoke test result if run, full test results, documentation/prompt path, and remaining risks. Clearly separate verified behavior from planned work.
```
