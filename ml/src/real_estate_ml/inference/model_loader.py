"""Safe artifact loader with caching and validation."""

from pathlib import Path
from typing import Any

from real_estate_ml.artifacts.metadata import ModelArtifactMetadata
from real_estate_ml.artifacts.registry import (
    get_artifacts_directory,
    load_model_artifact,
)


class ModelLoader:
    """Manages thread-safe loading and caching of model artifacts."""

    def __init__(
        self,
        model_path: Path | None = None,
        metadata_path: Path | None = None,
    ):
        if model_path is None:
            artifacts_dir = get_artifacts_directory("sale_price")
            model_path = artifacts_dir / "pune_sale_v1.joblib"

        self.model_path = Path(model_path)
        self.metadata_path = Path(metadata_path) if metadata_path else None
        self._pipeline: Any = None
        self._metadata: ModelArtifactMetadata | None = None

    def load(self) -> tuple[Any, ModelArtifactMetadata]:
        """Load and cache the model pipeline and metadata."""
        if self._pipeline is None or self._metadata is None:
            self._pipeline, self._metadata = load_model_artifact(
                self.model_path, self.metadata_path
            )
        return self._pipeline, self._metadata

    @property
    def pipeline(self) -> Any:
        """Access loaded pipeline, loading on-demand if necessary."""
        if self._pipeline is None:
            self.load()
        return self._pipeline

    @property
    def metadata(self) -> ModelArtifactMetadata:
        """Access loaded metadata, loading on-demand if necessary."""
        if self._metadata is None:
            self.load()
        return self._metadata
