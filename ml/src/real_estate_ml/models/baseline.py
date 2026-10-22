"""Baseline regression pipelines for residential property valuation."""

import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.compose import TransformedTargetRegressor
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Standard feature groupings for the Pune residential dataset
NUMERIC_FEATURES = ["square_ft", "bhk_no", "latitude", "longitude"]
CATEGORICAL_FEATURES = ["posted_by", "address"]
BINARY_FEATURES = ["rera", "ready_to_move", "resale"]

ALL_PREDICTOR_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES


def get_baseline_preprocessor(
    numeric_cols: list[str] = NUMERIC_FEATURES,
    categorical_cols: list[str] = CATEGORICAL_FEATURES,
    binary_cols: list[str] = BINARY_FEATURES,
) -> ColumnTransformer:
    """Construct standard ColumnTransformer for baseline regression models.

    Args:
        numeric_cols: Continuous columns to scale.
        categorical_cols: Categorical columns to one-hot encode.
        binary_cols: Binary flags to pass through.

    Returns:
        Configured ColumnTransformer with handle_unknown='ignore'.
    """
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_cols),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_cols,
            ),
            (
                "bin",
                StandardScaler(with_mean=False, with_std=False),
                binary_cols,
            ),
        ],
        remainder="drop",
    )


def build_dummy_median_pipeline() -> DummyRegressor:
    """Construct a median regressor baseline.

    Always predicts the training partition target median.
    """
    return DummyRegressor(strategy="median")


def build_regularized_linear_pipeline(alpha: float = 1.0) -> TransformedTargetRegressor:
    """Construct regularized Ridge regression pipeline with log-transformed target.

    Using TransformedTargetRegressor with np.log1p and np.expm1 normalizes the
    skewed target variable (skew: 4.09 -> 0.59) and prevents negative price predictions.

    Args:
        alpha: L2 regularization strength.

    Returns:
        TransformedTargetRegressor wrapping a Ridge Pipeline.
    """
    preprocessor = get_baseline_preprocessor()
    ridge_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", Ridge(alpha=alpha, random_state=42)),
        ]
    )
    return TransformedTargetRegressor(
        regressor=ridge_pipeline,
        func=np.log1p,
        inverse_func=np.expm1,
        check_inverse=False,
    )


def build_random_forest_pipeline(
    n_estimators: int = 100,
    max_depth: int | None = 15,
    random_state: int = 42,
    use_log_target: bool = False,
) -> Pipeline | TransformedTargetRegressor:
    """Construct Random Forest regressor pipeline.

    Args:
        n_estimators: Number of decision trees.
        max_depth: Maximum tree depth to constrain overfitting.
        random_state: Reproducibility seed.
        use_log_target: If True, wraps estimator in TransformedTargetRegressor with np.log1p.

    Returns:
        Pipeline or TransformedTargetRegressor wrapping RandomForestRegressor.
    """
    preprocessor = get_baseline_preprocessor()
    rf = RandomForestRegressor(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_state,
        n_jobs=-1,
    )
    pipe = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", rf),
        ]
    )
    if use_log_target:
        return TransformedTargetRegressor(
            regressor=pipe,
            func=np.log1p,
            inverse_func=np.expm1,
            check_inverse=False,
        )
    return pipe


def build_hist_gradient_boosting_pipeline(
    max_iter: int = 150,
    max_depth: int = 8,
    random_state: int = 42,
    use_log_target: bool = False,
) -> Pipeline | TransformedTargetRegressor:
    """Construct HistGradientBoosting regressor pipeline.

    Args:
        max_iter: Maximum boosting iterations.
        max_depth: Maximum depth of individual trees.
        random_state: Reproducibility seed.
        use_log_target: If True, wraps estimator in TransformedTargetRegressor with np.log1p.

    Returns:
        Pipeline or TransformedTargetRegressor wrapping HistGradientBoostingRegressor.
    """
    preprocessor = get_baseline_preprocessor()
    hgb = HistGradientBoostingRegressor(
        max_iter=max_iter,
        max_depth=max_depth,
        random_state=random_state,
    )
    pipe = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", hgb),
        ]
    )
    if use_log_target:
        return TransformedTargetRegressor(
            regressor=pipe,
            func=np.log1p,
            inverse_func=np.expm1,
            check_inverse=False,
        )
    return pipe
