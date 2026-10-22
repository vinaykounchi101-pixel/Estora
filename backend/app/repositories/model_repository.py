"""ModelArtifact repository encapsulating model metadata database queries."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ml_model import ModelArtifact


class ModelRepository:
    """Data access repository for ModelArtifact registry entities."""

    @staticmethod
    def get_by_id(db: Session, model_id: UUID) -> Optional[ModelArtifact]:
        """Fetch a model artifact metadata entry by primary key."""
        return db.get(ModelArtifact, model_id)

    @staticmethod
    def get_by_version(db: Session, model_version: str) -> Optional[ModelArtifact]:
        """Fetch model artifact metadata by unique version tag."""
        stmt = select(ModelArtifact).where(ModelArtifact.model_version == model_version)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_active_model(db: Session, prediction_type: str = "sale_price") -> Optional[ModelArtifact]:
        """Fetch the current active, approved model version for a given prediction target."""
        stmt = (
            select(ModelArtifact)
            .where(
                ModelArtifact.prediction_type == prediction_type,
                ModelArtifact.is_active.is_(True),
            )
            .order_by(ModelArtifact.created_at.desc())
        )
        return db.execute(stmt).scalars().first()

    @staticmethod
    def list_all(db: Session) -> List[ModelArtifact]:
        """List all registered model artifacts ordered by creation date."""
        stmt = select(ModelArtifact).order_by(ModelArtifact.created_at.desc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_active(db: Session) -> int:
        """Count active model versions approved for inference."""
        stmt = select(ModelArtifact).where(ModelArtifact.is_active.is_(True))
        return len(list(db.execute(stmt).scalars().all()))
