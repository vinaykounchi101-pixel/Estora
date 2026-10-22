# Prompt 004: Final Model Training and Artifact Verification for Pune Sale-Price Model

- **Category**: `ml`
- **Timestamp**: `2026-10-22T18:00:50+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: Completed

---

## Verbatim Prompt Text

Read AGENTS.md and the existing ML architecture, dataset preparation, EDA, baseline and model validation reports before making changes.

Implement Phase 4: Final Model Training and Artifact Verification for the Pune residential sale-price model.

Selected candidate: HistGradientBoostingRegressor with log1p target transformation, based on Phase 3 reported results.

Requirements:
1. Verify the current working tree, selected pipeline, feature schema, validation report, and test suite. Do not assume previous reports are correct without checking the implementation.
2. Train the selected pipeline on all 1,833 approved prepared training records only after confirming the feature and target schema. Do not use the unlabeled test dataset.
3. Preserve preprocessing and TransformedTargetRegressor(log1p/expm1) in the serialized pipeline.
4. Save a versioned artifact and a metadata/manifest file in the designated ML artifacts directory. Record model name, version, feature names and types, target units (INR lakhs), training row count, data source and historical-data limitations, training timestamp, and relevant library versions. Do not include raw data or secrets.
5. Ensure artifact paths are configurable and artifact files are excluded from Git unless project rules explicitly say otherwise.
6. Reload the saved artifact in a fresh process or equivalent isolated test and verify predictions are finite, non-negative, and correctly shaped for valid inputs. Test unknown categories and invalid/missing inputs; reject invalid inputs clearly rather than silently inventing values.
7. Add automated tests for serialization/reload consistency and prediction validation. Run the relevant ML test suite and report actual results.
8. Document the reproducible training command, artifact location, schema, and limitations. Clearly label metrics as historical circa-2020 listing-price performance, not verified 2026 valuations. License remains unresolved.
9. Do not connect FastAPI, change frontend/database, tune against the frozen holdout, download datasets, modify raw/processed data, commit, or push.
10. Save this prompt verbatim under prompts/ml/ using the established project convention.

At the end, report files changed, training rows used, artifact and metadata paths, reload verification, test results, and any blockers. Distinguish completed work from planned work. Do not claim success unless verified.
