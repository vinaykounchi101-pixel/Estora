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



