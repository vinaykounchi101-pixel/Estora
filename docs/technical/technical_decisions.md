# Technical Decisions Log (ADR)

Records architectural decision records (ADRs), rationales, and technical trade-offs for Estora.

---

## ADR-001: Standard Repository Structure and Boundary Isolation

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  The project requires a portfolio-quality decision-support platform combining a Next.js frontend, a FastAPI backend, and an offline scikit-learn ML pipeline. Clear architectural boundaries are needed to prevent business logic leakage, ensure testability, and avoid circular dependencies.
- **Decision:**
  Adopt the multi-tier structure specified in SRS Section 13:
  1. `frontend/`: Standalone Next.js App Router application communicating strictly via typed API client.
  2. `backend/`: Thin FastAPI controllers (`api/v1/endpoints/`), Pydantic validation (`schemas/`), domain business logic (`services/`), database persistence (`repositories/`), and integration adapters (`integrations/`).
  3. `ml/`: Strict separation between offline exploration/training (`ml/training/`) and production inference library (`ml/src/real_estate_ml/`).
- **Consequences:**
  - High cohesion and clear ownership across full-stack layers.
  - Zero coupling between backend web request lifecycles and ML model training logic.

---

## ADR-002: Machine Learning Target & Lifecycle Separation

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  Residential sale prices and monthly rental rates exhibit distinct market dynamics, financial scale, and feature relationships. Training or predicting them within a unified model introduces semantic confusion and estimation error.
- **Decision:**
  - Enforce separate workflows, preprocessing pipelines, estimators, and serialized artifacts for `sale_price` and `monthly_rent`.
  - Prohibit training during HTTP request lifecycles; inference exclusively serves pre-validated, loaded artifacts.
  - Require held-out evaluation (MAE, RMSE, R²) before promoting artifacts to production.
- **Consequences:**
  - Protects against target leakage and semantic distortion.
  - Ensures deterministic, fast inference at runtime.

---

## ADR-003: Autonomous Git Branching, Self-Approval, and Cleanup Lifecycle

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  A solo/pair-programming development lifecycle requires high velocity without external PR approval blockers, while ensuring `main` and `dev` branches remain stable and clean.
- **Decision:**
  - `main` represents stable, verified milestone releases.
  - `dev` serves as the continuous integration integration branch.
  - All atomic development occurs on dedicated feature branches (`feat/<name>`, `fix/<name>`).
  - Upon passing automated tests and requirements, the agent autonomously self-approves and merges directly into `dev` using `--no-ff`.
  - Completed feature branches are immediately deleted locally and remotely.
  - When closing a session (`bye`), incomplete feature branches remain on their feature branch in a WIP committed/pushed state without premature merging.
- **Consequences:**
  - Zero external blocking delays.
  - Clean, unpolluted branch namespace.
  - Preserves history and guarantees that only verified work touches `dev`.

---

## ADR-004: Residential Sale-Price Model Selection & Validation Protocol

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  Accurately estimating residential property sale prices in Pune requires handling strong geographic concentration, non-linear feature interactions, and skewed price distributions without spatial data leakage.
- **Decision:**
  - Evaluate models using 5-Fold `GroupKFold` cross-validation grouped strictly on `locality` to prevent neighborhood records leaking between train and validation folds.
  - Apply `TransformedTargetRegressor` with `log1p`/`expm1` to model logarithmic price elasticity while evaluating errors in real INR Lakhs.
  - Select `HistGradientBoostingRegressor(log1p)` based on lowest held-out error (CV MAE: ₹16.07L ± 0.98L, Holdout MAE: ₹17.35L, $R^2$: 0.8066) compared to linear and tree baselines.
  - Bundle preprocessing (`StandardScaler`, `OneHotEncoder(handle_unknown='ignore')`) and estimator into an atomic serialized pipeline (`.joblib`) with a companion metadata manifest JSON.
- **Consequences:**
  - Robust generalization across known and unseen localities.
  - Guarantees positive price outputs with zero training-serving skew.

---

## ADR-005: Relational Database Architecture & Fixed-Precision Financial Schema

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  FastAPI application persistence requires a secure, scalable relational database foundation for user authentication, historical predictions, and model registry metadata.
- **Decision:**
  - Use PostgreSQL managed via SQLAlchemy 2.0 ORM and Alembic migrations.
  - Use `UUIDv4` primary keys for external-facing entities to eliminate ID enumeration attacks.
  - Store monetary figures strictly as `Numeric(14, 2)` with mandatory ISO currency codes (`INR`) and scale units (`lakhs`), prohibiting floating-point types for monetary values.
  - Store immutable snapshots of inference input features (`JSON`) with predictions to preserve historical auditability.
  - Separate `sale_price` and `monthly_rent` targets explicitly via `prediction_type` column.
  - Strictly prohibit raw dataset records and serialized ML binaries from being stored in PostgreSQL (only metadata and verified filesystem paths are stored).
- **Consequences:**
  - High financial precision and audit fidelity.
  - Zero binary bloat in the relational database.
  - Seamless testing against in-memory SQLite and migration execution against production PostgreSQL.

---

## ADR-006: Backend API Architecture, Security, and ML Inference Integration

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  Serving residential valuations and managing user portfolios requires a layered, thin-controller backend architecture with secure authentication, strict input validation, and role-based access control.
- **Decision:**
  - Build on FastAPI with thin controllers in `app/api/v1/endpoints/`, domain business logic in `app/services/`, and data access in `app/repositories/`.
  - Use salted `bcrypt` for password hashing and signed `HS256` JWT access tokens with embedded user ID and role claims for authentication.
  - Implement three distinct role tiers: Visitor (anonymous predictions allowed, no private data access), Authenticated User (personal prediction history, profile management), and Administrator (system-wide analytics, user audits, model registry inspection).
  - Enforce user data isolation at the service/repository layer: authenticated users can only view their own prediction history and details (`403 Forbidden` enforced on cross-user access).
  - Integrate ML inference via a dedicated adapter `backend/app/integrations/ml_inference.py` wrapping the offline `SalePricePredictor` pipeline, keeping route handlers decoupled from ML internals.
- **Consequences:**
  - Strict separation of concerns across controller, service, repository, and ML layers.
  - Complete protection against cross-tenant data leaks and unauthorized administrative actions.
  - Zero ML training inside HTTP requests; pure pre-loaded artifact inference.

---

## ADR-007: Request Correlation Tracking, Health Probes, and Error Boundaries

- **Date:** 2026-10-22
- **Status:** Approved
- **Context:**
  Production observability, container orchestration, and security require request tracing, standard liveness/readiness probes, and error handling that prevents internal system stack traces from leaking to clients.
- **Decision:**
  - Implement `RequestCorrelationMiddleware` attaching and propagating unique `X-Request-ID` headers across all requests and responses, with performance timing (`X-Response-Time-Ms`).
  - Implement separate liveness (`/api/v1/health/live` for process uptime) and readiness (`/api/v1/health/ready` for DB connectivity and model artifact readiness) probes returning standard HTTP status codes without exposing internal credentials, connection strings, or server filesystem paths.
  - Implement centralized exception handlers for `RequestValidationError` (422), `HTTPException`, and unhandled server errors (500) logging full stack traces internally while returning opaque, structured error envelopes to clients.
- **Consequences:**
  - Complete request traceability across backend logs.
  - Orchestration readiness without credential exposure.
  - Hardened error responses preventing information disclosure.

---

## ADR-008: Stateless ML Inference Endpoint and Lifespan Preloading

- **Date:** 2026-10-23
- **Status:** Approved
- **Context:**
  Serving residential valuations with sub-50ms latency requires preloading the serialized machine learning pipeline into memory at application startup rather than reading disk artifacts per request. Furthermore, decision-support property estimators require a stateless, public valuation route (`POST /api/v1/predictions/sale-price`) that enforces the exact 9-feature schema without requiring database session allocation or user authentication.
- **Decision:**
  - Preload the approved `pune_sale_v1.joblib` artifact and metadata during FastAPI `lifespan` context manager startup, caching it in memory.
  - Expose `get_sale_predictor_dependency()` for FastAPI dependency injection, enabling deterministic mock/fake predictor overrides during unit and API integration testing.
  - Implement `POST /api/v1/predictions/sale-price` adhering to `SalePriceInferenceRequest` (validating `square_ft`, `bhk_no`, `latitude`, `longitude`, `posted_by`, `address`, `rera`, `ready_to_move`, `resale`) and `SalePriceInferenceResponse`.
  - Reconcile `GET /api/v1/health/ready` to verify model inference availability via `is_sale_predictor_available()`, keeping process liveness (`/api/v1/health/live`) decoupled.
  - Honor `ESTORA_ARTIFACTS_DIR` environment variable for artifact directory location with fallback to package/repo relative paths.
- **Consequences:**
  - Zero disk I/O during prediction requests; high throughput and low latency.
  - Test suite can run deterministically without depending on physical artifacts or network resources.
  - Clean separation between stateless prediction inference and historical database snapshot persistence.

---

## ADR-009: Visual Hierarchy, Localized Atmospheric Hero Haze, and Empirical Telemetry Reporting

- **Date:** 2026-10-25
- **Status:** Approved
- **Context:**
  The initial hero section suffered from a broad, opaque white overlay that obscured key architectural features of the primary imagery (cantilever, soffits, and reflection pool). Furthermore, market-facing latency claims required empirical grounding against the live ML inference engine, and validation metrics required strict demarcation between Spatial GroupKFold CV and Frozen 20% Held-Out test evaluation to maintain portfolio-grade research integrity.
- **Decision:**
  - In `frontend/src/components/motion/parallax-hero-image.tsx`, replace the opaque 42% white overlay with a localized, subtle translucent warm-ivory haze (`from-background/75 via-background/40 to-transparent`) and adjust background alignment to `object-[58%_center]`, preserving the complete architectural photograph across mobile, tablet, and desktop viewports.
  - In `frontend/src/app/(marketing)/page.tsx`, introduce micro-localized text backdrop contrast shields and soft shadows, ensuring WCAG 2.1 AA text legibility without requiring heavy image filters or solid color masks.
  - Conduct empirical inference latency benchmarking on the live pipeline: document ~6.6ms mean engine inference and `< 65ms` HTTP roundtrip rather than arbitrary unverified figures.
  - Explicitly partition and label model evaluation disclosures in `predict/page.tsx` and `methodology/page.tsx`: 5-Fold GroupKFold CV MAE (₹16.07L ± 0.98L), Holdout MAE (₹17.35L), Holdout $R^2$ (0.807), and historical circa-2020 listing price semantics.
- **Consequences:**
  - Preserves the full architectural photograph as the visual center of the editorial luxury landing experience.
  - Completely honest, reproducible, and verifiable performance and valuation claims across all marketing and application screens.
  - Consistent visual rhythm, standardized typography scale, and unified component styling across all 21 application routes.

---

## ADR-010: Oversized Architectural Brand Wordmark and Synchronized Foreground Occlusion Layering

- **Date:** 2026-10-26
- **Status:** Approved
- **Context:**
  The landing-page hero required a distinct, high-impact editorial identity blending oversized brand typography naturally with the architectural villa photograph without appearing as a superficial text overlay or watermark. The letters needed to sit in physical space behind the villa's roofline, cantilever, terrace, and pool reflection.
- **Decision:**
  - Introduce an oversized uppercase `ESTORA` wordmark in `frontend/src/components/motion/parallax-hero-image.tsx` using `font-serif` (Playfair Display) with wide letter tracking (`0.14em` to `0.26em`) and dynamic responsive scaling (`text-[15vw]` down to `text-[12vw]`).
  - Implement a synchronized 4-layer composition:
    1. Layer 1: Base architectural photograph (`hero-architecture.jpg`).
    2. Layer 2: Oversized ESTORA wordmark in the twilight sky.
    3. Layer 3: Anti-aliased 1:1 foreground building cutout (`hero-architecture-foreground.webp`, 249 KB) obscuring the letters behind concrete slabs and foliage.
    4. Layer 4: Organic, localized left-edge haze dissolving by 50% into the photograph.
  - Bind all three visual layers into the same transform wrapper (`translate3d(0, ${offsetY}px, 0)`), ensuring zero drift during scroll parallax.
  - Eliminate synthetic background cards in `frontend/src/app/(marketing)/page.tsx` for a clean editorial headline composition.
- **Consequences:**
  - Delivers a portfolio-grade, magazine-editorial hero experience where typography feels physically integrated into the architecture.
  - Zero performance regression (WebP asset is ~249 KB; production build compiles 21/21 routes with 0 errors).
  - Clean separation across light and dark modes with full accessibility.

