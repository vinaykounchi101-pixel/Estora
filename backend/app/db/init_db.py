"""Database seed and initialization routines.

Ensures initial model metadata and default administrator account are idempotently seeded.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.ml_model import ModelArtifact
from app.models.user import User

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent


def seed_model_artifacts(db: Session) -> None:
    """Idempotently seed the pune_sale_v1 metadata manifest into model_artifacts table."""
    metadata_path = REPO_ROOT / "ml" / "artifacts" / "sale_price" / "pune_sale_v1_metadata.json"
    if not metadata_path.exists():
        return

    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    existing = db.query(ModelArtifact).filter(ModelArtifact.model_version == meta["model_version"]).first()
    if existing:
        return

    # Parse trained_at timestamp
    trained_at_str = meta.get("trained_at", datetime.now(timezone.utc).isoformat())
    try:
        trained_at = datetime.fromisoformat(trained_at_str)
    except Exception:
        trained_at = datetime.now(timezone.utc)

    artifact = ModelArtifact(
        model_name=meta["model_name"],
        model_version=meta["model_version"],
        prediction_type="sale_price",
        artifact_path=str(Path("ml/artifacts/sale_price/pune_sale_v1.joblib")),
        feature_schema=meta.get("feature_schema", {}),
        metrics=meta.get("evaluation_metrics", {}),
        supported_geography="Pune, Maharashtra, India",
        is_active=True,
        trained_at=trained_at,
    )
    db.add(artifact)
    db.commit()


from sqlalchemy import func
from app.core.config import settings


def seed_initial_admin(db: Session, admin_email: str | None = None, initial_password: str | None = None) -> None:
    """Idempotently seed or synchronize the system administrator user driven by environment variables."""
    email = (admin_email or settings.ADMIN_EMAIL).strip().lower()
    password = initial_password or settings.ADMIN_PASSWORD
    name = settings.ADMIN_NAME

    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        existing.role = "admin"
        existing.is_active = True
        existing.hashed_password = get_password_hash(password)
        if name:
            existing.full_name = name
        db.commit()
        return

    admin_user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=name,
        role="admin",
        is_active=True,
    )
    db.add(admin_user)
    db.commit()


def init_db(db: Session) -> None:
    """Run all idempotent database seed routines."""
    seed_model_artifacts(db)
    seed_initial_admin(db)
