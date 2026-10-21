from pydantic import BaseModel
from typing import Optional

class PropertyBase(BaseModel):
    city: str
    locality: str
    property_type: str
    bhk: int
    bathrooms: int
    area_sqft: float
