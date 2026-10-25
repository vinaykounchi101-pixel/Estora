# Project Progress Log

Tracks session progress, completed milestones, and pending tasks.

---

## Session: 2026-10-21 / 2026-10-22

### Completed Milestones
- [x] Analyzed `docs/PRD.md` and `docs/SRS.md` specifications for Estora.
- [x] Updated `AGENTS.md` with Estora project guidelines, ML protocols, architectural boundaries, and user rules.
- [x] Scaffolded the standard, production-ready directory structure matching SRS Section 13:
  - `frontend/`: Next.js App Router, typed API client, Editorial Luxury UI structure, components, and feature modules.
  - `backend/`: FastAPI application structure with routers, controllers, services, repositories, schemas, models, and ML adapter.
  - `ml/`: Offline training pipeline, datasets partition (`raw`, `interim`, `processed`), thin CLI entry points, and reusable `real_estate_ml` core package.
  - `docs/`: Requirements, architecture specifications, design system, ML documentation, progress log, and technical decisions.
  - `data/`, `deployment/`, `scripts/`, `.github/workflows/`, and root project configs (`.gitignore`, `.env.example`, `Makefile`, `README.md`, `LICENSE`).
- [x] Initialized Git repository, committed clean baseline scaffold to `main`.
- [x] Created persistent integration branch `dev` off `main`.
- [x] Codified Rule 9 (Branching, Autonomous Self-Approval, and Cleanup) and Rule 8 WIP exception in `AGENTS.md`.
- [x] Documented Design System comparisons (PRD, `docs/design-tokens.md`, `docs/design-system/`) and generated high-fidelity whole-website mockups in artifacts.
- [x] Established Architectural Decision Records ADR-001, ADR-002, and ADR-003 in `docs/technical/technical_decisions.md`.
- [x] **Phase 1: Dataset Audit & Preparation Pipeline**:
  - Validated Pune residential sale-price dataset (1,833 clean listings approved out of 2,429 raw records; removed 401 duplicates, out-of-bounds prices, invalid coordinates, and non-Pune entries).
  - Built reproducible data pipeline (`ml/src/real_estate_ml/data/` and `ml/training/scripts/prepare_data.py`).
- [x] **Phase 2: EDA & Initial Baselines**:
  - Generated comprehensive distribution and correlation figures under `ml/training/reports/figures/`.
  - Evaluated baseline models (Median Dummy, Linear Regression, Ridge, Random Forest, HistGradientBoosting) with leakage-safe grouped train/test splitting.
- [x] **Phase 3: Rigorous Validation & Model Selection**:
  - Implemented 5-Fold `GroupKFold` cross-validation grouped on locality to prevent spatial/neighborhood leakage.
  - Selected `HistGradientBoostingRegressor` with `log1p` target transform (CV MAE: ₹16.07L ± 0.98L, Holdout MAE: ₹17.35L, Holdout $R^2$: 0.8066).
- [x] **Phase 4: Final Model Training & Artifact Verification**:
  - Trained final model pipeline on all 1,833 approved records.
  - Serialized versioned artifact to `ml/artifacts/sale_price/pune_sale_v1.joblib` and metadata manifest `pune_sale_v1_metadata.json`.
  - Implemented inference predictor adapter with bounds validation, locality fallback, and domain checks; verified isolated reload across 26 passing tests.
- [x] **Phase 5: PostgreSQL Database Foundation**:
  - Implemented SQLAlchemy 2.0 ORM models (`User`, `Prediction`, `ModelArtifact`) with UUID primary keys, fixed-precision `Numeric(14,2)` monetary fields, immutable property snapshots, and cascade deletion.
  - Configured environment-driven settings (`pydantic-settings`) and session factory supporting connection pooling and SQLite test bypass.
  - Established Alembic migration lifecycle (`backend/alembic.ini`, `backend/migrations/env.py`, `0001_initial_schema.py`) with verified upgrade and downgrade paths.
  - Added 14 unit and integration tests (14/14 passing; 40/40 passing across the entire repository).
  - Documented full schema, ERD, and migration workflows in `docs/architecture/database_design.md`.

- [x] **Phase 6: Backend API Implementation & Endpoint Integration**:
  - Implemented core security in `backend/app/core/security.py` using salted bcrypt hashing and signed JWT access tokens with role claims.
  - Implemented Pydantic request/response schemas in `backend/app/schemas/` (`auth.py`, `user.py`, `prediction.py`, `analytics.py`).
  - Implemented repository layer in `backend/app/repositories/` (`user_repository.py`, `prediction_repository.py`, `model_repository.py`).
  - Implemented business logic services in `backend/app/services/` (`auth_service.py`, `user_service.py`, `prediction_service.py`, `analytics_service.py`).
  - Connected ML inference engine via `backend/app/integrations/ml_inference.py` to `real_estate_ml.inference.predictor.SalePricePredictor`.
  - Implemented route dependencies in `backend/app/api/dependencies.py` with Bearer token authentication, user ownership enforcement, and admin role validation.
  - Implemented versioned API controllers in `backend/app/api/v1/endpoints/`:
    - `/api/v1/health`: Service health and live PostgreSQL database connectivity verification.
    - `/api/v1/auth`: Registration, login, and session logout.
    - `/api/v1/users`: Profile retrieval and updates.
    - `/api/v1/predictions`: ML inference execution and persistence for both visitors and authenticated users; user history and ownership-scoped detail.
    - `/api/v1/analytics`: User valuation portfolio summary statistics.
    - `/api/v1/admin`: Administrative endpoints for user management, prediction audits, model registry metadata, and system analytics.
  - Added core application foundation: correlation ID middleware (`X-Request-ID`), structured logging, liveness and readiness probes (`/api/v1/health/live`, `/api/v1/health/ready`), and global exception boundaries.
  - Added 43 new automated integration and unit tests covering all endpoints, authentication flows, error bounds, foundation probes, and ownership controls.
  - Archived verbatim prompt to `prompts/backend/002_fastapi_backend_foundation.md`.

- [x] **Phase 7: ML Inference Integration (FastAPI Endpoint) & Audit Correction**:
  - Added dedicated stateless prediction endpoint: `POST /api/v1/predictions/sale-price`.
  - Defined typed `SalePriceInferenceRequest` enforcing exact nine model features matching training schema (`square_ft`, `bhk_no`, `latitude`, `longitude`, `posted_by`, `address`, `rera`, `ready_to_move`, `resale`).
  - Defined `SalePriceInferenceResponse` returning estimated price in INR Lakhs, derived integer INR, currency metadata, model name and version, prediction type, and explicit historical circa-2020 decision support disclaimer.
  - Implemented application lifespan preloading in `backend/app/main.py` caching the validated `SalePricePredictor` on startup using public `ModelLoader.load()` API.
  - Enforced eager model deserialization and validation at startup; safely handles missing, corrupt, or incompatible artifacts without application crash while keeping liveness `200 OK` and readiness `503 Service Unavailable`.
  - Configured `ESTORA_ARTIFACTS_DIR` environment variable resolution with fallback to repository artifact path.
  - Reconciled readiness probe `/api/v1/health/ready` to evaluate model inference availability, while keeping liveness `/api/v1/health/live` decoupled.
  - Added route dependency `get_sale_predictor_dependency()` supporting test fixture overrides with deterministic fake predictors.
  - Added 32 automated integration tests covering valid contracts, schema bounds, out-of-scope geography, unknown micro-markets, model unreadiness, startup resilience, corrupt artifact traps, and real artifact smoke tests.
  - Established ADR-008 and documented API contract in `docs/technical/sale_price_inference_contract.md`.
  - Archived verbatim prompts to `prompts/ml/005_fastapi_sale_price_inference_integration.md`, `006_phase7_integration_audit.md`, and `007_startup_model_preload_correction.md`.

- [x] **Phase 8 & 9 (Phase B & C): Frontend Implementation, Full Integration & Visual Refinement**:
  - Built production Next.js 14 App Router frontend featuring Editorial Luxury design system across all 21 routes.
  - Connected typed API client (`frontend/src/lib/api/`) directly to FastAPI `/api/v1` backend endpoints with full JWT session handling and error boundaries.
  - Refined critical Landing-Page hero image composition in `frontend/src/components/motion/parallax-hero-image.tsx` and `frontend/src/app/(marketing)/page.tsx`:
    - Eliminated opaque white overlay washing out the building; restored full architectural photograph showing cantilever, soffits, sky, and reflection pool.
    - Implemented localized, subtle translucent warm-ivory haze (`from-background/75 via-background/40 to-transparent`) that dissolves naturally into the photo without harsh vertical borders.
  - Built interactive Valuation Studio (`/predict`) supporting both stateless and persistent prediction workflows, validating Pune residential inputs against model operational bounds.
  - Updated Valuation Standards & Methodology panels to strictly distinguish 5-Fold Spatial GroupKFold Cross-Validation (MAE: ₹16.07L) from Frozen 20% Held-Out Test Evaluation (MAE: ₹17.35L, RMSE: ₹40.71L, R²: 0.807) and empirical latency (~6.6ms inference engine mean).
  - Standardized Portfolio Dashboard (`/dashboard`) and Personal Analytics (`/analytics`) ensuring all metrics derive exclusively from authenticated user records without fabricated market indices.
  - Implemented honest disclosures for deferred capabilities: Saved property bookmarking (`/properties` - Phase P2 roadmap) and automated password reset mailer (`/forgot-password` - SRS FR-AUTH-006 deferred).
- [x] **Phase 10 (Final Hero Art Direction & Composition Polish)**:
  - Integrated oversized architectural `ESTORA` wordmark into `frontend/src/components/motion/parallax-hero-image.tsx` using a synchronized 4-layer composition (base photograph, wordmark, subpixel foreground building cutout, and localized organic haze).
  - Generated optimized 1:1 foreground WebP silhouette (`frontend/public/images/hero-architecture-foreground.webp`, 249 KB) so that the concrete cantilever, upper roofline, terrace, and trees naturally obscure the letters with anti-aliased subpixel fidelity.
  - Synchronized scroll parallax across base image, wordmark, and foreground layer for zero-drift physical depth.
  - Eliminated synthetic card container in `frontend/src/app/(marketing)/page.tsx`, refining headline balance (`text-4xl sm:text-5xl md:text-6xl lg:text-[4rem]`), concise eyebrow, and verified metrics.
  - Added smooth anchor navigation for `#provenance` to the empirical evidence section.
  - Established ADR-010 in `docs/technical/technical_decisions.md`.
  - Archived verbatim prompt to `prompts/frontend/002_hero_art_direction_and_visual_polish.md`.
  - Re-verified 185/185 tests passing and 21/21 routes compiling cleanly.

### Current State
- All roadmap phases (Phases 1 through 10 / Sprints A, B, and C + Final Art Direction) completed and verified.
- **185 automated tests passing** (70 Frontend Vitest + 89 Backend Pytest + 26 ML Pipeline Pytest).
- TypeScript compile (`tsc --noEmit`) and Next.js production bundle build (`npm run build`) passing with zero errors.
- Both FastAPI backend (`http://127.0.0.1:8000`) and Next.js frontend (`http://localhost:3000`) verified and operational.
