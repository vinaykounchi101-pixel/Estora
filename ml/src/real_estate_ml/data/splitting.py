"""Leakage-resistant train and held-out evaluation splitting routines."""

from typing import Any
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit


def create_grouped_sale_split(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = 42,
    group_cols: list[str] | None = None,
) -> tuple[pd.DataFrame, pd.DataFrame, dict[str, Any]]:
    """Split residential sales dataset into train and held-out test partitions.

    Ensures that identical or near-identical listings (e.g., identical
    square footage within the exact same micro-market address) do not cross
    partition boundaries, preventing optimistic evaluation leakage.

    Args:
        df: Processed sales DataFrame.
        test_size: Proportion of dataset to include in the held-out test split.
        random_state: Seed for deterministic splitting.
        group_cols: Optional list of column names used to build the grouping key.
            Defaults to ['address', 'square_ft'].

    Returns:
        tuple containing:
            - train_df: Training DataFrame partition.
            - test_df: Held-out evaluation DataFrame partition.
            - split_meta: Dictionary documenting split parameters and integrity checks.
    """
    if df.empty:
        raise ValueError("Cannot split an empty DataFrame.")

    df_copy = df.copy()

    # Generate grouping key
    if group_cols is None:
        # Round square_ft to 1 decimal place to capture duplicate floorplans
        group_key = (
            df_copy["address"].astype(str)
            + "_"
            + df_copy["square_ft"].round(1).astype(str)
        )
    else:
        group_key = df_copy[group_cols].astype(str).agg("_".join, axis=1)

    df_copy["_group_key"] = group_key

    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    train_idx, test_idx = next(gss.split(df_copy, groups=df_copy["_group_key"]))

    train_df = df_copy.iloc[train_idx].drop(columns=["_group_key"]).copy()
    test_df = df_copy.iloc[test_idx].drop(columns=["_group_key"]).copy()

    # Verification of zero leakage across partition groups
    train_groups = set(df_copy.iloc[train_idx]["_group_key"])
    test_groups = set(df_copy.iloc[test_idx]["_group_key"])
    overlapping_groups = train_groups.intersection(test_groups)

    if overlapping_groups:
        raise RuntimeError(
            f"Data leakage detected! {len(overlapping_groups)} groups crossed partition boundaries."
        )

    split_meta: dict[str, Any] = {
        "strategy": "GroupShuffleSplit",
        "random_state": random_state,
        "requested_test_size": test_size,
        "group_definition": group_cols or ["address", "square_ft_rounded_1dec"],
        "total_records": len(df),
        "total_unique_groups": df_copy["_group_key"].nunique(),
        "train_rows": len(train_df),
        "train_pct": round(len(train_df) / len(df) * 100, 2),
        "train_unique_groups": len(train_groups),
        "test_rows": len(test_df),
        "test_pct": round(len(test_df) / len(df) * 100, 2),
        "test_unique_groups": len(test_groups),
        "overlapping_groups_count": len(overlapping_groups),
        "is_leakage_free": True,
    }

    return train_df, test_df, split_meta
