"""Administrative management endpoints restricted to admin role."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_db
from app.models.user import User
from app.repositories.model_repository import ModelRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.analytics import AdminAnalyticsSummary
from app.schemas.prediction import PredictionResponse
from app.schemas.user import UserRead
from app.services.analytics_service import AnalyticsService
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.get(
    "/users",
    response_model=List[UserRead],
    status_code=status.HTTP_200_OK,
    summary="List all users (Admin only)",
)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> List[UserRead]:
    """Retrieve paginated list of all registered platform users."""
    users = UserRepository.list_users(db, skip=skip, limit=limit)
    return [UserRead.model_validate(u) for u in users]


@router.get(
    "/predictions",
    response_model=List[PredictionResponse],
    status_code=status.HTTP_200_OK,
    summary="Review all property predictions (Admin only)",
)
def list_all_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> List[PredictionResponse]:
    """Retrieve paginated log of all valuation estimates submitted on the platform."""
    predictions = PredictionRepository.list_all(db, skip=skip, limit=limit)
    return [PredictionService._map_prediction_to_response(p) for p in predictions]


@router.get(
    "/models",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="View active model registry metadata (Admin only)",
)
def list_model_registry(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """List registered and deployed machine learning model versions and validation metrics."""
    models = ModelRepository.list_all(db)
    return [
        {
            "id": str(m.id),
            "model_name": m.model_name,
            "model_version": m.model_version,
            "prediction_type": m.prediction_type,
            "artifact_path": m.artifact_path,
            "feature_schema": m.feature_schema,
            "metrics": m.metrics,
            "supported_geography": m.supported_geography,
            "is_active": m.is_active,
            "trained_at": m.trained_at.isoformat() if m.trained_at else None,
        }
        for m in models
    ]


@router.get(
    "/analytics",
    response_model=AdminAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="System-wide administrative analytics (Admin only)",
)
def get_system_analytics(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminAnalyticsSummary:
    """Retrieve operational totals across users, predictions, and models."""
    return AnalyticsService.get_admin_summary(db)
