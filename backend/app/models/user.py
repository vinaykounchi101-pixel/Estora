"""User database model."""

from enum import Enum
from typing import TYPE_CHECKING, List, Optional
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.prediction import Prediction


class UserRole(str, Enum):
    """Role-based access tiers per SRS Section 5.1."""
    VISITOR = "visitor"
    AUTHENTICATED_USER = "authenticated_user"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    """User entity storing authentication credentials, role, and status."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique primary key (UUIDv4)."
    )
    email: Mapped[str] = mapped_column(
        sa.String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="Unique email address used as login identifier."
    )
    hashed_password: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        doc="Cryptographic password hash (bcrypt/argon2). Plaintext strictly forbidden."
    )
    full_name: Mapped[Optional[str]] = mapped_column(
        sa.String(100),
        nullable=True,
        doc="Optional user display name."
    )
    role: Mapped[str] = mapped_column(
        sa.String(30),
        default=UserRole.AUTHENTICATED_USER.value,
        nullable=False,
        index=True,
        doc="Role tier: visitor, authenticated_user, or admin."
    )
    is_active: Mapped[bool] = mapped_column(
        sa.Boolean,
        default=True,
        nullable=False,
        doc="Account status flag; inactive accounts cannot authenticate."
    )

    # Relationships
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
        doc="Historical predictions authored by this user."
    )
