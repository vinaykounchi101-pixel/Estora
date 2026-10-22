"""Artifact management, metadata schemas, and model serialization."""

from real_estate_ml.artifacts.metadata import (
    ModelArtifactMetadata,
    build_sale_price_metadata,
    load_metadata,
    save_metadata,
)
from real_estate_ml.artifacts.registry import (
    get_artifacts_directory,
    load_model_artifact,
    save_model_artifact,
)

__all__ = [
    "ModelArtifactMetadata",
    "build_sale_price_metadata",
    "save_metadata",
    "load_metadata",
    "get_artifacts_directory",
    "save_model_artifact",
    "load_model_artifact",
]
