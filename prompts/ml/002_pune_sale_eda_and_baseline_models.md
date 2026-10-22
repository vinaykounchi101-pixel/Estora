# Prompt 002: Exploratory Data Analysis and Initial Sale Price Regression Baseline

- **Category**: `ml`
- **Timestamp**: `2026-10-22T16:16:12+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: Completed

---

## Verbatim Prompt Text

Continue Estora from the existing repository and current branch. Read AGENTS.md, the SRS, dataset validation report, data preparation documentation, preparation summary JSON, and current Git status.

Phase 1 data preparation is reported complete. The processed development dataset is ml/training/data/processed/pune_sale_prices.csv.

Implement Phase 2 only: exploratory data analysis and a defensible initial sale-price regression baseline.

1. Verify inputs: confirm the processed dataset and preparation summary exist; validate schema, row counts, target units, missingness, duplicates, and numeric ranges. If actual files disagree with the preparation report, stop and report the discrepancy. Do not load or use the unlabeled competition test dataset. Do not modify raw or processed source data.

2. EDA: analyze sale-price distribution and skew; area, BHK, bathrooms, property status, and other available feature distributions; price relationships with area, BHK, and locality; missingness, outliers, rare categories, inconsistencies; locality sample counts; potential leakage; and features available at prediction time. Create docs/data/pune_sale_eda_report.md. Store plots under an appropriate ignored reports/artifacts directory.

3. Leakage-resistant evaluation: use only the 1,833 labeled prepared records. Create a reproducible held-out split before fitting preprocessing or model selection. Keep preprocessing inside sklearn Pipelines or equivalent. Group identical or near-identical listings where justified, particularly by address and area, ensuring groups do not cross partitions. Report split strategy, seed, sample counts, and limitations. Do not fit preprocessing, select features, or tune using held-out validation targets. Do not claim the split proves future-market performance.

4. Baselines: compare DummyRegressor, suitable regularized linear regression, and one tree-based regressor. Use appropriate numeric/categorical preprocessing. Exclude identifiers, target-derived variables, and features unavailable at prediction time. Keep target units INR lakhs. Report MAE in INR lakhs, RMSE in INR lakhs, R², evaluation count, and training-versus-held-out performance where useful. Do not fabricate metrics or select a winner before running experiments. Keep comparison small; no extensive tuning.

5. Deliverables: docs/data/pune_sale_eda_report.md, docs/data/pune_sale_baseline_results.md, a reproducible experiment script in the existing ML training structure, and focused tests for split isolation, preprocessing leakage prevention, and reproducibility. Save experimental artifacts only in an ignored location. Do not create a production artifact or integrate the API yet.

Document that the source represents approximately 2020 asking-price listings and licensing is unresolved. Do not claim current-market accuracy or commercial-use permission.

6. Save this exact prompt under prompts/ml/ using the existing workflow. Do not modify frontend, backend API, database schema, raw data, or prepared dataset. Do not download additional data, commit, or push. Run experiments and tests if feasible. Report changed files, actual metrics, split counts, test results, failures, and limitations, distinguishing executed results from proposed work.
