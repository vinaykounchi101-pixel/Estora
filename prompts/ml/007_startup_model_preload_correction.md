# Task Prompt: 007 — Startup Model Preload Correction

- **Date & Time (Local):** 2026-10-23 03:03:45 +05:30
- **Category:** `ml`
- **Status:** Completed
- **Scope:** Eager startup model preloading and validation correction for Phase 7

---

## Verbatim Prompt Content

```text
Implement a minimal correction for the Phase 7 startup-preloading issue identified in the audit. First read AGENTS.md, inspect git status and the relevant implementation/tests, and preserve all existing user changes. In backend/app/integrations/ml_inference.py, ensure load_sale_predictor() explicitly loads and validates the actual model pipeline during application startup using the existing ModelLoader API; inspect its implementation before calling methods, and do not access private attributes if a public method exists. Confirm startup catches missing, corrupt, incompatible, or non-executable artifacts without crashing the application, logs a safe structured error, and leaves readiness false/503 while liveness remains 200. A valid artifact must be deserialized and validated before startup completes. Add or update tests proving eager loading happens during lifespan startup, corrupt/missing artifact handling, readiness/liveness behavior, and successful real-artifact inference. Also move the InferenceValidationError import to the normal import section in backend/app/core/exceptions.py and restore a module docstring at the top of backend/app/integrations/ml_inference.py. Do not change model/data artifacts, schemas, endpoints/contracts, database, frontend, or unrelated files. Do not commit or push. Run focused tests and then the full suite. Save this prompt verbatim to prompts/ml/007_startup_model_preload_correction.md. Report changed files, test results, and any remaining risks; distinguish verified results from assumptions.
```
