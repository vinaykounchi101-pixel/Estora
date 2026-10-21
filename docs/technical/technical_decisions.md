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
