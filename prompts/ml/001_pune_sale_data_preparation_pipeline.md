# Prompt 001: Pune Sale Data Preparation Pipeline

- **Category**: `ml`
- **Timestamp**: `2026-10-22T15:57:23+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: In Progress

---

## Verbatim Prompt Text

Continue the Estora project from its existing repository and current branch. Read AGENTS.md, the PRD, SRS, dataset audit report, Pune dataset validation report, ML architecture documentation, and current Git status before making changes.

The dataset audit is complete. Do not repeat the audit. Implement Phase 1 only: a reproducible, non-destructive data preparation pipeline for the conditionally approved Pune residential sale-price dataset.

## 1. Locate and inspect the data
Use the archive ml/training/data/raw/real_estate_dataset_cleaned (1).zip. Inspect the archive and use the cleaned training data documented in the validation report. Do not use the unlabeled test data for training, evaluation, or fitting preprocessing. If the archive or expected files are missing, stop and report the issue rather than fabricating data or downloading replacements.

## 2. Implement the preparation pipeline
Follow repository conventions. Prefer reusable functions, type hints, clear logging, and configuration over hardcoded logic.
- Read the original archive without modifying it.
- Select Pune records using documented address and geographic validation rules.
- Exclude severe geocoding errors and records outside the accepted Maharashtra/Pune geographic scope.
- Treat ambiguous locality/address-coordinate conflicts explicitly; count and report exclusions rather than silently misclassifying them.
- Validate required columns and data types.
- Apply area filters: SQUARE_FT >= 150 and <= 8,000.
- Exclude sale-price targets above 1,500 lakhs.
- Reject missing, non-finite, or otherwise invalid target values.
- Check duplicates and document handling.
- Preserve target units: INR lakhs.
- Avoid target-derived model inputs.
- Avoid arbitrary additional filters unless justified and documented.
- Record row counts after every filtering stage, including reasons for exclusions.

Do not assume every address containing Pune is geographically valid, or that every valid Pune coordinate has a correctly labeled address.

## 3. Output and governance
Keep raw data unchanged. Write the resulting development dataset only under the existing ignored processed-data directory, e.g. ml/training/data/processed/pune_sale_prices.csv, adapting to repository conventions.

Create/update documentation explaining source and unresolved licensing restrictions, inclusion/exclusion rules, target definition and units, processing and reproducibility, limitations including the approximately 2020 listing period, and why this is an MVP development baseline rather than verified current market ground truth.

Save a machine-readable preparation summary if appropriate under ml/training/reports/. Ensure raw, interim, and processed data remain ignored by Git.

## 4. Tests and verification
Add focused tests using small synthetic test fixtures created specifically for testing. Never describe test fixtures as real property data. Test Pune inclusion and out-of-scope exclusion, invalid/conflicting coordinates, area and price boundaries, missing targets, duplicate handling, deterministic results and row-count accounting, and missing required columns.

Run tests and pipeline if feasible. Verify raw files remain unchanged and generated data is not accidentally tracked.

## 5. Prompt archiving
Save this exact task prompt using the established prompt-archiving workflow under prompts/ml/ with a unique, meaningful filename. Preserve wording and do not archive the conversation or Antigravity response.

## Constraints
Do not train or compare models yet. Do not build or modify the inference API or frontend. Do not download data, commit, or push. Do not claim commercial licensing is resolved. Do not overwrite existing files without inspecting them first.

At completion, report files created/modified, exact row counts at each processing stage, tests run and actual results, unresolved geographic/data-quality issues, confirmation raw data is unchanged and generated data remains ignored, and any incomplete steps.
