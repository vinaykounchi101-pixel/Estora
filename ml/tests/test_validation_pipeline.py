"""Tests for GroupKFold cross-validation and slice analysis pipeline."""

import numpy as np
import pandas as pd
import pytest

from real_estate_ml.evaluation.cross_validation import (
    analyze_prediction_slices,
    run_group_kfold_cv,
)
from real_estate_ml.models.baseline import (
    ALL_PREDICTOR_FEATURES,
    build_dummy_median_pipeline,
    build_hist_gradient_boosting_pipeline,
    build_regularized_linear_pipeline,
)


@pytest.fixture
def synthetic_cv_df() -> pd.DataFrame:
    """Synthetic dataset for testing cross-validation routines."""
    np.random.seed(42)
    n = 120
    addresses = ["Baner,Pune", "Wakad,Pune", "Kharadi,Pune", "Aundh,Pune", "RareLocality,Pune"]
    areas = [600.0, 950.0, 1200.0, 1500.0]

    return pd.DataFrame({
        "square_ft": [areas[i % 4] for i in range(n)],
        "bhk_no": [1 + (i % 3) for i in range(n)],
        "latitude": np.random.uniform(18.45, 18.65, n),
        "longitude": np.random.uniform(73.75, 73.95, n),
        "posted_by": ["Dealer" if i % 2 == 0 else "Owner" for i in range(n)],
        "address": [addresses[i % 5] for i in range(n)],
        "under_construction": [i % 2 for i in range(n)],
        "ready_to_move": [1 - (i % 2) for i in range(n)],
        "rera": [int(i % 3 == 0) for i in range(n)],
        "resale": [1 for _ in range(n)],
        "target_price_lakhs": [
            25.0 + (areas[i % 4] / 25.0) + np.random.normal(0, 3) for i in range(n)
        ],
    })


def test_group_kfold_cv_zero_leakage(synthetic_cv_df: pd.DataFrame):
    """Verify that every fold in GroupKFold cross-validation has zero overlapping groups."""
    cv_res = run_group_kfold_cv(
        model_factory=lambda: build_regularized_linear_pipeline(alpha=1.0),
        df=synthetic_cv_df,
        feature_cols=ALL_PREDICTOR_FEATURES,
        target_col="target_price_lakhs",
        n_splits=3,
        currency_unit="INR Lakhs",
    )

    assert cv_res["n_splits"] == 3
    assert len(cv_res["fold_metrics"]) == 3
    for check in cv_res["fold_leakage_checks"]:
        assert check["overlapping_groups"] == 0


def test_group_kfold_cv_aggregates(synthetic_cv_df: pd.DataFrame):
    """Verify aggregate summary metrics are properly computed across folds."""
    cv_res = run_group_kfold_cv(
        model_factory=lambda: build_dummy_median_pipeline(),
        df=synthetic_cv_df,
        feature_cols=ALL_PREDICTOR_FEATURES,
        target_col="target_price_lakhs",
        n_splits=3,
    )

    agg = cv_res["aggregate_summary"]
    assert "mae_mean" in agg
    assert "mae_std" in agg
    assert "rmse_mean" in agg
    assert "r2_mean" in agg
    assert agg["mae_mean"] > 0
    assert len(cv_res["oof_predictions"]) == len(synthetic_cv_df)


def test_slice_analysis_flags_small_samples(synthetic_cv_df: pd.DataFrame):
    """Verify analyze_prediction_slices correctly identifies small sample subsets."""
    dummy = build_dummy_median_pipeline()
    X = synthetic_cv_df[ALL_PREDICTOR_FEATURES]
    y = synthetic_cv_df["target_price_lakhs"].values
    dummy.fit(X, y)
    preds = dummy.predict(X)

    # Set min_samples to 30
    slices = analyze_prediction_slices(
        df=synthetic_cv_df,
        oof_preds=preds,
        target_col="target_price_lakhs",
        min_samples=30,
    )

    assert "by_price_bracket" in slices
    assert "by_bhk" in slices
    assert "by_top_locality" in slices

    # Check that RareLocality has small sample flag
    locality_slices = slices["by_top_locality"]
    rare_items = [item for item in locality_slices if item["slice_value"] == "RareLocality"]
    assert len(rare_items) == 1
    assert rare_items[0]["is_sufficient_sample"] is False
    assert "insufficient" in rare_items[0]["caveat"].lower()


def test_hist_gradient_boosting_log_target(synthetic_cv_df: pd.DataFrame):
    """Verify HistGradientBoosting with log1p target transformation trains and predicts properly."""
    model = build_hist_gradient_boosting_pipeline(max_iter=30, use_log_target=True)
    X = synthetic_cv_df[ALL_PREDICTOR_FEATURES]
    y = synthetic_cv_df["target_price_lakhs"].values

    model.fit(X, y)
    preds = model.predict(X)

    assert len(preds) == len(y)
    assert (preds > 0).all()
    assert not np.isnan(preds).any()
