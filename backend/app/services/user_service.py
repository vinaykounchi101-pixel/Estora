"""User profile management service logic."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate


class UserService:
    """Business logic for user profile retrieval and modifications."""

    @staticmethod
    def update_profile(db: Session, current_user: User, req: UserUpdate) -> User:
        """Update permitted profile attributes for the authenticated user."""
        new_hashed_password = None
        if req.password:
            new_hashed_password = get_password_hash(req.password)

        if req.email and req.email.lower().strip() != current_user.email.lower():
            existing = UserRepository.get_by_email(db, req.email)
            if existing and existing.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email address is already in use by another account.",
                )

        updated_user = UserRepository.update(
            db=db,
            user=current_user,
            full_name=req.full_name,
            email=req.email,
            hashed_password=new_hashed_password,
        )
        return updated_user
