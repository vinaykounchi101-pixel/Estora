# Prompt 001: Database Foundation

- **Category**: `backend`
- **Timestamp**: `2026-10-22T18:17:59+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: Completed

---

## Verbatim Prompt Text

PROJECT: Estora — Real Estate Price Prediction Platform
PHASE 5: DATABASE FOUNDATION

Objective:
Inspect the existing repository and implement a reliable PostgreSQL database foundation before building database-dependent FastAPI features.

MANDATORY FIRST STEPS
1. Read AGENTS.md and all relevant architecture, SRS, PRD, folder structure, and database-related documentation.
2. Inspect the existing backend, dependencies, configuration, tests, .gitignore, and Git status.
3. Review existing requirements before proposing tables. Reuse existing code where appropriate. Do not duplicate or replace working components without justification.
4. Never read, print, expose, or modify actual .env secrets. Inspect .env.example only.

DATABASE DESIGN
1. Use PostgreSQL as the target database.
2. Use SQLAlchemy 2.x ORM and Alembic for versioned schema migrations, unless the repository already has a documented compatible choice.
3. Define a minimal but extensible MVP schema based on documented requirements. Consider users/authentication, saved prediction history, model/version metadata, and audit fields only where justified by the requirements.
4. Define primary keys, foreign keys, uniqueness, indexes, timestamps, nullability, and deletion behavior explicitly.
5. Store predicted prices with appropriate numeric precision and explicit currency/units. Preserve the distinction between sale-price and future rent predictions.
6. Do not store raw training datasets or serialized ML model binaries in PostgreSQL.
7. Do not store passwords in plaintext. Authentication implementation is not part of this phase.
8. Avoid collecting unnecessary personal data. Do not invent property market facts.

CONFIGURATION AND MIGRATIONS
1. Provide environment-based database configuration and a safe .env.example with placeholders only.
2. No hardcoded credentials, insecure production fallbacks, or secret values.
3. Configure SQLAlchemy engine/session creation appropriately for the existing project.
4. Create an initial Alembic migration and verify upgrade/downgrade behavior where practical.
5. Add a documented local development setup, including PostgreSQL prerequisites and migration commands. Do not assume Docker is installed; if Docker support already exists, document it.
6. Ensure database URLs and local data files are not accidentally committed.

TESTS AND VERIFICATION
1. Add tests for ORM/schema constraints and database configuration.
2. Use a disposable test database or SQLite only for unit-level tests where compatible; explicitly verify PostgreSQL-specific behavior against PostgreSQL if available.
3. Never reset, drop, or migrate a non-test database without explicit authorization.
4. Run available tests and migrations. If PostgreSQL is unavailable, clearly state which checks were not executed; do not claim connectivity or migration success.
5. Confirm current ML training, validation, and artifacts remain untouched.
6. Do not implement FastAPI business endpoints, inference integration, frontend changes, authentication flows, or prediction-history APIs in this phase.

PROMPT ARCHIVING
Save this task prompt verbatim under prompts/ using the established project convention, e.g. prompts/database/001_database_foundation.md. Inspect the existing prompt-capture mechanism and follow its actual workflow. Do not claim automatic capture unless tested.

DELIVERABLES
- Database schema/design documentation and rationale.
- SQLAlchemy models and database/session configuration as appropriate.
- Alembic configuration and initial migration.
- Safe .env.example updates if needed.
- Database setup/migration instructions.
- Tests and actual test/migration results.
- Summary of changed files, commands run, blockers, and remaining work.

GIT RULES
Do not commit or push. Preserve unrelated changes. Report existing Git status before and after. Do not modify raw/processed ML data or model artifacts.
Distinguish implemented and verified behavior from planned work.

tell me when should i configure db credentials
