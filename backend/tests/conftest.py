"""Pytest fixtures for backend unit and API integration tests."""

from typing import Dict, Generator
import pytest
import sqlalchemy as sa
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_db
from app.core.security import get_password_hash
from app.db.base import Base
from app.main import app
from app.models.user import User


@pytest.fixture(scope="session")
def test_engine():
    """Create an in-memory SQLite engine with foreign key constraints enabled."""
    engine = sa.create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @sa.event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """Provide a clean transactional session for each unit test."""
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with overridden get_db dependency pointing to isolated SQLite memory."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Create and return a standard authenticated user for testing."""
    user = User(
        email="testuser@estora.internal",
        hashed_password=get_password_hash("Password123!"),
        full_name="Test Standard User",
        role="authenticated_user",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_admin(db_session: Session) -> User:
    """Create and return an administrator user for testing."""
    admin = User(
        email="admin@estora.internal",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Test Admin User",
        role="admin",
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def auth_headers(client: TestClient, test_user: User) -> Dict[str, str]:
    """Generate authorization headers for standard authenticated test user."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "Password123!"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def admin_headers(client: TestClient, test_admin: User) -> Dict[str, str]:
    """Generate authorization headers for administrative test user."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": test_admin.email, "password": "AdminPass123!"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
