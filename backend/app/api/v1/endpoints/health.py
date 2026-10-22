"""Health and system status check endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.config import settings

router = APIRouter()


@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Return health status, environment mode, and database connectivity."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": "estora-backend",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
    }
