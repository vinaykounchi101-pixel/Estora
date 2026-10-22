"""Pydantic schemas for Authentication endpoints."""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserRead


class UserRegisterRequest(BaseModel):
    """Payload for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password with minimum 8 characters")
    full_name: Optional[str] = Field(None, max_length=100)


class UserLoginRequest(BaseModel):
    """Payload for user login."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Authentication token response with serialized user info."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
