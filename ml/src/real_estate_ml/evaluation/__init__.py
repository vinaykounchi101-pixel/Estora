"""Evaluation metrics, cross-validation routines, and reports."""

from real_estate_ml.evaluation.cross_validation import (
    analyze_prediction_slices,
    run_group_kfold_cv,
)
from real_estate_ml.evaluation.metrics import (
    calculate_regression_metrics,
    evaluate_model_partitions,
)

__all__ = [
    "calculate_regression_metrics",
    "evaluate_model_partitions",
    "run_group_kfold_cv",
    "analyze_prediction_slices",
]
