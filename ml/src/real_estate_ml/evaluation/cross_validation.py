"""Group-aware cross-validation and slice evaluation routines for Estora valuation models."""

from collections.abc import Callable
from typing import Any
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold

from real_estate_ml.evaluation.metrics import calculate_regression_metrics


def run_group_kfold_cv(
    model_factory: Callable[[], Any],
    df: pd.DataFrame,
    feature_cols: list[str],
    target_col: str = "target_price_lakhs",
    n_splits: int = 5,
    group_cols: list[str] | None = None,
    currency_unit: str = "INR Lakhs",
) -> dict[str, Any]:
    """Execute group-aware k-fold cross-validation on a development dataset.

    Ensures that properties sharing identical address and square footage groups
    remain strictly within the same fold, preventing optimistic leakage.
    Each fold fits preprocessing and target transformation strictly on the
    training partition of that fold.

    Args:
        model_factory: Callable returning a fresh, un-fitted estimator or Pipeline.
        df: Input DataFrame (development partition).
        feature_cols: List of predictor feature column names.
        target_col: Name of the target variable column.
        n_splits: Number of cross-validation folds. Defaults to 5.
        group_cols: Columns used to build group identifiers. Defaults to address + square_ft.
        currency_unit: Reporting currency label.

    Returns:
        Structured dictionary containing fold-level metrics, aggregate statistics
        (mean and std dev), out-of-fold predictions, and leakage validation checks.
    """
    df_work = df.copy().reset_index(drop=True)

    # 1. Build grouping key
    if group_cols is None:
        group_key = (
            df_work["address"].astype(str)
            + "_"
            + df_work["square_ft"].round(1).astype(str)
        )
    else:
        group_key = df_work[group_cols].astype(str).agg("_".join, axis=1)

    df_work["_group_key"] = group_key
    total_unique_groups = df_work["_group_key"].nunique()

    gkf = GroupKFold(n_splits=n_splits)

    fold_results = []
    oof_predictions = np.zeros(len(df_work), dtype=float)
    fold_leakage_checks = []

    X = df_work[feature_cols]
    y = df_work[target_col].values

    for fold_idx, (train_idx, val_idx) in enumerate(
        gkf.split(df_work, groups=df_work["_group_key"])
    ):
        train_groups = set(df_work.iloc[train_idx]["_group_key"])
        val_groups = set(df_work.iloc[val_idx]["_group_key"])
        leakage = train_groups.intersection(val_groups)

        if leakage:
            raise RuntimeError(
                f"Data leakage in fold {fold_idx + 1}! {len(leakage)} overlapping groups."
            )

        fold_leakage_checks.append(
            {
                "fold": fold_idx + 1,
                "train_rows": len(train_idx),
                "val_rows": len(val_idx),
                "train_groups": len(train_groups),
                "val_groups": len(val_groups),
                "overlapping_groups": len(leakage),
            }
        )

        # Fresh model instance for the fold
        model = model_factory()
        X_train_f, y_train_f = X.iloc[train_idx], y[train_idx]
        X_val_f, y_val_f = X.iloc[val_idx], y[val_idx]

        # Fit model pipeline strictly on the training fold
        model.fit(X_train_f, y_train_f)

        # Predict on validation fold (predictions in native target currency)
        y_pred_val = model.predict(X_val_f)
        oof_predictions[val_idx] = y_pred_val

        # Calculate fold metrics
        metrics = calculate_regression_metrics(y_val_f, y_pred_val, currency_unit)
        metrics["fold"] = fold_idx + 1
        fold_results.append(metrics)

    # 2. Compute aggregate summary metrics (Mean and Std across folds)
    maes = [f["mae"] for f in fold_results]
    rmses = [f["rmse"] for f in fold_results]
    medaes = [f["median_ae"] for f in fold_results]
    r2s = [f["r2"] for f in fold_results]

    aggregate_summary = {
        "mae_mean": round(float(np.mean(maes)), 4),
        "mae_std": round(float(np.std(maes, ddof=1)), 4),
        "rmse_mean": round(float(np.mean(rmses)), 4),
        "rmse_std": round(float(np.std(rmses, ddof=1)), 4),
        "median_ae_mean": round(float(np.mean(medaes)), 4),
        "median_ae_std": round(float(np.std(medaes, ddof=1)), 4),
        "r2_mean": round(float(np.mean(r2s)), 4),
        "r2_std": round(float(np.std(r2s, ddof=1)), 4),
    }

    # 3. Overall out-of-fold metrics
    oof_metrics = calculate_regression_metrics(y, oof_predictions, currency_unit)

    return {
        "n_splits": n_splits,
        "total_records": len(df_work),
        "total_groups": total_unique_groups,
        "fold_leakage_checks": fold_leakage_checks,
        "fold_metrics": fold_results,
        "aggregate_summary": aggregate_summary,
        "overall_oof_metrics": oof_metrics,
        "oof_predictions": oof_predictions.tolist(),
    }


def analyze_prediction_slices(
    df: pd.DataFrame,
    oof_preds: np.ndarray | list[float],
    target_col: str = "target_price_lakhs",
    min_samples: int = 25,
) -> dict[str, Any]:
    """Evaluate model prediction performance across demographic, locality, and price slices.

    Flags small sample slices to avoid unsupported generalization claims.

    Args:
        df: Input DataFrame corresponding to oof_preds.
        oof_preds: Out-of-fold model predictions in native currency.
        target_col: Ground truth target column.
        min_samples: Minimum records required for high-confidence statistical claims.

    Returns:
        Structured dictionary categorized by price tier, BHK, seller, and locality.
    """
    df_eval = df.copy().reset_index(drop=True)
    df_eval["_pred"] = np.asarray(oof_preds, dtype=float)
    y_true = df_eval[target_col].values
    y_pred = df_eval["_pred"].values

    # Categorize price ranges
    def categorize_price(p: float) -> str:
        if p < 50.0:
            return "Affordable (< ₹50L)"
        elif p <= 100.0:
            return "Mid-Market (₹50L - ₹100L)"
        elif p <= 200.0:
            return "Premium (₹100L - ₹200L)"
        else:
            return "Luxury (> ₹200L)"

    df_eval["_price_bracket"] = df_eval[target_col].apply(categorize_price)

    slices_to_evaluate = {
        "by_price_bracket": "_price_bracket",
        "by_bhk": "bhk_no",
        "by_posted_by": "posted_by",
        "by_ready_to_move": "ready_to_move",
        "by_rera": "rera",
        "by_top_locality": "address",
    }

    results: dict[str, Any] = {}

    for section_name, col_name in slices_to_evaluate.items():
        section_results = []
        value_counts = df_eval[col_name].value_counts()

        for val, count in value_counts.items():
            sub = df_eval[df_eval[col_name] == val]
            m = calculate_regression_metrics(
                sub[target_col].values, sub["_pred"].values
            )
            is_reliable = count >= min_samples

            clean_label = str(val).replace(",Pune", "")
            section_results.append(
                {
                    "slice_value": clean_label,
                    "sample_count": int(count),
                    "is_sufficient_sample": is_reliable,
                    "mae": m["mae"],
                    "rmse": m["rmse"],
                    "median_ae": m["median_ae"],
                    "r2": m["r2"],
                    "caveat": (
                        None
                        if is_reliable
                        else f"Sample size n={count} < {min_samples}; insufficient for statistical conclusions"
                    ),
                }
            )

        results[section_name] = section_results

    return results
