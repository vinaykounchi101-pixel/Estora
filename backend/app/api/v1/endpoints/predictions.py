"""Property valuation and prediction history endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db, get_optional_current_user
from app.models.user import User
from app.schemas.prediction import PredictionCreateRequest, PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.post(
    "",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a residential property valuation estimate",
)
def create_prediction(
    request: PredictionCreateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    """Execute ML price inference on property features and persist valuation snapshot.

    Available to both authenticated users and anonymous visitors.
    """
    return PredictionService.create_prediction(
        db=db,
        request=request,
        current_user=current_user,
    )


@router.get(
    "",
    response_model=List[PredictionResponse],
    status_code=status.HTTP_200_OK,
    summary="List authenticated user's prediction history",
)
def list_user_predictions(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[PredictionResponse]:
    """Retrieve historical valuations authored by the current user, ordered newest first."""
    return PredictionService.list_user_history(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{prediction_id}",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve detail of a specific owned prediction",
)
def get_prediction_detail(
    prediction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    """Fetch complete snapshot and estimate of a specific prediction (must own or be admin)."""
    return PredictionService.get_prediction_detail(
        db=db,
        prediction_id=prediction_id,
        current_user=current_user,
    )
