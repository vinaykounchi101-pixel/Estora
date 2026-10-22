"""User profile management endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get(
    "/me",
    response_model=UserRead,
    status_code=status.HTTP_200_OK,
    summary="Retrieve current user profile",
)
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    """Return the profile details for the currently authenticated user."""
    return UserRead.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserRead,
    status_code=status.HTTP_200_OK,
    summary="Update permitted profile fields",
)
def update_current_user_profile(
    request: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    """Update full name, email, or password for the authenticated account."""
    updated = UserService.update_profile(db, current_user, request)
    return UserRead.model_validate(updated)
