# Product Requirements Document (PRD)

## Real Estate Price Prediction Platform

**Document version:** 1.0 --- Draft\
**Status:** Requirements baseline for review\
**Last updated:** 21 October 2026\
**Project type:** Academic project with a professional,
portfolio-quality implementation\
**Primary language:** English

------------------------------------------------------------------------

## 1. Purpose of This Document

This PRD defines the product vision, user needs, goals, scope, feature
priorities, and success criteria for the Real Estate Price Prediction
Platform. It describes **what product should be built and why** without
locking every implementation detail.

The document is intended for the project owner, supervisor, designers,
developers, testers, and AI coding tools used during development.

Some decisions depend on the quality, coverage, terms, and licensing of
candidate datasets. These items are explicitly marked as pending
validation rather than assumed to be solved.

## 2. Product Summary

The platform will allow users to estimate a residential property's sale
price or monthly rent from available property information. It will use
machine-learning models trained on documented property datasets and
expose predictions through a web application.

The product will also provide prediction history, a user dashboard,
profile settings, and administrative tools. Its interface should feel
like a premium real-estate product combined with an analytics platform.

The first release will focus on a limited, data-supported geography. The
architecture should make it possible to add more Indian cities and,
later, international markets without claiming coverage before the data
and models have been validated.

## 3. Problem Statement

Property prices vary with location, property characteristics, market
conditions, and time. Users may find it difficult to compare properties
or form an initial estimate using scattered listings and manual
calculations.

The platform aims to provide a convenient, transparent, data-driven
estimate. It is a decision-support tool, not a formal valuation,
appraisal, investment recommendation, or guarantee of a sale or rental
price.

## 4. Product Vision

Build a credible and usable real-estate estimation platform that
combines: - A polished property-focused user experience. - Sale-price
and monthly-rent prediction. - Clearly communicated model limitations. -
Useful prediction history and analytics. - A maintainable ML workflow
that can be improved as data becomes available.

## 5. Goals

### 5.1 MVP goals

1.  Provide separate workflows for sale-price and monthly-rent
    estimates.
2.  Support only the locations and property types justified by validated
    data.
3.  Train, compare, evaluate, version, and load ML models through a
    repeatable workflow.
4.  Return predictions with currency, model version, and an appropriate
    explanatory disclaimer.
5.  Allow registered users to view and manage their prediction history.
6.  Provide an administrator area for basic user, prediction, and
    model-metadata management.
7.  Make the application testable, documented, and runnable with free or
    local development tools wherever practical.

### 5.2 Longer-term goals

-   Expand to additional Indian cities and localities.
-   Evaluate city-specific versus multi-city models.
-   Add international markets with country-specific data and
    configuration.
-   Improve model monitoring, retraining, and drift analysis.
-   Add richer property comparisons and analytical reporting if time and
    data permit.

## 6. Non-Goals

The MVP will not: - Guarantee a property's actual sale price or
achievable rent. - Replace a certified property valuation or
professional advice. - Claim accurate predictions for locations without
adequate evaluation. - Automatically scrape any website without checking
its terms, access rules, and reuse permissions. - Require paid AI
inference APIs or paid GPU training. - Train the model on every user
request. - Treat short-term accommodation prices as equivalent to
long-term residential rent. - Require an international launch in the
first release. - Promise a specific model accuracy before testing on
held-out data.

## 7. Target Users and Needs

### 7.1 General user

**Need:** Obtain an initial estimate for a property using understandable
inputs.\
**Value:** A quick estimate with transparent limits and the ability to
revisit previous results.

### 7.2 Returning user

**Need:** Review previous estimates and compare their inputs and
outputs.\
**Value:** Persistent prediction history and a personal dashboard.

### 7.3 Administrator

**Need:** Manage user access and review system activity and model
metadata.\
**Value:** Operational visibility without editing model files or
bypassing controlled training.

### 7.4 Project supervisor / evaluator

**Need:** Understand the problem, data sources, methodology, testing,
and limitations.\
**Value:** Documented requirements, reproducible experiments, measurable
evaluation, and a demonstrable end-to-end workflow.

## 8. Core User Stories

### Prediction

-   As a user, I want to choose sale-price or monthly-rent estimation so
    that I use the correct prediction workflow.
-   As a user, I want to enter a property's location and characteristics
    so that the system can estimate a price.
-   As a user, I want to know when my selected location or property type
    is unsupported so that I am not shown a misleading estimate.
-   As a user, I want to see the estimated amount, currency, and a clear
    caveat so that I understand what the result means.

### Account and history

-   As a user, I want to register and sign in so that my saved
    predictions are associated with my account.
-   As a user, I want to view my previous predictions so that I can
    review earlier estimates.
-   As a user, I want to manage my profile and account settings.

### Administration

-   As an administrator, I want to view users and predictions so that I
    can oversee use of the platform.
-   As an administrator, I want to view model versions and evaluation
    summaries so that I can understand which model is active.
-   As an administrator, I want administrative actions to be
    permission-controlled and auditable.

## 9. Product Scope and Priorities

Priorities use: - **P0:** Required for a usable MVP. - **P1:** Important
if time and validated data allow. - **P2:** Future scope.

### 9.1 P0 --- MVP

-   Responsive public landing page explaining the platform and its
    limitations.
-   Registration, login, logout, and protected user routes.
-   Sale-price prediction form.
-   Monthly-rent prediction form.
-   Location and property-type choices restricted to validated support.
-   Input validation and actionable error messages.
-   Prediction result view with amount, currency, prediction type, model
    version, and disclaimer.
-   Prediction history for the signed-in user.
-   User profile and basic settings.
-   Admin role and protected admin area.
-   Admin views for users, predictions, and registered model metadata.
-   Offline dataset audit, preprocessing, training, evaluation, and
    artifact export.
-   Versioned model artifacts and metadata.
-   API and ML tests, setup instructions, and dataset provenance
    documentation.

### 9.2 P1 --- After the core workflow

-   Dashboard summaries and charts based on stored predictions.
-   Filters and pagination for prediction history and admin views.
-   Exportable reports where appropriate.
-   Better model comparison reports, location-level evaluation, and
    time-based evaluation where dates allow.
-   Model-quality warnings for sparse or weakly supported locations.
-   Audit log for relevant administrative events.

### 9.3 P2 --- Future scope

-   Additional cities and localities in India.
-   International markets and country-specific currencies and
    measurement units.
-   Automated data refresh where source terms and technical feasibility
    permit.
-   Scheduled retraining and model drift monitoring.
-   Property comparisons, richer analytics, and optional map-based
    exploration.
-   Additional property categories if adequate data exists.

## 10. Product Experience and Design Direction

The interface should use an **Editorial Luxury** direction: elegant
typography, architectural imagery, generous visual hierarchy, refined
spacing, and restrained warm accents. It should combine real-estate
marketplace cues with practical analytics rather than look like a
generic admin template.

Proposed palette (to be refined during design): - Warm ivory:
`#F8F6F1` - Sand: `#E9DFCF` - Muted gold: `#B69A63` - Charcoal:
`#252722` - Sage: `#87917B`

The main experience should be light and warm, with selective charcoal
panels for contrast. Accessibility, readability, responsive behaviour,
and clear form feedback take priority over decorative effects. Motion
should be restrained and should not block core interactions.

## 11. Data and ML Product Requirements

1.  Sale price and monthly rent must be treated as distinct prediction
    targets.
2.  Each dataset must be audited before training for source, license,
    collection date, geography, property type, target definition,
    duplicates, missing values, units, and potential leakage.
3.  Listing prices and completed transaction prices must be
    distinguished and labelled accurately.
4.  Synthetic datasets may be used for pipeline tests or clearly
    labelled demonstrations, but must not be presented as proof of
    real-market predictive performance.
5.  Training and evaluation must use held-out data. Evaluation design
    should account for time and geography when the dataset permits.
6.  Candidate models should be compared with a simple baseline. Model
    selection must be based on measured results, not assumptions.
7.  Evaluation should report MAE, RMSE, and R² where meaningful, plus
    location-level performance where sample sizes allow.
8.  The system must not advertise a fabricated accuracy percentage.
9.  Preprocessing and the estimator must be saved as one reproducible
    pipeline or as explicitly versioned, compatible components.
10. Model metadata must identify the target, supported geography,
    feature schema, dataset reference, training date, software/version
    information, and evaluation metrics.
11. Unsupported or poorly represented locations must trigger an
    appropriate warning or refusal rather than a confident-looking
    estimate.
12. The first training workflow should run locally on a typical
    development computer with manageable datasets; no GPU is assumed.

## 12. Success Criteria

The MVP is successful when: - A user can complete registration/login and
access protected pages. - A user can submit valid sale and rent requests
for supported coverage and receive results from the corresponding
model. - Invalid inputs and unsupported locations are handled clearly. -
Each prediction can be saved and later retrieved by its owner. - An
administrator can access protected administrative views. - Training can
be rerun from documented data and code, producing evaluation reports and
versioned artifacts. - Tests cover core validation, API behaviour,
authorization, preprocessing, and inference. - The model's measured
performance and limitations are documented. - A new developer can follow
the README and run the application locally without undocumented steps.

No fixed accuracy threshold is set until the dataset audit and baseline
evaluation are complete. A target may be established after understanding
the data and intended use.

## 13. Constraints and Assumptions

-   The project should prioritize free-tier and local development
    resources.
-   The initial geographical scope is undecided and will be selected
    after a dataset availability and quality audit.
-   The platform will use Next.js, React, and TypeScript for the
    frontend as the current proposed choice; confirm before
    implementation.
-   FastAPI is the backend and PostgreSQL is the intended application
    database.
-   Python and scikit-learn will be used for conventional ML.
-   The user is building through Antigravity, so development should be
    divided into small, reviewable tasks rather than one large
    generation request.
-   Dataset access, licensing, quality, and redistribution rights are
    not assumed.
-   Deployment provider and production hosting plan remain undecided.

## 14. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Sparse or outdated local data       Audit coverage, report limitations,
                                      narrow supported locations

  Inconsistent prices or area units   Normalize and validate data before
                                      combining sources

  Listing price mistaken for          Preserve target provenance and
  transaction price                   label the estimate correctly

  Data leakage or overoptimistic      Use held-out testing and
  metrics                             appropriate temporal/geographic
                                      splits

  Location bias                       Report performance by location
                                      where data permits

  Free-tier resource limits           Train locally, use classical
                                      models, keep datasets manageable

  Unlawful or disallowed collection   Review source terms, licenses, and
                                      access restrictions

  Overengineering the MVP             Prioritize P0 features and defer
                                      P1/P2 items

  Model artifact mismatch             Version artifacts and feature
                                      schemas; test inference
                                      compatibility
  -----------------------------------------------------------------------

## 15. Open Decisions

These items must be resolved before the corresponding implementation is
finalized: 1. Initial geography and supported localities. 2. Selected
sale-price and rental datasets, source licenses, and provenance. 3.
Property categories supported by the first release. 4. Final feature
list based on the selected datasets. 5. Whether the sale target is
asking price, transaction price, or separate model variants. 6. Currency
and measurement-unit handling for the first release. 7. Minimum quality
criteria for enabling a model in the application. 8. Frontend stack
confirmation and deployment target. 9. Authentication approach and
session/token handling. 10. Whether dashboard analytics and reports are
P0 or P1 given project time.

## 16. Approval and Change Control

The PRD should be reviewed before implementation begins. Changes to
scope, supported geography, targets, or success criteria should be
reflected here and in the related SRS requirements. Dataset-dependent
decisions may remain marked as pending until evidence is available.
