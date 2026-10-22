"""Unit tests for backend database settings and configuration."""

import pytest
from app.core.config import Settings


def test_default_database_settings():
    """Verify default connection components match expected project naming."""
    settings = Settings()
    assert settings.PROJECT_NAME == "Estora"
    assert settings.POSTGRES_SERVER == "localhost"
    assert settings.POSTGRES_PORT == 5432
    assert settings.POSTGRES_DB == "estora"
    assert settings.POSTGRES_USER == "postgres"
    assert settings.DATABASE_POOL_SIZE == 5
    assert settings.DATABASE_MAX_OVERFLOW == 10
    assert settings.DATABASE_POOL_PRE_PING is True


def test_constructed_sync_database_url_from_components():
    """Verify default sync database URL uses postgresql+psycopg2 driver."""
    settings = Settings(
        POSTGRES_SERVER="db.example.com",
        POSTGRES_PORT=5433,
        POSTGRES_USER="estora_user",
        POSTGRES_PASSWORD="secure_password",
        POSTGRES_DB="estora_prod",
    )
    expected = "postgresql+psycopg2://estora_user:secure_password@db.example.com:5433/estora_prod"
    assert settings.sync_database_url == expected


def test_direct_database_url_override():
    """Verify direct DATABASE_URL override takes precedence."""
    custom_url = "postgresql+psycopg2://custom:pass@custom-host:5432/custom_db"
    settings = Settings(DATABASE_URL=custom_url)
    assert settings.sync_database_url == custom_url


def test_postgres_protocol_normalization():
    """Verify postgres:// and postgresql:// are normalized to postgresql+psycopg2://."""
    s1 = Settings(DATABASE_URL="postgres://user:pass@host:5432/db")
    assert s1.sync_database_url == "postgresql+psycopg2://user:pass@host:5432/db"

    s2 = Settings(DATABASE_URL="postgresql://user:pass@host:5432/db")
    assert s2.sync_database_url == "postgresql+psycopg2://user:pass@host:5432/db"


def test_sqlite_url_preservation():
    """Verify SQLite URLs for testing are preserved verbatim."""
    sqlite_url = "sqlite:///./test.db"
    settings = Settings(DATABASE_URL=sqlite_url)
    assert settings.sync_database_url == sqlite_url
