"""Initial database foundation schema: users, predictions, and model_artifacts.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-10-22 18:35:00.000000
"""

from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=True),
        sa.Column("role", sa.String(length=30), server_default="authenticated_user", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_role"), "users", ["role"], unique=False)

    # 2. Model Artifacts Table (Registry Metadata, no binaries)
    op.create_table(
        "model_artifacts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("model_name", sa.String(length=100), nullable=False),
        sa.Column("model_version", sa.String(length=50), nullable=False),
        sa.Column("prediction_type", sa.String(length=30), nullable=False),
        sa.Column("artifact_path", sa.String(length=255), nullable=False),
        sa.Column("feature_schema", sa.JSON(), nullable=False),
        sa.Column("metrics", sa.JSON(), nullable=False),
        sa.Column("supported_geography", sa.String(length=100), server_default="Pune, Maharashtra, India", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("trained_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_model_artifacts")),
    )
    op.create_index(op.f("ix_model_artifacts_id"), "model_artifacts", ["id"], unique=False)
    op.create_index(op.f("ix_model_artifacts_model_version"), "model_artifacts", ["model_version"], unique=True)
    op.create_index(op.f("ix_model_artifacts_prediction_type"), "model_artifacts", ["prediction_type"], unique=False)
    op.create_index(op.f("ix_model_artifacts_is_active"), "model_artifacts", ["is_active"], unique=False)

    # 3. Predictions Table (Valuation history, immutable snapshot, fixed-precision)
    op.create_table(
        "predictions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("prediction_type", sa.String(length=30), server_default="sale_price", nullable=False),
        sa.Column("property_inputs", sa.JSON(), nullable=False),
        sa.Column("estimated_price", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="INR", nullable=False),
        sa.Column("currency_unit", sa.String(length=20), server_default="lakhs", nullable=False),
        sa.Column("model_version", sa.String(length=50), nullable=False),
        sa.Column("supported_geography", sa.String(length=100), server_default="Pune, Maharashtra, India", nullable=False),
        sa.Column("disclaimer", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_predictions_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_predictions")),
    )
    op.create_index(op.f("ix_predictions_id"), "predictions", ["id"], unique=False)
    op.create_index(op.f("ix_predictions_user_id"), "predictions", ["user_id"], unique=False)
    op.create_index(op.f("ix_predictions_prediction_type"), "predictions", ["prediction_type"], unique=False)
    op.create_index(op.f("ix_predictions_model_version"), "predictions", ["model_version"], unique=False)
    op.create_index(op.f("ix_predictions_created_at"), "predictions", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_table("predictions")
    op.drop_table("model_artifacts")
    op.drop_table("users")
