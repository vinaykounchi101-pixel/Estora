"""Authentication and account lifecycle service logic."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest
from app.schemas.user import UserRead


class AuthService:
    """Business logic for account registration, authentication, and token management."""

    @staticmethod
    def register_user(db: Session, req: UserRegisterRequest) -> User:
        """Register a new user account with unique email and bcrypt password hash."""
        existing_user = UserRepository.get_by_email(db, req.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        hashed_password = get_password_hash(req.password)
        user = UserRepository.create(
            db=db,
            email=req.email,
            hashed_password=hashed_password,
            full_name=req.full_name,
            role="authenticated_user",
        )
        return user

    @staticmethod
    def authenticate_user(db: Session, req: UserLoginRequest) -> User:
        """Authenticate user credentials and ensure active account status."""
        user = UserRepository.get_by_email(db, req.email)
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        return user

    @staticmethod
    def create_user_token(user: User) -> TokenResponse:
        """Generate JWT bearer token response for an authenticated user."""
        token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserRead.model_validate(user),
        )
