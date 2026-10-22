"""ML Model registry metadata model."""

from datetime import datetime
from typing import Any, Dict
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ModelArtifact(Base, TimestampMixin):
    """Registry metadata for validated ML model versions (no raw binary in DB)."""

    __tablename__ = "model_artifacts"

    id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique registry entry identifier (UUIDv4)."
    )
    model_name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        doc="Human-readable model name (e.g., HistGradientBoostingRegressor Pune Sale)."
    )
    model_version: Mapped[str] = mapped_column(
        sa.String(50),
        unique=True,
        index=True,
        nullable=False,
        doc="Canonical version tag (e.g., pune_sale_v1)."
    )
    prediction_type: Mapped[str] = mapped_column(
        sa.String(30),
        nullable=False,
        index=True,
        doc="Domain prediction target: 'sale_price' or 'monthly_rent'."
    )
    artifact_path: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        doc="Filesystem path or URI reference to serialized artifact (.joblib). No binaries in DB."
    )
    feature_schema: Mapped[Dict[str, Any]] = mapped_column(
        sa.JSON,
        nullable=False,
        doc="Feature names, types, and categorical levels accepted by this model."
    )
    metrics: Mapped[Dict[str, Any]] = mapped_column(
        sa.JSON,
        nullable=False,
        doc="Held-out evaluation metrics (CV MAE, Holdout MAE, RMSE, R2) in target currency."
    )
    supported_geography: Mapped[str] = mapped_column(
        sa.String(100),
        default="Pune, Maharashtra, India",
        nullable=False,
        doc="Validated geographical operational envelope."
    )
    is_active: Mapped[bool] = mapped_column(
        sa.Boolean,
        default=True,
        nullable=False,
        index=True,
        doc="Active flag determining whether this model version is approved to serve traffic."
    )
    trained_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        doc="Timestamp when the model was trained and serialized (UTC)."
    )
