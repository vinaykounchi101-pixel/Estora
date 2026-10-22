"""User repository encapsulating all database interactions for the users table."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Data access repository for User entities."""

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> Optional[User]:
        """Fetch a single user by primary key UUID."""
        return db.get(User, user_id)

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Fetch a user by exact email address (case-insensitive)."""
        stmt = select(User).where(func.lower(User.email) == email.lower().strip())
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create(
        db: Session,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        role: str = "authenticated_user",
    ) -> User:
        """Create and persist a new user record."""
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed_password,
            full_name=full_name.strip() if full_name else None,
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(
        db: Session,
        user: User,
        full_name: Optional[str] = None,
        email: Optional[str] = None,
        hashed_password: Optional[str] = None,
    ) -> User:
        """Update permitted fields on an existing user instance."""
        if full_name is not None:
            user.full_name = full_name.strip() if full_name else None
        if email is not None:
            user.email = email.lower().strip()
        if hashed_password is not None:
            user.hashed_password = hashed_password

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 50) -> List[User]:
        """Retrieve paginated list of users ordered by creation date descending."""
        stmt = select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_users(db: Session) -> int:
        """Count total user accounts."""
        stmt = select(func.count(User.id))
        return db.execute(stmt).scalar() or 0
