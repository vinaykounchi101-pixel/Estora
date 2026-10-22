"""Prediction repository encapsulating all database interactions for the predictions table."""

from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.prediction import Prediction


class PredictionRepository:
    """Data access repository for Prediction entities."""

    @staticmethod
    def create(
        db: Session,
        user_id: Optional[UUID],
        prediction_type: str,
        property_inputs: Dict[str, Any],
        estimated_price: Decimal | float,
        currency: str,
        currency_unit: str,
        model_version: str,
        supported_geography: str,
        disclaimer: str,
    ) -> Prediction:
        """Create and persist a new immutable property valuation record."""
        # Ensure Decimal precision
        decimal_price = Decimal(str(estimated_price)) if isinstance(estimated_price, float) else estimated_price

        prediction = Prediction(
            user_id=user_id,
            prediction_type=prediction_type,
            property_inputs=property_inputs,
            estimated_price=decimal_price,
            currency=currency,
            currency_unit=currency_unit,
            model_version=model_version,
            supported_geography=supported_geography,
            disclaimer=disclaimer,
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction

    @staticmethod
    def get_by_id(db: Session, prediction_id: UUID) -> Optional[Prediction]:
        """Fetch a single prediction by UUID primary key."""
        return db.get(Prediction, prediction_id)

    @staticmethod
    def list_by_user(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Prediction]:
        """Retrieve paginated prediction records belonging strictly to a specific user."""
        stmt = (
            select(Prediction)
            .where(Prediction.user_id == user_id)
            .order_by(Prediction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_by_user(db: Session, user_id: UUID) -> int:
        """Count total predictions authored by a specific user."""
        stmt = select(func.count(Prediction.id)).where(Prediction.user_id == user_id)
        return db.execute(stmt).scalar() or 0

    @staticmethod
    def list_all(db: Session, skip: int = 0, limit: int = 50) -> List[Prediction]:
        """Retrieve paginated predictions across all users (for admin review)."""
        stmt = (
            select(Prediction)
            .order_by(Prediction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count_all(db: Session) -> int:
        """Count total predictions stored in the database."""
        stmt = select(func.count(Prediction.id))
        return db.execute(stmt).scalar() or 0

    @staticmethod
    def get_user_analytics(db: Session, user_id: UUID) -> Dict[str, Any]:
        """Compute aggregate valuation statistics for a specific user."""
        total = PredictionRepository.count_by_user(db, user_id)
        
        # Count by domain target
        sale_count_stmt = select(func.count(Prediction.id)).where(
            Prediction.user_id == user_id,
            Prediction.prediction_type == "sale_price",
        )
        sale_count = db.execute(sale_count_stmt).scalar() or 0

        rent_count_stmt = select(func.count(Prediction.id)).where(
            Prediction.user_id == user_id,
            Prediction.prediction_type == "monthly_rent",
        )
        rent_count = db.execute(rent_count_stmt).scalar() or 0

        # Average estimated price for sale predictions
        avg_stmt = select(func.avg(Prediction.estimated_price)).where(
            Prediction.user_id == user_id,
            Prediction.prediction_type == "sale_price",
        )
        avg_price = db.execute(avg_stmt).scalar()

        return {
            "total_predictions": total,
            "sale_predictions": sale_count,
            "rent_predictions": rent_count,
            "average_sale_estimate_lakhs": round(float(avg_price), 2) if avg_price else None,
        }

    @staticmethod
    def get_global_analytics(db: Session) -> Dict[str, Any]:
        """Compute system-wide aggregates for administration."""
        total = PredictionRepository.count_all(db)

        sale_stmt = select(func.count(Prediction.id)).where(Prediction.prediction_type == "sale_price")
        sale_count = db.execute(sale_stmt).scalar() or 0

        rent_stmt = select(func.count(Prediction.id)).where(Prediction.prediction_type == "monthly_rent")
        rent_count = db.execute(rent_stmt).scalar() or 0

        return {
            "total_predictions": total,
            "sale_predictions": sale_count,
            "rent_predictions": rent_count,
        }
