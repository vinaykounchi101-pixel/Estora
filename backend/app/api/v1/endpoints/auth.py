"""Authentication endpoints for account registration, login, and session termination."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserRead:
    """Register a new user account with validated email and password."""
    user = AuthService.register_user(db, request)
    return UserRead.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and issue JWT access token",
)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Validate user credentials and return a signed Bearer token with expiration."""
    user = AuthService.authenticate_user(db, request)
    return AuthService.create_user_token(user)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Log out active session",
)
def logout(
    current_user: User = Depends(get_current_user),
) -> dict:
    """End active user session (client clears local token)."""
    return {"message": "Successfully logged out.", "email": current_user.email}
