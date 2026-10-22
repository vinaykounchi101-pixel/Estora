"""Liveness, readiness, and system health endpoints."""

from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.config import settings
from app.integrations.ml_inference import REPO_ROOT

router = APIRouter()


@router.get("", summary="General service status")
def health_status():
    """Return basic platform identifier and active environment mode."""
    return {
        "status": "ok",
        "service": "estora-backend",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/live", summary="Process liveness probe")
def liveness_probe():
    """Liveness probe confirming the FastAPI application process is executing."""
    return {
        "status": "live",
        "service": "estora-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready", summary="Dependency readiness probe")
def readiness_probe(response: Response, db: Session = Depends(get_db)):
    """Readiness probe checking database and local model repository availability without exposing secrets."""
    dependencies = {}
    is_ready = True

    # 1. Check Database connection
    try:
        db.execute(text("SELECT 1"))
        dependencies["database"] = "connected"
    except Exception:
        dependencies["database"] = "disconnected"
        is_ready = False

    # 2. Check ML model artifact presence
    artifact_path = REPO_ROOT / "ml" / "artifacts" / "sale_price" / "pune_sale_v1.joblib"
    if artifact_path.exists():
        dependencies["model_artifacts"] = "available"
    else:
        dependencies["model_artifacts"] = "missing"
        is_ready = False

    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "dependencies": dependencies,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    return {
        "status": "ready",
        "dependencies": dependencies,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
