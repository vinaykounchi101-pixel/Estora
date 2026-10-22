"""Pydantic schemas for Analytics summaries."""

from typing import List, Optional
from pydantic import BaseModel
from app.schemas.prediction import PredictionResponse


class UserAnalyticsSummary(BaseModel):
    """User-level aggregate statistics across personal prediction history."""
    total_predictions: int
    sale_predictions: int
    rent_predictions: int
    average_sale_estimate_lakhs: Optional[float] = None
    recent_predictions: List[PredictionResponse] = []


class AdminAnalyticsSummary(BaseModel):
    """System-wide aggregate statistics for platform administrators."""
    total_users: int
    total_predictions: int
    sale_predictions: int
    rent_predictions: int
    active_models_count: int
    system_status: str
