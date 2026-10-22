# Database Design & Relational Foundation

## 1. Overview & Architectural Principles

Estora utilizes a PostgreSQL relational database managed by SQLAlchemy 2.0 ORM and Alembic schema migrations.

### Core Architectural Decisions:
- **Environment-Driven Configuration**: Database connection components (`POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) and direct connection URL overrides (`DATABASE_URL`) are read via Pydantic `BaseSettings`. Zero hardcoded passwords or secrets.
- **Fixed-Precision Monetary Representation**: To prevent binary floating-point representation drift, valuation estimates are strictly defined as `Numeric(14, 2)` with mandatory ISO currency codes (`INR`) and explicit scale units (`lakhs` or `raw_currency`).
- **Target Separation**: Predictions explicitly tag `prediction_type` (`sale_price` vs. `monthly_rent`), preventing any conflation between property sales and rental rates.
- **Binary Isolation**: Machine learning model artifacts (`.joblib` binaries) and raw training datasets are **never** stored in PostgreSQL. The database stores strictly structured metadata, feature schemas, evaluation metrics, and verified filesystem paths.
- **Zero Plaintext Passwords**: Password fields store salted cryptographic hashes (`bcrypt` / `argon2`).

---

## 2. Entity-Relationship Schema

```mermaid
erDiagram
    users ||--o{ predictions : "authors"
    users {
        uuid id PK
        varchar(255) email UK "indexed"
        varchar(255) hashed_password
        varchar(100) full_name
        varchar(30) role "visitor | authenticated_user | admin"
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    predictions {
        uuid id PK
        uuid user_id FK "nullable for visitors, CASCADE on user deletion"
        varchar(30) prediction_type "sale_price | monthly_rent"
        json property_inputs "immutable input features snapshot"
        numeric(14,2) estimated_price "exact decimal"
        varchar(3) currency "INR"
        varchar(20) currency_unit "lakhs"
        varchar(50) model_version "indexed"
        varchar(100) supported_geography
        text disclaimer
        timestamptz created_at "indexed"
    }

    model_artifacts {
        uuid id PK
        varchar(100) model_name
        varchar(50) model_version UK "indexed"
        varchar(30) prediction_type "indexed"
        varchar(255) artifact_path "filesystem reference, no binaries"
        json feature_schema "feature names and categories"
        json metrics "CV MAE, Holdout MAE, RMSE, R2"
        varchar(100) supported_geography
        boolean is_active "indexed"
        timestamptz trained_at
        timestamptz created_at
        timestamptz updated_at
    }
```

---

## 3. Table Specifications

### 3.1 `users` Table
Stores authentication credentials, access roles, and account status.
- `id` (`UUID`, PK, default `uuid.uuid4`): Unique user identifier.
- `email` (`VARCHAR(255)`, UNIQUE, INDEX, NOT NULL): User email / login identifier.
- `hashed_password` (`VARCHAR(255)`, NOT NULL): Salted cryptographic hash.
- `full_name` (`VARCHAR(100)`, NULLABLE): Display name.
- `role` (`VARCHAR(30)`, NOT NULL, DEFAULT `'authenticated_user'`): Role tier (`visitor`, `authenticated_user`, `admin`).
- `is_active` (`BOOLEAN`, NOT NULL, DEFAULT `true`): Account status flag.
- `created_at` (`TIMESTAMPTZ`, NOT NULL, default `NOW()`): UTC account creation timestamp.
- `updated_at` (`TIMESTAMPTZ`, NOT NULL, default `NOW()`, onupdate `NOW()`): UTC account update timestamp.

### 3.2 `predictions` Table
Stores historical valuation estimates, property input snapshots, model provenance, and legal disclaimers.
- `id` (`UUID`, PK, default `uuid.uuid4`): Unique prediction record identifier.
- `user_id` (`UUID`, FK `users.id` ON DELETE CASCADE, INDEX, NULLABLE): User owning this prediction. `NULL` denotes anonymous/visitor estimates.
- `prediction_type` (`VARCHAR(30)`, NOT NULL, INDEX, DEFAULT `'sale_price'`): Domain target type (`sale_price` or `monthly_rent`).
- `property_inputs` (`JSON`, NOT NULL): Full snapshot of property features submitted during inference (e.g. `area_sqft`, `bhk`, `bathrooms`, `locality`, `property_status`, `furnishing_status`).
- `estimated_price` (`NUMERIC(14, 2)`, NOT NULL): Model output in fixed-precision decimal format.
- `currency` (`VARCHAR(3)`, NOT NULL, DEFAULT `'INR'`): ISO 4217 currency code.
- `currency_unit` (`VARCHAR(20)`, NOT NULL, DEFAULT `'lakhs'`): Monetary scale unit.
- `model_version` (`VARCHAR(50)`, NOT NULL, INDEX): Version tag of the generating artifact (e.g., `pune_sale_v1`).
- `supported_geography` (`VARCHAR(100)`, NOT NULL, DEFAULT `'Pune, Maharashtra, India'`): Geographic operational boundary.
- `disclaimer` (`TEXT`, NOT NULL): Mandatory explanatory decision-support text.
- `created_at` (`TIMESTAMPTZ`, NOT NULL, INDEX, default `NOW()`): UTC timestamp of inference.

### 3.3 `model_artifacts` Table
Maintains registry metadata of trained and verified pipelines.
- `id` (`UUID`, PK, default `uuid.uuid4`): Unique registry entry.
- `model_name` (`VARCHAR(100)`, NOT NULL): Human-readable model title.
- `model_version` (`VARCHAR(50)`, UNIQUE, INDEX, NOT NULL): Canonical model tag (e.g., `pune_sale_v1`).
- `prediction_type` (`VARCHAR(30)`, NOT NULL, INDEX): Target domain (`sale_price` or `monthly_rent`).
- `artifact_path` (`VARCHAR(255)`, NOT NULL): Relative filesystem path to `.joblib` pipeline (no binaries stored in DB).
- `feature_schema` (`JSON`, NOT NULL): Feature names, types, and categorical levels.
- `metrics` (`JSON`, NOT NULL): Benchmark metrics (e.g., CV MAE, holdout MAE, RMSE, R²).
- `supported_geography` (`VARCHAR(100)`, NOT NULL): Geographic bounds.
- `is_active` (`BOOLEAN`, NOT NULL, INDEX, DEFAULT `true`): Approval flag for active HTTP serving.
- `trained_at` (`TIMESTAMPTZ`, NOT NULL): UTC model training date.
- `created_at`, `updated_at` (`TIMESTAMPTZ`, NOT NULL): Standard audit timestamps.

---

## 4. Alembic Migration Lifecycle

Alembic migrations are configured under `backend/alembic.ini` and `backend/migrations/`.

### Migration Execution Commands:
From the `backend/` directory:
```bash
# Apply all pending migrations to target database
alembic upgrade head

# Roll back the most recent migration
alembic downgrade -1

# Roll back all migrations to clean state
alembic downgrade base

# View current migration revision
alembic current

# View migration history
alembic history --verbose
```

---

## 5. Local Setup & Credentials Guide

### When Should You Configure DB Credentials?
You should configure your real database credentials in your local `.env` file **when you are ready to connect to a live PostgreSQL service** (either installed natively on your OS or run via Docker).

- **During Unit & Migration Testing (Phase 5)**: No real PostgreSQL credentials or live server are required. All tests run against disposable, in-memory SQLite with foreign keys enforced, isolating tests and ensuring 100% determinism.
- **Before Starting FastAPI Endpoint Development (Phase 6)**: Start your PostgreSQL service, create the local `estora` database, copy `backend/.env.example` to `backend/.env`, populate your PostgreSQL password, and execute `alembic upgrade head`.

### Running PostgreSQL with Docker:
```bash
docker run --name estora-postgres -e POSTGRES_DB=estora -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
```

### Running Native PostgreSQL:
1. Ensure PostgreSQL is installed and listening on port 5432.
2. Create database:
   ```sql
   CREATE DATABASE estora;
   ```
3. Set in your `.env` (never committed to git):
   ```env
   POSTGRES_SERVER=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=estora
   ```
4. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```
