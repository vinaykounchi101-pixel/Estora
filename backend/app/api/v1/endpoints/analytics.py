"""Analytics and summary statistics endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.analytics import UserAnalyticsSummary
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get(
    "/summary",
    response_model=UserAnalyticsSummary,
    status_code=status.HTTP_200_OK,
    summary="Retrieve user valuation portfolio summary",
)
def get_user_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserAnalyticsSummary:
    """Return aggregate statistics across personal property valuation history."""
    return AnalyticsService.get_user_summary(db=db, user_id=current_user.id)
