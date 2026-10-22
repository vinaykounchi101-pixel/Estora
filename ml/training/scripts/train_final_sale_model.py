"""Final Model Training and Artifact Verification for Pune Sale-Price Model.

Executes Phase 4:
1. Loads all 1,833 clean prepared records from ml/training/data/processed/pune_sale_prices.csv.
2. Fits the selected HistGradientBoostingRegressor pipeline with log1p target transformation.
3. Serializes the versioned pipeline artifact (pune_sale_v1.joblib) and metadata manifest
   (pune_sale_v1_metadata.json) into ml/artifacts/sale_price/.
4. Reloads the serialized artifact and performs comprehensive verification on test samples.
"""

from pathlib import Path
import sys
import pandas as pd

# Add ml/src to sys.path
SRC_DIR = Path(__file__).resolve().parents[2] / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from real_estate_ml.artifacts.metadata import build_sale_price_metadata
from real_estate_ml.artifacts.registry import get_artifacts_directory, save_model_artifact
from real_estate_ml.inference.predictor import SalePricePredictor
from real_estate_ml.models.baseline import (
    ALL_PREDICTOR_FEATURES,
    build_hist_gradient_boosting_pipeline,
)

DATA_PATH = Path("ml/training/data/processed/pune_sale_prices.csv")
MODEL_VERSION = "1.0.0"
ARTIFACT_BASENAME = "pune_sale_v1"


def train_and_verify_final_model(
    data_path: Path = DATA_PATH,
    artifacts_dir: Path | None = None,
    random_state: int = 42,
) -> tuple[Path, Path]:
    """Train selected model on all 1,833 records, serialize, and verify reload."""
    print("=" * 75)
    print("ESTORA PHASE 4: FINAL MODEL TRAINING & ARTIFACT SERIALIZATION")
    print("=" * 75)

    if not data_path.exists():
        raise FileNotFoundError(f"Processed dataset not found: {data_path}")

    # 1. Load and verify dataset
    df = pd.read_csv(data_path)
    print(f"Loaded approved dataset: {len(df)} records from {data_path}")
    assert len(df) == 1833, f"Expected exactly 1833 records, found {len(df)}"
    assert df.isnull().sum().sum() == 0, "Found unexpected missing values"

    X = df[ALL_PREDICTOR_FEATURES]
    y = df["target_price_lakhs"].values

    print(f"Features ({len(ALL_PREDICTOR_FEATURES)}): {ALL_PREDICTOR_FEATURES}")
    print(f"Target: target_price_lakhs (Range: INR {y.min():.1f}L to INR {y.max():.1f}L)")

    # 2. Build winning pipeline
    print("\n--- 1. Building HistGradientBoosting Pipeline with log1p Target Transformation ---")
    pipeline = build_hist_gradient_boosting_pipeline(
        max_iter=150,
        max_depth=8,
        random_state=random_state,
        use_log_target=True,
    )

    # 3. Fit on all 1,833 approved records
    print(f"Fitting pipeline on all {len(df)} records...")
    pipeline.fit(X, y)
    print("Pipeline training completed successfully.")

    # 4. Generate metadata manifest
    metadata = build_sale_price_metadata(
        model_version=MODEL_VERSION,
        training_rows=len(df),
    )

    # 5. Serialize artifact and manifest
    target_dir = artifacts_dir or get_artifacts_directory("sale_price")
    print(f"\n--- 2. Serializing Artifact to {target_dir} ---")
    model_path, meta_path = save_model_artifact(
        pipeline=pipeline,
        metadata=metadata,
        artifacts_dir=target_dir,
        artifact_basename=ARTIFACT_BASENAME,
    )
    print(f"Model artifact saved:    {model_path} ({model_path.stat().st_size:,} bytes)")
    print(f"Metadata manifest saved: {meta_path} ({meta_path.stat().st_size:,} bytes)")

    # 6. Verification: Reload in isolated inference predictor
    print("\n--- 3. Reload Verification in Isolated Predictor ---")
    predictor = SalePricePredictor(model_path=model_path)

    # Verification Test Case 1: Standard 2 BHK in Wakad
    sample_input_1 = {
        "square_ft": 1050.0,
        "bhk_no": 2,
        "latitude": 18.598,
        "longitude": 73.763,
        "posted_by": "Dealer",
        "address": "Wakad,Pune",
        "rera": 1,
        "ready_to_move": 1,
        "resale": 1,
    }
    pred_1 = predictor.predict(sample_input_1)
    print(f"Test 1 (2 BHK Wakad 1050 sqft):      INR {pred_1['estimated_price_lakhs']:.2f} Lakhs (INR {pred_1['estimated_price_inr']:,})")
    assert 40.0 <= pred_1["estimated_price_lakhs"] <= 120.0, f"Unreasonable prediction: {pred_1}"

    # Verification Test Case 2: 3 BHK in Baner
    sample_input_2 = {
        "square_ft": 1500.0,
        "bhk_no": 3,
        "latitude": 18.559,
        "longitude": 73.786,
        "posted_by": "Owner",
        "address": "Baner,Pune",
        "rera": 1,
        "ready_to_move": 1,
        "resale": 1,
    }
    pred_2 = predictor.predict(sample_input_2)
    print(f"Test 2 (3 BHK Baner 1500 sqft):      INR {pred_2['estimated_price_lakhs']:.2f} Lakhs (INR {pred_2['estimated_price_inr']:,})")
    assert 70.0 <= pred_2["estimated_price_lakhs"] <= 200.0, f"Unreasonable prediction: {pred_2}"

    # Verification Test Case 3: Unknown / Novel Micro-Market
    sample_input_3 = {
        "square_ft": 1000.0,
        "bhk_no": 2,
        "latitude": 18.520,
        "longitude": 73.856,
        "posted_by": "Dealer",
        "address": "UnknownNewTownship,Pune",
        "rera": 0,
        "ready_to_move": 1,
        "resale": 1,
    }
    pred_3 = predictor.predict(sample_input_3)
    print(f"Test 3 (Novel Locality Unknown):     INR {pred_3['estimated_price_lakhs']:.2f} Lakhs (Handled gracefully)")
    assert pred_3["estimated_price_lakhs"] > 0, "Prediction must be positive"

    print("\n" + "=" * 75)
    print("PHASE 4 FINAL ARTIFACT VERIFICATION COMPLETE & PASSED")
    print("=" * 75)
    return model_path, meta_path


if __name__ == "__main__":
    train_and_verify_final_model()
