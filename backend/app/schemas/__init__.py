"""Pydantic schemas package for Estora API."""

from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest
from app.schemas.user import UserBase, UserCreate, UserRead, UserUpdate
from app.schemas.prediction import (
    PredictionCreateRequest,
    PredictionListItem,
    PredictionResponse,
    SalePropertyInputs,
)
from app.schemas.analytics import AdminAnalyticsSummary, UserAnalyticsSummary

__all__ = [
    "TokenResponse",
    "UserLoginRequest",
    "UserRegisterRequest",
    "UserBase",
    "UserCreate",
    "UserRead",
    "UserUpdate",
    "PredictionCreateRequest",
    "PredictionListItem",
    "PredictionResponse",
    "SalePropertyInputs",
    "AdminAnalyticsSummary",
    "UserAnalyticsSummary",
]
