"""SQLAlchemy declarative base and common mixins."""

from datetime import datetime, timezone
import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


class TimestampMixin:
    """Standardized UTC audit timestamp mixin for application entities."""

    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False,
        doc="Timestamp when the record was initially created (UTC)."
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
        doc="Timestamp when the record was last modified (UTC)."
    )
