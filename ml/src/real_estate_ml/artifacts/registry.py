"""Registry management for saving and loading versioned model artifacts."""

import os
from pathlib import Path
from typing import Any
import joblib

from real_estate_ml.artifacts.metadata import (
    ModelArtifactMetadata,
    load_metadata,
    save_metadata,
)

# Configurable artifacts directory path via environment variable or package root default
PACKAGE_ARTIFACTS_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "artifacts"
DEFAULT_ARTIFACTS_ROOT = PACKAGE_ARTIFACTS_ROOT if PACKAGE_ARTIFACTS_ROOT.exists() else Path("ml/artifacts")


def get_artifacts_directory(subpath: str = "sale_price") -> Path:
    """Resolve artifacts directory from environment variable or standard default."""
    env_root = os.getenv("ESTORA_ARTIFACTS_DIR")
    base_dir = Path(env_root) if env_root else DEFAULT_ARTIFACTS_ROOT
    target_dir = base_dir / subpath
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir


def save_model_artifact(
    pipeline: Any,
    metadata: ModelArtifactMetadata,
    artifacts_dir: Path | None = None,
    artifact_basename: str = "pune_sale_v1",
) -> tuple[Path, Path]:
    """Serialize trained ML pipeline and its accompanying metadata manifest.

    Args:
        pipeline: Trained scikit-learn Pipeline or TransformedTargetRegressor.
        metadata: Validated ModelArtifactMetadata instance.
        artifacts_dir: Optional custom destination directory.
        artifact_basename: Base filename without extension.

    Returns:
        tuple containing (model_file_path, metadata_file_path).
    """
    dest_dir = artifacts_dir or get_artifacts_directory("sale_price")
    model_path = dest_dir / f"{artifact_basename}.joblib"
    metadata_path = dest_dir / f"{artifact_basename}_metadata.json"

    # Save joblib binary pipeline
    joblib.dump(pipeline, model_path, compress=3)

    # Save JSON metadata manifest
    save_metadata(metadata, metadata_path)

    return model_path, metadata_path


def load_model_artifact(
    model_path: Path,
    metadata_path: Path | None = None,
) -> tuple[Any, ModelArtifactMetadata]:
    """Safely load serialized pipeline and companion metadata manifest.

    Args:
        model_path: Path to the .joblib artifact.
        metadata_path: Optional path to the metadata JSON. If omitted,
            looks for companion file with '_metadata.json' suffix.

    Returns:
        tuple containing (loaded_pipeline, loaded_metadata).
    """
    model_path = Path(model_path)
    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact binary not found: {model_path}")

    if metadata_path is None:
        metadata_path = model_path.with_name(f"{model_path.stem}_metadata.json")

    metadata = load_metadata(metadata_path)
    pipeline = joblib.load(model_path)

    return pipeline, metadata
