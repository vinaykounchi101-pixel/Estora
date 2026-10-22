"""Prediction service orchestrating ML inference with PostgreSQL persistence."""

from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.integrations.ml_inference import run_sale_inference
from app.models.prediction import Prediction
from app.models.user import User
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.prediction import PredictionCreateRequest, PredictionResponse
from real_estate_ml.inference.input_validation import InferenceValidationError


class PredictionService:
    """Orchestrator for property valuation requests, storage, and history."""

    @staticmethod
    def _map_prediction_to_response(pred: Prediction) -> PredictionResponse:
        """Map database Prediction model to client response schema."""
        price_lakhs = float(pred.estimated_price)
        price_inr = int(round(price_lakhs * 100000))
        return PredictionResponse(
            id=pred.id,
            user_id=pred.user_id,
            prediction_type=pred.prediction_type,
            property_inputs=pred.property_inputs,
            estimated_price_lakhs=price_lakhs,
            estimated_price_inr=price_inr,
            currency=pred.currency,
            currency_unit=pred.currency_unit,
            model_version=pred.model_version,
            supported_geography=pred.supported_geography,
            disclaimer=pred.disclaimer,
            created_at=pred.created_at,
        )

    @classmethod
    def create_prediction(
        cls,
        db: Session,
        request: PredictionCreateRequest,
        current_user: Optional[User] = None,
    ) -> PredictionResponse:
        """Process valuation request: run ML inference and persist snapshot to PostgreSQL."""
        if request.prediction_type != "sale_price":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Prediction target '{request.prediction_type}' is currently unavailable. "
                    "Phase 6 supports residential 'sale_price' estimation for Pune."
                ),
            )

        property_data = request.property_inputs.model_dump()

        try:
            inference_result = run_sale_inference(property_data)
        except InferenceValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Inference engine failure: {str(exc)}",
            )

        saved_pred = PredictionRepository.create(
            db=db,
            user_id=current_user.id if current_user else None,
            prediction_type=request.prediction_type,
            property_inputs=property_data,
            estimated_price=inference_result["estimated_price_lakhs"],
            currency=inference_result["currency"],
            currency_unit=inference_result["currency_unit"],
            model_version=inference_result["model_version"],
            supported_geography=inference_result["supported_geography"],
            disclaimer=inference_result["disclaimer"],
        )

        return cls._map_prediction_to_response(saved_pred)

    @classmethod
    def get_prediction_detail(
        cls,
        db: Session,
        prediction_id: UUID,
        current_user: User,
    ) -> PredictionResponse:
        """Retrieve an owned prediction detail; raises 404 or 403 if unauthorized."""
        pred = PredictionRepository.get_by_id(db, prediction_id)
        if not pred:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction record not found.",
            )

        if pred.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this prediction.",
            )

        return cls._map_prediction_to_response(pred)

    @classmethod
    def list_user_history(
        cls,
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> List[PredictionResponse]:
        """Fetch user's past predictions ordered by timestamp descending."""
        records = PredictionRepository.list_by_user(db, user_id=user_id, skip=skip, limit=limit)
        return [cls._map_prediction_to_response(p) for p in records]
