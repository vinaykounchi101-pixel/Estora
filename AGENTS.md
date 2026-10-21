# Estora - Agent Guidelines & Project Rules

You are working on **Estora** (Real Estate Price Prediction Platform).

Estora is a professional, portfolio-quality decision-support platform designed to estimate residential property sale prices and monthly rents using validated machine-learning models, supported by an Editorial Luxury web application and robust FastAPI backend.

Follow these core rules:

1. Do not change folder structture 
2. Do work Evnironment variable driven
3. Do not push .env file 
4. Do not access .env file 
5. Do not hardcode anything
6. Ask for permission wherever required
7. Before starting any work give me a call "Roger That" 
    and when the work is done give me call "Over n Out"
8. Whenever i say "bye" you have to commit and push everything and update progress file and technical file 
    and also store everything from that session to your own repo memory and after its done say "Signing off".
    - Note: If an active feature branch is still in progress / incomplete when "bye" is called, commit and push its work-in-progress state on that feature branch without merging or deleting it. Only completed and verified features are merged into `dev` and cleaned up.
9. Git Branching & Self-Approval Strategy:

    - Maintain a persistent `dev` integration branch off `main`.
    - All work must be conducted on isolated feature branches branched from `dev` (e.g., `feat/<name>`, `fix/<name>`).
    - When a feature is completed and verified, self-approve and merge it directly into `dev` without waiting for external pull/approval.
    - Immediately delete and clean up the feature branch after merging to keep the repository clean.


---

## Architectural Boundaries & Repository Mapping

Adhere strictly to the defined project layer boundaries (per SRS Section 13):

- `frontend/`: User interface and typed API client (Next.js, React, TypeScript, Tailwind CSS).
- `backend/app/api/v1/`: Thin FastAPI controllers/routes and Pydantic request/response schemas.
- `backend/app/services/`: Application business logic and orchestration use cases.
- `backend/app/repositories/`: Data access layer isolating database interactions.
- `backend/app/db/`: SQLAlchemy base, models, and session management.
- `backend/app/integrations/`: Safe adapter connecting FastAPI request lifecycle to the ML inference engine.
- `ml/src/real_estate_ml/`: Core reusable Python package for data processing, feature engineering, model training, evaluation, and inference.
- `ml/training/scripts/`: Thin command-line entry points executing workflows via `real_estate_ml`.
- `ml/training/data/`: Data partition stages (`raw/`, `interim/`, `processed/`) — raw and interim datasets remain gitignored.
- `ml/artifacts/`: Serialized model artifacts (`.joblib`/pipeline) and metadata JSON files (gitignored).
- `ml/training/reports/`: Data audit logs, evaluation metrics, and split documentation.
- `docs/`: PRD, SRS, architecture specs, and dataset provenance notes.

---

## Additional Project Rules

### 1. Code Quality & Modularity
- Do not hardcode values that belong in configuration, constants, environment variables, or design tokens.
- No inline styling. Rely on the project's styling system, reusable classes, and shared components.
- Do not duplicate constants, configuration, validation rules, or UI values across modules.
- Prefer reusable utilities and modular components over repetitive inline implementations.
- Keep functions, API routes, and components focused and reasonably small.
- Do not add unnecessary third-party dependencies.

### 2. Machine Learning & Data Governance
- **Distinct Targets**: Treat sale-price and monthly-rent predictions as separate workflows and distinct models. Never conflate sale price with rental rates.
- **Data Provenance & Audit**: Every dataset must be audited for source terms, licensing, collection dates, geography, target definitions, and data leakage before training.
- **Price Semantics**: Clearly distinguish and label listing/asking prices versus completed transaction prices.
- **Leakage Prevention**: Split data into train and held-out evaluation sets *before* fitting any data-dependent transformers. Ensure no duplicate property records leak across partitions.
- **Model Evaluation**:
  - Establish a simple baseline (e.g., median regressor).
  - Compare multiple valid regression models (e.g., Linear Regression, Random Forest, HistGradientBoosting). Do not use classification algorithms for continuous target estimation.
  - Report held-out MAE and RMSE in target currency, alongside R².
  - Never fabricate or advertise an arbitrary "accuracy percentage".
  - Perform geographic/locality and temporal evaluation where data supports it.
- **Reproducible Artifacts**: Bundle preprocessing and estimator into a unified, versioned pipeline artifact accompanied by structured metadata (target, feature schema, metrics, training date, supported geography).
- **Synthetic Data Isolation**: Synthetic or dummy data may only be used for unit/pipeline tests and must never be represented as real-market predictive evidence.

### 3. Model Inference & Lifecycle
- **No Training in Web Requests**: The backend serves predictions using pre-loaded, approved artifacts. Never trigger model training or expensive data processing during HTTP requests.
- **Safe Loading**: Load model artifacts exclusively from controlled local paths or designated registries. Never load untrusted, unverified pickle/joblib files from user input.
- **Artifact Validation**: Check feature schema compatibility and artifact metadata at application startup or via explicit reload routines.
- **Graceful Failure**: If a model artifact is missing or corrupt, return a clear structured error—never return fabricated or mock estimates.
- **Coverage & Disclaimers**: Restrict predictions strictly to validated, supported geographies. Reject unsupported locations with clear guidance rather than generating misleading predictions. Every estimate response must include currency, model version, and an explanatory decision-support disclaimer.

### 4. Architecture & Backend Standards
- Keep API routes/controllers thin. Business logic belongs in `services/`.
- Database operations belong strictly in `repositories/`.
- Direct communication between frontend and backend must go through the typed API client under `/api/v1/`.
- Backend validation via Pydantic is authoritative and mandatory.
- Follow status codes, error formats, and endpoint contracts defined in the SRS (`/api/v1/auth`, `/api/v1/predictions`, `/api/v1/analytics`, `/api/v1/admin`, etc.).
- Do not invent undocumented endpoints or alter contracts without updating specs.

### 5. Database & Data Integrity
- Use PostgreSQL as defined by the SRS, managed via SQLAlchemy and Alembic.
- All schema changes must be executed via Alembic migrations. Manual schema alterations in the database are prohibited.
- Do not use floating-point types for monetary values; use integer or fixed-precision numeric types with explicit currency codes.
- Ensure area measurements and units (e.g., sq. ft., sq. meters) are strictly standardized and documented.
- Store timestamps consistently with timezone awareness (`UTC`).
- Ensure prediction records store snapshots of inputs, model version, currency, and timestamps for historical fidelity.
- Seed only data explicitly required by the SRS, ensuring idempotency without duplicates. Do not add fake financial data.

### 6. UI/UX & Editorial Luxury Design System
- Adhere to the **Editorial Luxury** design direction:
  - Palette: Warm Ivory (`#F8F6F1`), Sand (`#E9DFCF`), Muted Gold (`#B69A63`), Charcoal (`#252722`), Sage (`#87917B`).
  - Warm, light primary backgrounds with selective charcoal panels for high-contrast architectural emphasis.
  - Refined typography, architectural imagery, generous spacing, and clear visual hierarchy.
- Responsive design across desktop, tablet, and mobile form factors.
- Ensure accessible forms, clear field labels, and distinct error/warning messages for unsupported locations.
- Implement comprehensive component states: loading skeletons, empty states, validation errors, and system error boundaries.
- Restrain animations; motion must enhance usability and never obstruct core flows.

### 7. Security & Environment
- Everything must be environment-variable driven.
- Never commit or push `.env` files or secret keys to source control.
- Never access real `.env` secrets directly.
- Maintain `.env.example` with clear variable descriptions and safe placeholder values.
- Hash passwords using strong, standard hashing algorithms (e.g., bcrypt/argon2); plaintext password storage is forbidden.
- Enforce strict server-side role-based authorization (Visitor, Authenticated User, Administrator).
- Never expose internal stack traces, system paths, or model internals in client-facing error responses.

### 8. Testing & Verification
- Unit tests: Input validation, feature transformation, normalization routines, model loading, authorization logic.
- Integration tests: Database persistence, user ownership scoping (users can only access their own history), inference pipeline execution.
- ML tests: Pipeline reproducibility on test fixtures, held-out metric verification, compatibility checks.
- End-to-end flows: Registration, authentication, prediction submission, result display, history retrieval, and admin route protection.
- A feature is not complete until its associated tests pass.

### 9. Scope & Phasing
- Focus strictly on **P0 (MVP)** features as defined in `PRD.md` and `SRS.md`.
- Defer P1 (dashboard analytics charts, pagination filters, admin audit logging) and P2 (multi-city expansion, automated retraining) until P0 baseline is established and verified.
- Do not add speculative code or dependencies for future phases.
- Before making significant architectural changes, verify against `PRD.md`, `SRS.md`, and the Design System.

### 10. Git Branching & Merging Lifecycle (Standard Operating Procedure)
- **Branch Hierarchy**: `main` (production-ready) ← `dev` (active integration) ← `feat/<feature-name>` (atomic development).
- **Step 1: Feature Branch Creation**: Always branch off the latest `dev`:
  ```bash
  git checkout dev
  git pull origin dev  # if remote configured
  git checkout -b feat/<feature-name>
  ```
- **Step 2: Isolated Development & Atomic Commits**:
  - Implement the feature following project rules (environment-variable driven, no hardcoding, no secrets).
  - Add associated unit/integration tests and verify they pass.
  - Commit changes with clear, semantic commit messages:
    ```bash
    git add .
    git commit -m "feat(<scope>): <description of changes>"
    ```
- **Step 3: Autonomous Verification & Self-Approval**:
  - Run verification tests and linting to ensure zero regressions.
  - No external PR/code-review blocker: we self-approve once requirements and tests are satisfied.
- **Step 4: Merge to `dev`**:
  - Switch to `dev` and merge with `--no-ff` to preserve feature commit history:
    ```bash
    git checkout dev
    git merge --no-ff feat/<feature-name> -m "Merge feature: <feature-name>"
    ```
- **Step 5: Immediate Branch Cleanup**:
  - Delete the feature branch immediately after successful merge:
    ```bash
    git branch -d feat/<feature-name>
    ```
  - If a remote feature branch was pushed, delete it as well:
    ```bash
    git push origin --delete feat/<feature-name>
    ```