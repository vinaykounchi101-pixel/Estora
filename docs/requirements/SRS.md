# Software Requirements Specification (SRS)

## Real Estate Price Prediction Platform

**Document version:** 1.0 --- Draft\
**Status:** Requirements baseline for review\
**Last updated:** 21 October 2026\
**Related document:** `PRD.md`

------------------------------------------------------------------------

## 1. Purpose

This SRS specifies the expected software behaviour, interfaces,
constraints, quality requirements, and verification criteria for the
Real Estate Price Prediction Platform. It translates the product goals
into requirements that developers and testers can implement and verify.

It is not a claim that the system has already been built.
Dataset-dependent requirements remain conditional until the selected
data has been audited.

## 2. System Scope

The system consists of: 1. A web frontend for public information,
authentication, predictions, history, profile, and administration. 2. A
FastAPI backend exposing versioned HTTP APIs. 3. A PostgreSQL database
for application records. 4. An offline ML training package for data
preparation, training, evaluation, and artifact export. 5. A model
inference integration that loads approved artifacts and serves
predictions through the backend. 6. Tests, documentation, configuration,
and deployment support.

### 2.1 Proposed technology baseline

-   Frontend: Next.js, React, TypeScript, Tailwind CSS (confirm before
    implementation).
-   Charts: Recharts or an equivalent maintained chart library if
    analytics charts are included.
-   Backend: FastAPI and Python.
-   Database: PostgreSQL.
-   ORM and migrations: SQLAlchemy and Alembic (proposed).
-   ML: Pandas, NumPy, scikit-learn, joblib.
-   Testing: pytest for Python; suitable frontend unit and end-to-end
    testing tools to be selected.
-   Local development and training should not require paid AI services
    or a GPU.

## 3. Definitions

-   **Prediction:** An estimated sale price or monthly rent generated
    from submitted property features.
-   **Training:** Offline fitting and evaluation of a model using
    historical examples.
-   **Inference:** Applying an already-trained model to new inputs.
-   **Artifact:** A saved, versioned model pipeline and associated
    metadata.
-   **Supported geography:** A location the deployed model has been
    evaluated to support.
-   **Listing price:** An advertised asking price; not necessarily the
    completed transaction price.
-   **MAE:** Mean Absolute Error.
-   **RMSE:** Root Mean Squared Error.
-   **R²:** Coefficient of determination.
-   **MVP:** Minimum viable product.

## 4. User Classes and Permissions

### 4.1 Visitor

-   Can view public pages and product information.
-   Can access registration and login.
-   Cannot access protected user or admin data.

### 4.2 Authenticated user

-   Can submit predictions for supported targets and locations.
-   Can view their own prediction history and details.
-   Can update permitted profile fields and settings.
-   Cannot view another user's private predictions or use admin
    functions.

### 4.3 Administrator

-   Can access protected administrative views for users, predictions,
    model metadata, analytics, and reports to the extent implemented.
-   Can perform only explicitly authorized administrative actions.
-   Must not be able to change a deployed model by editing arbitrary
    artifact paths through a public API.
-   Administrative actions that materially affect access or system state
    should be logged.

Authorization must be enforced by the backend; hiding a frontend control
is not sufficient.

## 5. Functional Requirements

Requirement IDs are stable references for implementation and testing.
Priorities: P0 = MVP, P1 = important follow-up, P2 = future.

### 5.1 Public and navigation

**FR-PUB-001 (P0):** The frontend shall provide a public landing page
describing the product, its supported prediction types, and its
limitations.\
**FR-PUB-002 (P0):** The frontend shall provide consistent navigation
and responsive layouts across supported screen sizes.\
**FR-PUB-003 (P0):** The frontend shall provide not-found, loading, and
recoverable error states.

### 5.2 Authentication and account

**FR-AUTH-001 (P0):** The system shall allow a visitor to register with
the required account fields.\
**FR-AUTH-002 (P0):** The system shall authenticate registered users and
provide a logout mechanism.\
**FR-AUTH-003 (P0):** The system shall protect authenticated routes and
API operations.\
**FR-AUTH-004 (P0):** The system shall enforce backend authorization for
user and administrator roles.\
**FR-AUTH-005 (P0):** An authenticated user shall be able to view and
update permitted profile fields.\
**FR-AUTH-006 (P1):** The system should provide a secure password-reset
flow if email delivery can be supported without an unsuitable paid
dependency. Otherwise, the MVP must clearly document that this
capability is deferred.\
**FR-AUTH-007 (P0):** Passwords shall never be stored as plaintext.

### 5.3 Prediction requests

**FR-PRED-001 (P0):** The user shall be able to select either sale-price
estimation or monthly-rent estimation.\
**FR-PRED-002 (P0):** The system shall present only the fields required
by the active prediction model and validated dataset schema.\
**FR-PRED-003 (P0):** The system shall validate required fields, data
types, numerical bounds, categorical values, units, and supported
location before inference.\
**FR-PRED-004 (P0):** The system shall reject malformed or unsupported
requests with a structured, understandable error response.\
**FR-PRED-005 (P0):** The backend shall select the correct approved
model pipeline based on the requested prediction target.\
**FR-PRED-006 (P0):** The backend shall apply the same versioned
preprocessing used in training.\
**FR-PRED-007 (P0):** A successful response shall include the estimate,
target type, currency, model version, and an appropriate disclaimer.\
**FR-PRED-008 (P0):** The system shall not describe a model estimate as
a guaranteed transaction or rental amount.\
**FR-PRED-009 (P0):** The system shall not provide an apparently
authoritative estimate for unsupported geography. It shall return a
clear unsupported-coverage response or a warning according to the
approved product policy.\
**FR-PRED-010 (P0):** A prediction shall be saved for an authenticated
user after successful inference, including the input snapshot, output,
target, currency, model version, and timestamp.\
**FR-PRED-011 (P0):** Prediction persistence failure shall be handled
explicitly; the API shall not silently claim the prediction was saved
when persistence failed.\
**FR-PRED-012 (P1):** Prediction requests should include request IDs or
equivalent correlation metadata for troubleshooting.

### 5.4 Prediction history

**FR-HIST-001 (P0):** An authenticated user shall be able to list only
their own predictions.\
**FR-HIST-002 (P0):** A user shall be able to retrieve details for an
individual prediction they own.\
**FR-HIST-003 (P1):** History shall support pagination and filtering by
prediction target and date where practical.\
**FR-HIST-004 (P1):** The system should clearly distinguish historical
prediction results from current market values.

### 5.5 Dashboard and analytics

**FR-AN-001 (P0):** The user dashboard shall show a useful summary of
the user's activity and recent predictions.\
**FR-AN-002 (P1):** The dashboard should include charts only when the
underlying data supports a meaningful interpretation.\
**FR-AN-003 (P1):** Aggregations shall identify their population and
time range; sample prediction history shall not be presented as
representative market statistics.\
**FR-AN-004 (P1):** Analytics pages should handle empty states without
showing misleading zero values or broken charts.

### 5.6 Administration

**FR-ADM-001 (P0):** The system shall provide a backend-protected
administrator area.\
**FR-ADM-002 (P0):** An administrator shall be able to view users and
their relevant account status.\
**FR-ADM-003 (P0):** An administrator shall be able to review prediction
records for operational purposes, subject to access controls.\
**FR-ADM-004 (P0):** An administrator shall be able to view registered
model versions, targets, supported geography, training date, and
evaluation metadata.\
**FR-ADM-005 (P1):** The system should provide aggregate administrative
analytics and reports when reliable data is available.\
**FR-ADM-006 (P1):** Relevant administrative actions should be written
to an audit log.\
**FR-ADM-007 (P0):** The public API shall not expose secrets, raw
training data, unrestricted filesystem paths, or arbitrary model-loading
operations.

### 5.7 ML data preparation and training

**FR-ML-001 (P0):** The training workflow shall retain original source
files unchanged.\
**FR-ML-002 (P0):** The training workflow shall generate an audit report
containing source references, dataset dimensions, column types,
missingness, duplicates, target distributions, geography coverage, date
coverage, and relevant quality warnings.\
**FR-ML-003 (P0):** The workflow shall validate target values, area
units, currencies, categories, duplicates, and missing values according
to documented rules.\
**FR-ML-004 (P0):** The workflow shall distinguish sale-price targets
from monthly-rent targets.\
**FR-ML-005 (P0):** The workflow shall document whether prices are
asking/listing prices, completed transactions, or another measure.\
**FR-ML-006 (P0):** The workflow shall avoid target leakage, including
features that directly reveal the target or information unavailable at
prediction time.\
**FR-ML-007 (P0):** Training and evaluation data shall be separated
before fitting preprocessing steps that learn from data.\
**FR-ML-008 (P0):** The workflow shall establish a simple baseline and
compare at least two reasonable candidate regressors when the dataset
supports comparison.\
**FR-ML-009 (P0):** The workflow shall calculate and save MAE and RMSE,
and R² when meaningful, on held-out data.\
**FR-ML-010 (P0):** The evaluation report shall describe the split
strategy and dataset limitations.\
**FR-ML-011 (P0):** The workflow should evaluate performance by locality
or other relevant subgroup when sample sizes permit.\
**FR-ML-012 (P0):** Where reliable dates exist, the workflow should
consider a time-based test; where geography transfer is a product goal,
it should consider location-aware evaluation.\
**FR-ML-013 (P0):** The workflow shall export the fitted preprocessing
and estimator as a reproducible artifact, together with metadata.\
**FR-ML-014 (P0):** The workflow shall not automatically promote a new
artifact to production solely because training completed successfully.
Promotion requires passing defined evaluation and compatibility checks.\
**FR-ML-015 (P0):** Training scripts shall be thin entry points that
call reusable package code rather than duplicate training logic.\
**FR-ML-016 (P0):** Synthetic data, if used, shall be labelled and kept
separate from evidence of real-market performance.

### 5.8 Inference and model lifecycle

**FR-INF-001 (P0):** The inference service shall load approved model
artifacts at application startup or through a controlled reload
process.\
**FR-INF-002 (P0):** The inference service shall validate artifact
metadata and required feature compatibility before serving requests.\
**FR-INF-003 (P0):** The inference service shall not retrain a model
during an ordinary user prediction request.\
**FR-INF-004 (P0):** The system shall identify the model version used
for each saved prediction.\
**FR-INF-005 (P0):** The system shall handle missing, corrupt,
incompatible, or unavailable artifacts without returning fabricated
predictions.\
**FR-INF-006 (P1):** The system should provide a health/readiness status
that indicates whether required model artifacts are available without
exposing sensitive paths or secrets.\
**FR-INF-007 (P1):** The system should support a documented process to
roll back to a previously approved model version.

### 5.9 Errors and operational behaviour

**FR-ERR-001 (P0):** API errors shall use consistent structured
responses.\
**FR-ERR-002 (P0):** Client-visible errors shall not expose stack
traces, credentials, secrets, or internal filesystem details.\
**FR-ERR-003 (P0):** The system shall log relevant operational failures
while avoiding unnecessary sensitive personal data.\
**FR-ERR-004 (P0):** Database migrations shall be the authoritative
schema-change mechanism; startup code shall not independently create
competing production schemas.

## 6. External Interface Requirements

### 6.1 Frontend-to-backend interface

-   The frontend shall call the FastAPI API through a typed API client.
-   The default approach is direct frontend-to-FastAPI communication
    with configured CORS and an agreed authentication mechanism.
-   A Next.js backend-for-frontend layer is optional and shall not be
    added without a specific requirement.
-   API base URLs and environment-specific configuration shall be
    provided through environment variables.
-   Secrets must not be exposed through public frontend environment
    variables.

### 6.2 API conventions

-   Use a versioned prefix such as `/api/v1`.
-   Use JSON for ordinary request and response payloads.
-   Use appropriate HTTP methods and status codes.
-   Validate request and response schemas with Pydantic.
-   Provide API documentation through FastAPI's generated OpenAPI
    interface in development.
-   Establish consistent pagination, filtering, error format, and
    request correlation conventions.

### 6.3 Proposed endpoint inventory

Final schemas must be based on approved requirements and implementation
choices.

  -----------------------------------------------------------------------------------------
  Method            Endpoint                      Purpose           Access
  ----------------- ----------------------------- ----------------- -----------------------
  GET               `/api/v1/health`              Basic service     Public or
                                                  health            deployment-restricted

  POST              `/api/v1/auth/register`       Create account    Public

  POST              `/api/v1/auth/login`          Authenticate      Public

  POST              `/api/v1/auth/logout`         End session if    Authenticated
                                                  supported by      
                                                  chosen auth       
                                                  design            

  GET               `/api/v1/users/me`            Read current      Authenticated
                                                  profile           

  PATCH             `/api/v1/users/me`            Update permitted  Authenticated
                                                  profile fields    

  POST              `/api/v1/predictions`         Create sale or    Authenticated
                                                  rent prediction   

  GET               `/api/v1/predictions`         List current      Authenticated
                                                  user's history    

  GET               `/api/v1/predictions/{id}`    Read owned        Authenticated
                                                  prediction detail 

  GET               `/api/v1/analytics/summary`   User summary      Authenticated

  GET               `/api/v1/admin/users`         List users        Admin

  GET               `/api/v1/admin/predictions`   Review prediction Admin
                                                  records           

  GET               `/api/v1/admin/models`        View model        Admin
                                                  registry metadata 

  GET               `/api/v1/admin/analytics`     Administrative    Admin
                                                  summaries         
  -----------------------------------------------------------------------------------------

Endpoints may be split or renamed during design, but behaviour and
access controls must remain traceable to the FR requirements.

### 6.4 Prediction request/response concept

A prediction request should identify the target (`sale_price` or
`monthly_rent`) and provide the validated features for that target. The
exact feature schema must be finalized after dataset audit.

A successful response should include: - Prediction identifier. -
Prediction target. - Numeric estimate. - Currency code. - Model
version. - Prediction timestamp. - Disclaimer and, where supported, a
coverage/quality warning.

The API must not accept a client-supplied filesystem path or arbitrary
model name that bypasses the approved model registry.

## 7. Data Requirements

### 7.1 Training data

-   Original data shall be retained separately from interim and
    processed data.
-   Each dataset shall have a source note containing source URL or
    identifier, access date, license/terms, target definition,
    collection period where known, and transformation notes.
-   Raw data shall not be committed to version control by default.
-   Small, redistributable sample data may be committed only when its
    license permits it.
-   Personally identifiable or restricted data shall not be collected
    unless necessary, lawful, and explicitly approved.
-   Data cleaning decisions must be documented and reproducible.

### 7.2 Application data

At minimum, the logical data model is expected to include: - **User:**
identifier, email or login identifier, password hash, role, account
status, timestamps. - **Prediction:** identifier, user reference, target
type, validated input snapshot, estimate, currency, model version,
timestamp, status or relevant error metadata. - **ModelVersion:**
identifier, target, version, artifact reference, feature-schema version,
training date, supported geography, metrics, approval/active status. -
**AuditLog:** identifier, actor, action, timestamp, and a safe summary
of relevant changes where audit logging is implemented.

SQLAlchemy models and Alembic migrations are the proposed implementation
approach. The final schema must define indexes, constraints, deletion
behaviour, and data retention as part of detailed design.

### 7.3 Data integrity

-   Monetary values must have explicit currency codes and documented
    units.
-   Area must have an explicit unit and a consistent conversion policy.
-   Monthly rent must not be confused with sale price or annual rent.
-   Timestamps should be stored consistently, with timezone-aware
    handling at API boundaries.
-   Model and feature-schema versions must be stored with predictions so
    historical outputs remain interpretable.

## 8. ML Requirements and Evaluation Protocol

### 8.1 Pipeline separation

-   Training code belongs in `ml/src/real_estate_ml/` and reusable
    modules.
-   Scripts under `ml/training/scripts/` shall act as command-line entry
    points.
-   FastAPI shall call an inference integration layer that loads the
    approved artifact; it shall not reimplement training or
    preprocessing independently.
-   The fitted preprocessing and estimator should be serialized together
    when practical to prevent training/inference mismatch.

### 8.2 Data splitting and leakage

-   Split data into training and held-out evaluation partitions before
    fitting data-dependent transformations.
-   Use a random split only where it reasonably matches the intended
    deployment scenario.
-   Use time-based evaluation when reliable timestamps exist and future
    prediction is the goal.
-   Use location-aware evaluation when the system claims generalization
    to unseen localities or cities.
-   Duplicate properties or near-duplicate listings must not leak across
    partitions in a way that inflates results.
-   Hyperparameter selection must not use the final held-out test set.

### 8.3 Candidate models

Start with a simple baseline, such as a median-target baseline, then
compare appropriate regression algorithms such as Linear Regression,
Random Forest Regressor, and HistGradientBoostingRegressor. The final
selection depends on data size, feature types, evaluation results, and
maintenance needs.

Classification algorithms intended to predict categories, such as
Logistic Regression in its usual classification use, shall not be
selected as the main estimator for a continuous price target.

### 8.4 Metrics and reporting

-   MAE and RMSE shall be reported in target currency units.
-   R² should be reported when meaningful and explained appropriately.
-   Metrics should be calculated on held-out data.
-   Reports should state dataset size, split strategy, target type,
    source limitations, geography, and known caveats.
-   No accuracy percentage shall be invented or inferred directly from
    R².
-   Model acceptance thresholds remain **TBD** until the data audit and
    baseline evaluation inform a defensible threshold.

### 8.5 Artifact metadata

Each model artifact release shall record at least: - Model identifier
and version. - Target type. - Feature schema and preprocessing
version. - Training dataset references and data preparation version. -
Training timestamp and code/dependency versions where practical. -
Evaluation metrics and split methodology. - Supported geography and
known limitations. - Artifact checksum or integrity information where
practical. - Approval/active status.

Artifacts are trusted executable-adjacent files: only artifacts from the
controlled training workflow should be loaded. Do not load untrusted
joblib/pickle files.

## 9. Non-Functional Requirements

These requirements should be measured during testing; values marked TBD
need to be agreed before production deployment.

### 9.1 Security

**NFR-SEC-001:** Passwords shall be hashed with a suitable
password-hashing algorithm; plaintext storage is prohibited.\
**NFR-SEC-002:** Authorization shall be enforced server-side on every
protected operation.\
**NFR-SEC-003:** Secrets shall be loaded from environment or deployment
secret configuration and excluded from source control.\
**NFR-SEC-004:** Production deployment shall use HTTPS.\
**NFR-SEC-005:** Inputs shall be validated and database access shall use
safe parameterized ORM/query practices.\
**NFR-SEC-006:** Error responses and logs shall avoid leaking passwords,
tokens, secrets, and unnecessary personal data.\
**NFR-SEC-007:** Authentication rate limiting and other abuse controls
should be added before public production exposure.\
**NFR-SEC-008:** Dependency updates and known vulnerabilities should be
reviewed before deployment.

### 9.2 Performance

**NFR-PERF-001:** Inference shall use preloaded or controlled-loaded
artifacts and shall not train models in request handlers.\
**NFR-PERF-002:** The application should remain usable on ordinary
development hardware with the selected dataset sizes.\
**NFR-PERF-003:** Response-time objectives shall be measured after the
first working end-to-end build; production targets are TBD based on
deployment constraints.\
**NFR-PERF-004:** Large dataset processing shall be performed offline
rather than in ordinary web requests.

### 9.3 Reliability

**NFR-REL-001:** Missing or invalid models shall result in a clear
service error, not a fabricated prediction.\
**NFR-REL-002:** Database failures shall be handled without falsely
confirming persistence.\
**NFR-REL-003:** Training runs shall record outcomes and produce
repeatable outputs from the same code, configuration, and data to the
extent supported by the libraries.\
**NFR-REL-004:** Database schema changes shall be managed through
migrations.

### 9.4 Maintainability

**NFR-MAINT-001:** Frontend, backend, training, and inference
responsibilities shall remain separated.\
**NFR-MAINT-002:** Shared model logic shall not be duplicated in the API
layer.\
**NFR-MAINT-003:** Configuration shall be environment-driven and
documented.\
**NFR-MAINT-004:** Code shall include type hints and clear module
boundaries where practical.\
**NFR-MAINT-005:** Tests and CI checks shall cover critical paths.

### 9.5 Usability and accessibility

**NFR-UX-001:** Forms shall provide clear labels, validation feedback,
and understandable error states.\
**NFR-UX-002:** Layouts shall support desktop and mobile widths.\
**NFR-UX-003:** Visual hierarchy shall follow the approved Editorial
Luxury direction without compromising legibility.\
**NFR-UX-004:** Core workflows shall not depend on animation or
hover-only interactions.\
**NFR-UX-005:** Currency, area units, and target type shall be clearly
shown.

### 9.6 Privacy and retention

**NFR-PRIV-001:** Users shall not be able to retrieve other users'
private prediction history through API manipulation.\
**NFR-PRIV-002:** The application shall collect only information needed
for the documented functionality.\
**NFR-PRIV-003:** Data retention and account deletion behaviour shall be
defined before public deployment.\
**NFR-PRIV-004:** Dataset source terms and applicable privacy
obligations shall be reviewed before use.

### 9.7 Portability and cost

**NFR-PORT-001:** Local development and ML training shall be possible
without a paid AI API or GPU.\
**NFR-PORT-002:** Setup steps and environment variables shall be
documented.\
**NFR-PORT-003:** Deployment shall not depend on a free-tier service
without documenting its limits and a fallback plan.

## 10. Error Handling

The API should use consistent error objects, for example: - A stable
error code. - A human-readable message safe to display. - Optional
field-level validation details. - A request/correlation identifier when
available.

Expected cases include: - Missing or malformed inputs. - Unsupported
target or location. - Invalid categorical values. - Authentication
failure. - Authorization failure. - Prediction not found or not owned by
the current user. - Database unavailable. - Model artifact missing,
corrupt, or incompatible. - Internal failure.

Do not return stack traces or secret configuration in production
responses.

## 11. Testing and Acceptance

### 11.1 Unit tests

-   Input and schema validation.
-   Data cleaning and feature transformation.
-   Currency/area normalization.
-   Model loading and inference output shape.
-   Authorization helper behaviour.
-   API error serialization.

### 11.2 Integration tests

-   API to database persistence.
-   User ownership enforcement for prediction history.
-   Prediction endpoint to inference pipeline using a test artifact.
-   Model metadata registration and compatibility checks.
-   Migration application against a test database.

### 11.3 End-to-end tests

-   Register/sign in.
-   Submit a supported prediction.
-   View the result and find it in history.
-   Verify that a user cannot access another user's prediction.
-   Verify that non-admin users cannot access admin endpoints.

### 11.4 ML evaluation tests

-   Training pipeline completes on a small, permitted test fixture.
-   Preprocessing is fit on training data only.
-   Metrics are generated for held-out data.
-   Artifact can be loaded by inference code.
-   Invalid or incompatible artifacts fail safely.
-   Test fixtures are not represented as real-market accuracy evidence.

### 11.5 MVP acceptance criteria

The MVP is accepted when: 1. Required P0 flows work end to end. 2. API
authorization and input validation are tested. 3. Both targets use the
correct independent model pipeline. 4. Only approved supported locations
can receive ordinary estimates. 5. Predictions record the correct model
version and currency. 6. Dataset sources and licensing notes are
documented. 7. Training evaluation is reproducible and includes held-out
metrics. 8. Setup, testing, and run instructions are documented. 9. No
credentials, secrets, or restricted datasets are committed. 10. Known
limitations and unimplemented scope are clearly documented.

## 12. Deployment and Environment Requirements

-   Development, test, and production configuration must be separated.
-   `.env.example` shall list required variable names with safe
    placeholders and no real secrets.
-   Database schema changes shall be applied through Alembic migrations.
-   Local training artifacts shall be accessible to the backend runtime
    through a configured artifact directory or controlled storage
    location.
-   The deployment instructions shall state how artifacts are built,
    transferred, validated, activated, and rolled back.
-   Free-tier hosting constraints, sleep behaviour, storage limits,
    database limits, and model persistence must be checked before
    selecting a production provider.
-   CI should run frontend checks, backend tests, and ML tests
    independently where practical.

## 13. Proposed Repository Mapping

The existing proposed repository structure should preserve these
boundaries:

``` text
frontend/                         # User interface and typed API client
backend/app/api/v1/               # FastAPI routes and schemas
backend/app/services/             # Application use cases
backend/app/repositories/         # Data access where abstraction is useful
backend/app/db/                   # Database session and base metadata
backend/app/integrations/         # Adapter from API lifecycle to ML inference
ml/training/data/raw/             # Original datasets (normally gitignored)
ml/training/data/interim/         # Intermediate outputs (normally gitignored)
ml/training/data/processed/       # Processed training data (normally gitignored)
ml/training/scripts/              # Thin CLI entry points
ml/src/real_estate_ml/            # Reusable training and inference package
ml/artifacts/                     # Local model artifacts (normally gitignored)
ml/training/reports/              # Evaluation outputs, with suitable generated files ignored
docs/                             # PRD, SRS and supporting documentation
```

The exact directory names may be reconciled with the approved repository
structure. Avoid duplicating training logic between scripts, the ML
package, and FastAPI.

## 14. Traceability Matrix

  -----------------------------------------------------------------------
  PRD area                            SRS requirements
  ----------------------------------- -----------------------------------
  Sale and rent prediction            FR-PRED-001 through FR-PRED-011;
                                      FR-ML-004; FR-INF-001 through
                                      FR-INF-005

  Supported locations and transparent FR-PRED-003, FR-PRED-009;
  limitations                         FR-ML-002, FR-ML-010, FR-ML-011

  User accounts and profile           FR-AUTH-001 through FR-AUTH-007

  Prediction history                  FR-HIST-001 through FR-HIST-004

  Dashboard and analytics             FR-AN-001 through FR-AN-004

  Administration                      FR-ADM-001 through FR-ADM-007

  Credible ML and reproducibility     FR-ML-001 through FR-ML-016

  Security and privacy                NFR-SEC-001 through NFR-SEC-008;
                                      NFR-PRIV-001 through NFR-PRIV-004

  Free-tier/local development         NFR-PERF-002, NFR-PORT-001 through
                                      NFR-PORT-003

  Quality and maintainability         NFR-REL-001 through NFR-REL-004;
                                      NFR-MAINT-001 through NFR-MAINT-005
  -----------------------------------------------------------------------

## 15. Open Decisions and Change Control

The following must be decided or validated before final
implementation: 1. Initial geography and exact supported localities. 2.
Dataset sources, terms, licenses, dates, and target semantics. 3.
Property types and final feature schemas for each prediction target. 4.
Model acceptance criteria based on baseline and held-out evaluation. 5.
Authentication/session strategy. 6. Final database schema and
retention/deletion policies. 7. Final frontend stack confirmation. 8.
Deployment provider and artifact storage approach. 9. Whether P1
analytics/report features fit the project timeline. 10. API rate limits
and measurable performance objectives for public deployment.

When a decision changes, update this SRS and its corresponding PRD item.
The implementation must not infer unsupported requirements from
assumptions or generated sample data.
