"""Historical prediction database model."""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING, Any, Dict, Optional
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class PredictionType(str, Enum):
    """Prediction domain targets ensuring sale and rental workflows remain separate."""
    SALE_PRICE = "sale_price"
    MONTHLY_RENT = "monthly_rent"


class Prediction(Base):
    """Historical valuation record containing inputs snapshot, estimate, and model metadata."""

    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique prediction identifier (UUIDv4)."
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.Uuid,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        doc="Author user reference; NULL indicates an anonymous/visitor prediction."
    )
    prediction_type: Mapped[str] = mapped_column(
        sa.String(30),
        nullable=False,
        index=True,
        default=PredictionType.SALE_PRICE.value,
        doc="Target type ('sale_price' or 'monthly_rent'). Never conflated."
    )
    property_inputs: Mapped[Dict[str, Any]] = mapped_column(
        sa.JSON,
        nullable=False,
        doc="Immutable snapshot of validated input features used during inference."
    )
    estimated_price: Mapped[Decimal] = mapped_column(
        sa.Numeric(precision=14, scale=2),
        nullable=False,
        doc="Predicted monetary estimate stored in exact fixed precision (no floating-point)."
    )
    currency: Mapped[str] = mapped_column(
        sa.String(3),
        default="INR",
        nullable=False,
        doc="Standard ISO 4217 currency code (e.g., INR)."
    )
    currency_unit: Mapped[str] = mapped_column(
        sa.String(20),
        default="lakhs",
        nullable=False,
        doc="Target currency unit scale ('lakhs' for sale prices, 'INR' for rents)."
    )
    model_version: Mapped[str] = mapped_column(
        sa.String(50),
        nullable=False,
        index=True,
        doc="Exact ML model version and registry tag that produced this inference."
    )
    supported_geography: Mapped[str] = mapped_column(
        sa.String(100),
        default="Pune, Maharashtra, India",
        nullable=False,
        doc="Geographic boundaries validated for this model."
    )
    disclaimer: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        default="Estora decision-support estimate. Not an appraisal or formal valuation.",
        doc="Mandatory explanatory disclaimer attached to every estimate."
    )
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False,
        index=True,
        doc="Timestamp of prediction generation in UTC."
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="predictions"
    )
