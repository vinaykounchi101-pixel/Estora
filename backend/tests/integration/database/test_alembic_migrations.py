"""Integration test verifying Alembic migration upgrade and downgrade lifecycles."""

import os
import pathlib
import tempfile
import pytest
from alembic import command
from alembic.config import Config
import sqlalchemy as sa


def test_alembic_upgrade_and_downgrade_lifecycle():
    """Verify clean execution of initial migration upgrade to head and downgrade to base."""
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    ini_path = os.path.join(backend_dir, "alembic.ini")
    migrations_dir = os.path.join(backend_dir, "migrations")

    assert os.path.isfile(ini_path), f"alembic.ini not found at {ini_path}"
    assert os.path.isdir(migrations_dir), f"migrations dir not found at {migrations_dir}"

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        tmp_db_path = tmp_file.name

    try:
        sqlite_url = f"sqlite:///{pathlib.Path(tmp_db_path).as_posix()}"
        alembic_cfg = Config(ini_path)
        alembic_cfg.set_main_option("script_location", migrations_dir)
        alembic_cfg.set_main_option("sqlalchemy.url", sqlite_url)

        # 1. Upgrade to head
        command.upgrade(alembic_cfg, "head")

        # Inspect created tables in database
        engine = sa.create_engine(sqlite_url)
        inspector = sa.inspect(engine)
        tables = set(inspector.get_table_names())

        expected_tables = {"users", "predictions", "model_artifacts", "alembic_version"}
        assert expected_tables.issubset(tables), f"Missing tables. Found: {tables}"

        # Verify users columns
        user_cols = {c["name"] for c in inspector.get_columns("users")}
        assert {"id", "email", "hashed_password", "role", "is_active", "created_at", "updated_at"}.issubset(user_cols)

        # Verify predictions columns
        pred_cols = {c["name"] for c in inspector.get_columns("predictions")}
        assert {"id", "user_id", "prediction_type", "property_inputs", "estimated_price", "currency", "currency_unit", "model_version"}.issubset(pred_cols)

        # Verify model_artifacts columns
        model_cols = {c["name"] for c in inspector.get_columns("model_artifacts")}
        assert {"id", "model_name", "model_version", "prediction_type", "artifact_path", "feature_schema", "metrics"}.issubset(model_cols)

        engine.dispose()

        # 2. Downgrade to base
        command.downgrade(alembic_cfg, "base")

        engine = sa.create_engine(sqlite_url)
        inspector = sa.inspect(engine)
        remaining_tables = set(inspector.get_table_names())
        engine.dispose()

        # Schema tables should be dropped (alembic_version remains or is empty)
        assert "users" not in remaining_tables
        assert "predictions" not in remaining_tables
        assert "model_artifacts" not in remaining_tables

    finally:
        if os.path.exists(tmp_db_path):
            try:
                os.remove(tmp_db_path)
            except OSError:
                pass
