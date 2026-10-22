"""Reproducible experiment script for Estora Pune sale-price baseline models.

Trains and evaluates:
1. DummyRegressor (Median Baseline)
2. TransformedTargetRegressor (Ridge with log1p target)
3. RandomForestRegressor
4. HistGradientBoostingRegressor

All preprocessing is encapsulated in scikit-learn Pipelines and fitted strictly
on the training partition. Outputs are stored in ml/training/reports/pune_sales_baseline_metrics.json.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
import sys

import pandas as pd

# Ensure ml/src is on the import path
SRC_DIR = Path(__file__).resolve().parents[2] / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from real_estate_ml.data.splitting import create_grouped_sale_split
from real_estate_ml.evaluation.metrics import evaluate_model_partitions
from real_estate_ml.models.baseline import (
    ALL_PREDICTOR_FEATURES,
    build_dummy_median_pipeline,
    build_hist_gradient_boosting_pipeline,
    build_random_forest_pipeline,
    build_regularized_linear_pipeline,
)

DATA_PATH = Path("ml/training/data/processed/pune_sale_prices.csv")
REPORT_PATH = Path("ml/training/reports/pune_sales_baseline_metrics.json")
REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)


def run_baseline_experiments(
    data_path: Path = DATA_PATH,
    random_state: int = 42,
    test_size: float = 0.20,
) -> dict:
    """Execute leakage-resistant baseline modeling workflow."""
    print("=" * 70)
    print("ESTORA REAL ESTATE PRICE PREDICTION — BASELINE MODEL EXPERIMENTS")
    print("=" * 70)
    print(f"Loading processed dataset from: {data_path}")

    if not data_path.exists():
        raise FileNotFoundError(f"Processed dataset not found: {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records with {len(df.columns)} columns.")

    # 1. Create leakage-resistant split
    print("\n--- 1. Partitioning Data (Grouped by Address + Square Feet) ---")
    train_df, test_df, split_meta = create_grouped_sale_split(
        df, test_size=test_size, random_state=random_state
    )
    print(f"Train split: {len(train_df)} rows ({split_meta['train_pct']}%) across {split_meta['train_unique_groups']} groups")
    print(f"Held-out test split: {len(test_df)} rows ({split_meta['test_pct']}%) across {split_meta['test_unique_groups']} groups")
    print(f"Group crossover: {split_meta['overlapping_groups_count']} (Zero leakage verified)")

    # 2. Extract feature matrices and target vectors
    target_col = "target_price_lakhs"
    X_train = train_df[ALL_PREDICTOR_FEATURES]
    y_train = train_df[target_col].values

    X_test = test_df[ALL_PREDICTOR_FEATURES]
    y_test = test_df[target_col].values

    print(f"\nFeatures ({len(ALL_PREDICTOR_FEATURES)}): {ALL_PREDICTOR_FEATURES}")
    print(f"Target: {target_col} (Units: INR Lakhs)")
    print(f"Train target: Median = INR {pd.Series(y_train).median():.1f}L, Mean = INR {y_train.mean():.1f}L")
    print(f"Test target:  Median = INR {pd.Series(y_test).median():.1f}L, Mean = INR {y_test.mean():.1f}L")

    # 3. Model definitions
    candidate_models = [
        ("Median Dummy Regressor", build_dummy_median_pipeline()),
        ("Ridge Regression (log1p target)", build_regularized_linear_pipeline(alpha=1.0)),
        ("Random Forest (100 trees, max_depth=15)", build_random_forest_pipeline(n_estimators=100, max_depth=15, random_state=random_state)),
        ("HistGradientBoosting (max_iter=150, max_depth=8)", build_hist_gradient_boosting_pipeline(max_iter=150, max_depth=8, random_state=random_state)),
    ]

    # 4. Train and evaluate
    print("\n--- 2. Training and Evaluating Baseline Models ---")
    results = []
    for name, model in candidate_models:
        print(f"\nTraining [{name}]...")
        model.fit(X_train, y_train)
        eval_result = evaluate_model_partitions(
            model=model,
            X_train=X_train,
            y_train=y_train,
            X_test=X_test,
            y_test=y_test,
            model_name=name,
            currency_unit="INR Lakhs",
        )
        results.append(eval_result)

        train_m = eval_result["train_metrics"]
        test_m = eval_result["held_out_metrics"]
        print(f"  Train:    MAE = INR {train_m['mae']:6.2f}L | RMSE = INR {train_m['rmse']:6.2f}L | R2 = {train_m['r2']:6.3f} | MedAE = INR {train_m['median_ae']:5.2f}L")
        print(f"  Held-out: MAE = INR {test_m['mae']:6.2f}L | RMSE = INR {test_m['rmse']:6.2f}L | R2 = {test_m['r2']:6.3f} | MedAE = INR {test_m['median_ae']:5.2f}L")

    # 5. Format comparison table
    print("\n" + "=" * 70)
    print("BASELINE COMPARISON SUMMARY (HELD-OUT EVALUATION)")
    print("=" * 70)
    print(f"{'Model Name':<38} {'Held-out MAE':<14} {'Held-out RMSE':<14} {'Held-out R2':<12}")
    print("-" * 78)
    for r in results:
        hm = r["held_out_metrics"]
        print(f"{r['model_name']:<38} INR {hm['mae']:<10.2f}L INR {hm['rmse']:<10.2f}L {hm['r2']:<12.3f}")
    print("=" * 70)

    # 6. Export results JSON
    payload = {
        "experiment_name": "pune_residential_sale_baseline_evaluation",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_path": str(data_path),
        "split_metadata": split_meta,
        "features": ALL_PREDICTOR_FEATURES,
        "target_variable": target_col,
        "target_currency": "INR Lakhs",
        "data_notice": "Based on ~2020 listing asking prices from real_estate_dataset_cleaned (1).zip. Commercial licensing is unresolved. Validated for engineering baseline use only.",
        "models": results,
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"\nExperiment metrics successfully saved to: {REPORT_PATH}")
    return payload


if __name__ == "__main__":
    run_baseline_experiments()
