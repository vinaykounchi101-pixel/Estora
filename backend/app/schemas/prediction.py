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


class SalePriceInferenceRequest(BaseModel):
    """Stateless ML inference request containing the exact nine required property features."""
    square_ft: float = Field(..., ge=150.0, le=8000.0, description="Built-up/carpet area in square feet [150.0, 8000.0]")
    bhk_no: int = Field(..., ge=1, le=10, description="Bedroom count (BHK) [1, 10]")
    latitude: float = Field(..., ge=17.90, le=19.30, description="Decimal latitude within Pune metropolitan bounds [17.90, 19.30]")
    longitude: float = Field(..., ge=73.20, le=75.30, description="Decimal longitude within Pune metropolitan bounds [73.20, 75.30]")
    posted_by: Literal["Owner", "Dealer", "Builder"] = Field(..., description="Entity listing the property: Owner, Dealer, or Builder")
    address: str = Field(..., min_length=1, max_length=200, description="Micro-market or locality identifier (e.g. 'Wakad,Pune')")
    rera: int = Field(..., ge=0, le=1, description="RERA registered flag (0 = non-RERA, 1 = RERA approved)")
    ready_to_move: int = Field(..., ge=0, le=1, description="Ready to move status (0 = under construction, 1 = ready)")
    resale: int = Field(..., ge=0, le=1, description="Resale flag (0 = new booking, 1 = resale)")


class SalePriceInferenceResponse(BaseModel):
    """Structured response contract for stateless Pune residential property valuation."""
    estimated_price_lakhs: float = Field(..., description="Predicted sale price in INR Lakhs")
    estimated_price_inr: int = Field(..., description="Derived integer price in Indian Rupees (INR)")
    currency: str = Field("INR", description="Currency code (INR)")
    currency_unit: str = Field("INR Lakhs", description="Currency unit (INR Lakhs)")
    model_name: str = Field(..., description="Name of the model artifact used for prediction")
    model_version: str = Field(..., description="Version of the model artifact used for prediction")
    prediction_type: str = Field("sale_price", description="Target estimation category")
    supported_geography: str = Field(..., description="Supported geographic coverage (e.g. 'Pune, Maharashtra')")
    disclaimer: str = Field(..., description="Decision support disclaimer regarding historical asking prices")

    model_config = ConfigDict(from_attributes=True)
