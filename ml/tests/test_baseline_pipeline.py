"""Tests for Estora baseline sale-price regression modeling and splitting pipelines."""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from real_estate_ml.data.splitting import create_grouped_sale_split
from real_estate_ml.evaluation.metrics import (
    calculate_regression_metrics,
    evaluate_model_partitions,
)
from real_estate_ml.models.baseline import (
    ALL_PREDICTOR_FEATURES,
    build_dummy_median_pipeline,
    build_hist_gradient_boosting_pipeline,
    build_regularized_linear_pipeline,
    get_baseline_preprocessor,
)


@pytest.fixture
def synthetic_sales_df() -> pd.DataFrame:
    """Provide a small synthetic DataFrame mimicking the Pune sales dataset.

    Note: Synthetic test fixture for unit testing only; not real property data.
    """
    np.random.seed(42)
    n = 100
    addresses = ["Baner,Pune", "Wakad,Pune", "Kharadi,Pune", "Aundh,Pune"]
    square_fts = [600.0, 1000.0, 1250.0, 1800.0]

    data = {
        "square_ft": [square_fts[i % 4] for i in range(n)],
        "bhk_no": [1 + (i % 3) for i in range(n)],
        "latitude": np.random.uniform(18.45, 18.65, n),
        "longitude": np.random.uniform(73.75, 73.95, n),
        "posted_by": ["Dealer" if i % 2 == 0 else "Owner" for i in range(n)],
        "address": [addresses[i % 4] for i in range(n)],
        "locality": [addresses[i % 4].replace(",Pune", "") for i in range(n)],
        "under_construction": [i % 2 for i in range(n)],
        "ready_to_move": [1 - (i % 2) for i in range(n)],
        "rera": [int(i % 3 == 0) for i in range(n)],
        "resale": [1 for _ in range(n)],
        "bhk_or_rk": ["BHK" for _ in range(n)],
        "target_price_lakhs": [
            30.0 + (square_fts[i % 4] / 20.0) + np.random.normal(0, 5) for i in range(n)
        ],
    }
    return pd.DataFrame(data)


def test_grouped_split_zero_leakage(synthetic_sales_df: pd.DataFrame):
    """Verify that grouped splitting strictly prevents group overlap."""
    train_df, test_df, meta = create_grouped_sale_split(
        synthetic_sales_df, test_size=0.25, random_state=42
    )

    train_groups = set(
        train_df["address"].astype(str) + "_" + train_df["square_ft"].round(1).astype(str)
    )
    test_groups = set(
        test_df["address"].astype(str) + "_" + test_df["square_ft"].round(1).astype(str)
    )

    assert len(train_groups.intersection(test_groups)) == 0
    assert meta["overlapping_groups_count"] == 0
    assert meta["is_leakage_free"] is True
    assert len(train_df) + len(test_df) == len(synthetic_sales_df)


def test_grouped_split_deterministic(synthetic_sales_df: pd.DataFrame):
    """Verify that grouped splitting is fully deterministic across identical seeds."""
    train_1, test_1, _ = create_grouped_sale_split(
        synthetic_sales_df, test_size=0.20, random_state=123
    )
    train_2, test_2, _ = create_grouped_sale_split(
        synthetic_sales_df, test_size=0.20, random_state=123
    )

    pd.testing.assert_frame_equal(train_1, train_2)
    pd.testing.assert_frame_equal(test_1, test_2)


def test_preprocessor_handles_unseen_categories(synthetic_sales_df: pd.DataFrame):
    """Verify ColumnTransformer handles previously unseen addresses gracefully."""
    X = synthetic_sales_df[ALL_PREDICTOR_FEATURES]
    preprocessor = get_baseline_preprocessor()
    preprocessor.fit(X)

    # Test with unseen address and novel posted_by category
    novel_data = X.iloc[:2].copy()
    novel_data["address"] = ["UnknownLocality,Pune", "NewColony,Pune"]
    novel_data["posted_by"] = ["Builder", "ForeignInvestor"]

    transformed = preprocessor.transform(novel_data)
    assert not np.isnan(transformed).any()
    assert transformed.shape[0] == 2


def test_target_transform_preserves_positive_predictions(synthetic_sales_df: pd.DataFrame):
    """Verify log1p-transformed Ridge pipeline strictly predicts positive values."""
    X = synthetic_sales_df[ALL_PREDICTOR_FEATURES]
    y = synthetic_sales_df["target_price_lakhs"].values

    model = build_regularized_linear_pipeline(alpha=1.0)
    model.fit(X, y)

    preds = model.predict(X)
    assert (preds > 0).all()
    assert len(preds) == len(y)


def test_baseline_models_beat_dummy_on_train(synthetic_sales_df: pd.DataFrame):
    """Verify that statistical regression models beat the dummy median regressor."""
    X = synthetic_sales_df[ALL_PREDICTOR_FEATURES]
    y = synthetic_sales_df["target_price_lakhs"].values

    dummy = build_dummy_median_pipeline()
    dummy.fit(X, y)
    dummy_mae = calculate_regression_metrics(y, dummy.predict(X))["mae"]

    ridge = build_regularized_linear_pipeline()
    ridge.fit(X, y)
    ridge_mae = calculate_regression_metrics(y, ridge.predict(X))["mae"]

    hgb = build_hist_gradient_boosting_pipeline(max_iter=50, random_state=42)
    hgb.fit(X, y)
    hgb_mae = calculate_regression_metrics(y, hgb.predict(X))["mae"]

    assert ridge_mae < dummy_mae
    assert hgb_mae < dummy_mae


def test_metrics_calculation_consistency():
    """Verify that calculation of MAE, RMSE, and R2 matches mathematical formulas."""
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([12.0, 18.0, 33.0, 39.0])

    metrics = calculate_regression_metrics(y_true, y_pred, currency_unit="INR Lakhs")

    assert metrics["mae"] == 2.0
    assert np.isclose(metrics["rmse"], np.sqrt((4 + 4 + 9 + 1) / 4))
    assert metrics["median_ae"] == 2.0
    assert metrics["sample_count"] == 4
    assert metrics["target_currency_unit"] == "INR Lakhs"
