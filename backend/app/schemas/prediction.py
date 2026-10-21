from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime

class PredictionRequest(BaseModel):
    target: str = Field(..., description="'sale_price' or 'monthly_rent'")
    features: Dict[str, Any]

class PredictionResponse(BaseModel):
    id: str
    target: str
    estimated_amount: int
    currency: str = "INR"
    model_version: str
    disclaimer: str
    created_at: datetime
