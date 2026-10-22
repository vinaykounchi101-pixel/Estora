"""Standardized regression metrics computation for Estora valuation models."""

from typing import Any
import numpy as np
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score, median_absolute_error


def calculate_regression_metrics(
    y_true: np.ndarray | list[float],
    y_pred: np.ndarray | list[float],
    currency_unit: str = "INR Lakhs",
) -> dict[str, Any]:
    """Compute held-out evaluation metrics in native target currency.

    In accordance with Estora model governance (AGENTS.md), metrics are
    reported strictly in target currency units alongside R^2. No arbitrary
    percentage accuracies are advertised.

    Args:
        y_true: Ground truth target values.
        y_pred: Model predictions.
        currency_unit: Unit string label for reporting.

    Returns:
        Dictionary containing MAE, RMSE, MedAE, R2, sample count, and currency units.
    """
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)

    if len(y_true_arr) != len(y_pred_arr):
        raise ValueError(
            f"Dimension mismatch: y_true has {len(y_true_arr)} entries, y_pred has {len(y_pred_arr)} entries."
        )

    mae = float(mean_absolute_error(y_true_arr, y_pred_arr))
    rmse = float(root_mean_squared_error(y_true_arr, y_pred_arr))
    medae = float(median_absolute_error(y_true_arr, y_pred_arr))
    r2 = float(r2_score(y_true_arr, y_pred_arr))

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "median_ae": round(medae, 4),
        "r2": round(r2, 4),
        "sample_count": len(y_true_arr),
        "target_currency_unit": currency_unit,
    }


def evaluate_model_partitions(
    model: Any,
    X_train: Any,
    y_train: np.ndarray,
    X_test: Any,
    y_test: np.ndarray,
    model_name: str,
    currency_unit: str = "INR Lakhs",
) -> dict[str, Any]:
    """Evaluate a trained model pipeline on both training and held-out partitions.

    Args:
        model: Fitted scikit-learn estimator or Pipeline.
        X_train: Training features.
        y_train: Training targets.
        X_test: Held-out evaluation features.
        y_test: Held-out evaluation targets.
        model_name: Descriptive identifier of the model.
        currency_unit: Unit label.

    Returns:
        Structured dictionary comparing train vs. held-out performance.
    """
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)

    train_metrics = calculate_regression_metrics(y_train, y_pred_train, currency_unit)
    test_metrics = calculate_regression_metrics(y_test, y_pred_test, currency_unit)

    return {
        "model_name": model_name,
        "train_metrics": train_metrics,
        "held_out_metrics": test_metrics,
        "overfitting_gap": {
            "mae_delta": round(test_metrics["mae"] - train_metrics["mae"], 4),
            "rmse_delta": round(test_metrics["rmse"] - train_metrics["rmse"], 4),
            "r2_delta": round(train_metrics["r2"] - test_metrics["r2"], 4),
        },
    }
