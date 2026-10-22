"""Pydantic schemas for Prediction requests and responses."""

from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SalePropertyInputs(BaseModel):
    """Validated property features required for residential sale price estimation."""
    square_ft: float = Field(..., ge=150.0, le=8000.0, description="Property carpet/built-up area in square feet")
    bhk_no: int = Field(..., ge=1, le=10, description="Number of bedrooms (BHK)")
    latitude: float = Field(..., ge=17.90, le=19.30, description="Geographic latitude within Pune metropolitan region")
    longitude: float = Field(..., ge=73.20, le=75.30, description="Geographic longitude within Pune metropolitan region")
    posted_by: Literal["Owner", "Dealer", "Builder"] = Field(..., description="Entity listing the property")
    address: str = Field(..., min_length=2, max_length=200, description="Locality or address description (e.g. 'Wakad,Pune')")
    rera: int = Field(1, ge=0, le=1, description="RERA registered flag (1=yes, 0=no)")
    ready_to_move: int = Field(1, ge=0, le=1, description="Ready to move status (1=yes, 0=under construction)")
    resale: int = Field(1, ge=0, le=1, description="Resale status (1=resale, 0=new booking)")


class PredictionCreateRequest(BaseModel):
    """Payload to request an ML valuation estimate."""
    prediction_type: Literal["sale_price", "monthly_rent"] = Field(
        "sale_price",
        description="Target prediction domain ('sale_price' currently supported in Phase 6)",
    )
    property_inputs: SalePropertyInputs = Field(
        ...,
        description="Validated property feature values matching the target schema",
    )


class PredictionResponse(BaseModel):
    """Structured response contract for a completed property valuation."""
    id: UUID
    user_id: Optional[UUID] = None
    prediction_type: str
    property_inputs: dict[str, Any]
    estimated_price_lakhs: float
    estimated_price_inr: int
    currency: str = "INR"
    currency_unit: str = "INR Lakhs"
    model_version: str
    supported_geography: str
    disclaimer: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PredictionListItem(BaseModel):
    """Summary representation for paginated history listings."""
    id: UUID
    prediction_type: str
    locality: str
    square_ft: float
    bhk_no: int
    estimated_price_lakhs: float
    currency: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
