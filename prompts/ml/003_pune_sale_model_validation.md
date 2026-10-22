# Prompt 003: Rigorous Validation and Selection of the Sale Price Model

- **Category**: `ml`
- **Timestamp**: `2026-10-22T17:42:19+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: Completed

---

## Verbatim Prompt Text

Continue Estora in the existing repository and branch. Read AGENTS.md, the SRS, EDA report, baseline results, experiment script, metrics implementation, splitting code, tests, and current Git diff.

Phase 2 is reported complete. Do not repeat the EDA or blindly accept its model ranking. Implement Phase 3: rigorous validation and selection of the sale-price model.

1. Audit the existing experiment. Verify how the log target transformation is applied and inverse-transformed before computing MAE, RMSE, and R² in INR lakhs. Confirm all models use comparable leakage-safe splits and metrics. Verify grouping prevents related listings crossing partitions. Check target leakage, preprocessing leakage, and inconsistent feature handling. Reproduce the reported split and metrics with the existing seed if possible.

2. Run stronger validation. Use group-aware cross-validation on labeled prepared data only. Keep preprocessing and target transformation inside the fold-specific pipeline. Report fold-level and aggregate MAE, RMSE, and R² in INR lakhs. Compare Ridge, Random Forest, HistGradientBoosting, and DummyRegressor. Include variability across folds and investigate performance differences by property types, price ranges, and sufficiently represented localities. Do not make claims for small samples. Keep the original held-out evaluation set isolated from model selection; do not repeatedly tune against it. Distinguish cross-validation from final holdout results.

3. Recommend a model based on validation performance, stability, complexity, and interpretability. Do not assume Ridge must win. Document the small Pune subset, circa-2020 asking-price data, listing bias, and unresolved licensing. Do not claim current-market accuracy or commercial readiness.

4. Create docs/data/pune_sale_model_validation.md, update tests for evaluation integrity and reproducibility, and save reproducible outputs in the existing ML reports directory. Do not create or promote a production artifact yet.

5. Save this exact prompt under prompts/ml/ using the existing workflow. Do not modify frontend, backend API, database schema, raw data, or prepared dataset. Do not download data, commit, or push. Run tests and validation if feasible.

At completion, report changed files, exact validation strategy, fold-level and aggregate metrics, recommended model and rationale, tests run, and unresolved issues. Distinguish executed results from assumptions or planned work.
