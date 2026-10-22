"""SQLAlchemy sessionmaker, engine creation, and dependency injection."""

from typing import Generator, Optional
import sqlalchemy as sa
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def create_db_engine(database_url: Optional[str] = None) -> Engine:
    """Create a configured SQLAlchemy engine supporting PostgreSQL and SQLite (tests)."""
    url = database_url or settings.sync_database_url
    if url.startswith("sqlite"):
        return sa.create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=False
        )
    return sa.create_engine(
        url,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=settings.DATABASE_POOL_PRE_PING,
        echo=False
    )


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Provide a transactional database session scope for API requests."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
